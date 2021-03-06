package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/auth0/go-jwt-middleware"
	"github.com/codegangsta/negroni"
	"github.com/dgrijalva/jwt-go"
	"github.com/dummy-ai/mvp/master-server/models"
	"github.com/go-redis/redis"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	"github.com/levigross/grequests"
	"gopkg.in/yaml.v2"
	kube "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"net/http"
	"os"
	"sort"
	"strconv"
	"time"
)

var db *gorm.DB
var kvstore *redis.Client
var kubeClient *kube.Clientset

func printRequest(r *http.Request, args ...interface{}) error {
	if r == nil {
		return errors.New("Cannot print nil request")
	}
	fmt.Printf("%s %s %s %s %v\n", r.RemoteAddr, r.Method, r.URL.Path, r.Proto, args)
	return nil
}

func AuthenticationError(w http.ResponseWriter, r *http.Request, err string) {
	fmt.Println("header", r.Header)
	fmt.Println("[Authentication] Error: ", err)
	w.WriteHeader(400)
	w.Write([]byte("Authorization Error: " + err))
}

func CreateClient(kubeconfig string) *kube.Clientset {
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err)
	}

	client, err := kube.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	return client
}

func GetModelPath(user string, name string, tag string) string {
	return fmt.Sprintf("/model/%s/%s/%s", user, name, tag)
}

func sayHello(w http.ResponseWriter, r *http.Request) {
	response, _ := json.Marshal(map[string]string{
		"status": "OK",
	})
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func ping(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]

	if user == "" {
		http.Error(w, "User name cannot be empty", 400)
		return
	}
	printRequest(r, "user", user)

	response, _ := json.Marshal(map[string]string{
		"status": "OK",
	})
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func getRepoURL(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	fmt.Println("[GET] Repo URL", query)

	user := query.Get("user") // dummy user
	name := query.Get("name") // project name

	if user == "" {
		http.Error(w, "User name cannot be empty", 400)
		return
	}

	if name == "" {
		http.Error(w, "Project name cannot be empty", 400)
		return
	}

	url, err := GetRepoURL(user, name)
	if err != nil {
		http.Error(w,
			fmt.Sprintf("Cannot get repo URL. Reason: %s", err.Error()),
			500)
		return
	}

	fmt.Println("url = ", url)
	response, _ := json.Marshal(map[string]string{
		"url": url,
	})
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)

}

// contentType: by default is "application/octet-stream". Set to "ignore" to not
// use this in GCS sign.
func getDataURL(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	user := query.Get("user")   // dummy user
	name := query.Get("name")   // project name
	cloud := query.Get("cloud") // cloud provider: gcloud
	verb := query.Get("verb")   // HTTP verb: PUT | GET
	path := query.Get("path")   // path to object
	contentType := query.Get("content-type")

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	if cloud == "" {
		cloud = "gcloud"
	}

	fmt.Println("[GET] Data URL from Cloud Provider " + cloud)

	var url string
	var err error

	if cloud == "gcloud" {
		// Signed URL from Google Cloud Storage.
		url, err = GetGCloudStorageURL(user, name, path, verb, contentType)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		fmt.Println(url)
	}

	response, _ := json.Marshal(map[string]string{
		"url": url,
	})
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func listModels(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]

	var err error
	var ms []models.Model

	if user == "_" {
		ms, err = models.ListModelAll(db)
	} else {
		ms, err = models.ListModelByUser(db, user)
	}

	if err != nil {
		http.Error(w, fmt.Sprintf("Error: %s", err.Error()), 500)
		return
	}

	// Convert model objects to maps.
	var results []map[string]interface{}
	for _, model := range ms {
		metadata := model.ToMap()
		// name := metadata["name"].(string)
		// tag := metadata["tag"].(string)

		// Disable status probe to save response time.
		// metadata["status"] = getModelStatus(user, name, tag)
		metadata["status"] = "UNKNOWN"
		results = append(results, metadata)
	}

	sort.Sort(models.ModelList(results))

	response, _ := json.Marshal(results)
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func listModelTags(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["user"]
	modelName := vars["model"]

	var err error
	var ms []models.Model

	ms, err = models.ListModelByUserAndName(db, userId, modelName)

	if err != nil {
		http.Error(w, fmt.Sprintf("Error: %s", err.Error()), 500)
		return
	}

	var results []map[string]interface{}

	for _, model := range ms {
		results = append(results, model.ToMap())
	}

	// Special handling for empty list.
	// json.Marshal would return "null".
	if len(results) == 0 {
		w.Write([]byte("[]"))
		return
	}

	response, err := json.Marshal(results)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error: %s", err.Error()), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func postLanding(w http.ResponseWriter, r *http.Request) {
	// Read request JSON.
	var data map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Unable to read the HTTP request body", 400)
		return
	}

	fmt.Println("[POST] A new user is landing", data)

	landing := models.Landing{
		Email: data["email"].(string),
	}

	err = models.AddLanding(db, landing)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(200)
}

func getAuth(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	fmt.Println("[GET] User Auth with Code", query)

	code := query.Get("code") // dummy user
	redirect_uri := query.Get("redirect_uri")

	// Get authentication token.
	resp, err := grequests.Post("https://dummyai.auth0.com/oauth/token",
		&grequests.RequestOptions{
			Headers: map[string]string{
				"Content-type": "application/x-www-form-urlencoded",
			},
			Data: map[string]string{
				"client_id":     "MJciGnUXnD850clHoLM4tkltFlkgJGPs",
				"redirect_uri":  redirect_uri,
				"client_secret": "Ck7IWvxkZ0rXq4AVIe6wzP_VNJk1bYRG7rV_IAzdNcE5UKKKItLfdBIPPWfma9Jb",
				"code":          code,
				"grant_type":    "authorization_code",
			}})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var data map[string]interface{}
	if err := resp.JSON(&data); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	resp, err = grequests.Get("https://dummyai.auth0.com/userinfo?access_token="+data["access_token"].(string),
		&grequests.RequestOptions{})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var profile map[string]interface{}
	if err := resp.JSON(&profile); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	data["profile"] = profile
	response, err := json.Marshal(data)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	w.Write(response)
}

// TODO: put lock on this.
func putModel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	var params map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	commit := ""
	if _, ok := params["commit"]; ok {
		commit = params["commit"].(string)
	}

	fmt.Println(fmt.Sprintf("[PUT] Create / Update model metadata %s/%s:%s",
		user, name, tag))

	model, err := models.GetModelById(db, models.ModelId(user, name, tag))
	if err == nil { // Model already exists. Update it.
		// Merge metdata.
		var currMetadata map[interface{}]interface{}
		yaml.Unmarshal([]byte(model.Metadata), &currMetadata)

		var newMetadata map[interface{}]interface{}
		yaml.Unmarshal([]byte(params["metadata"].(string)), &newMetadata)

		updateInterfaceMap(currMetadata, newMetadata)

		// Overwrite Spec.
		var specYAML string
		if params["spec"] != nil {
			specYAML = params["spec"].(string)
		} else {
			specYAML = model.Spec
		}

		if commit == "" {
			commit = model.Commit
		}

		metadataBytes, err := yaml.Marshal(cleanupInterfaceMap(currMetadata))
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		metadataYAML := string(metadataBytes)

		fmt.Println("Model metadata", metadataYAML)
		fmt.Println("Model spec", specYAML)

		model = models.Model{
			UserId:   vars["user"],
			Name:     vars["model"],
			Tag:      vars["tag"],
			Metadata: metadataYAML,
			Spec:     specYAML,
			Commit:   commit,
			Status:   model.Status,
		}

		models.UpdateModel(db, model)
		return
	} else { // Create a new model.
		model = models.Model{
			UserId:   vars["user"],
			Name:     vars["model"],
			Tag:      vars["tag"],
			Spec:     "",
			Metadata: params["metadata"].(string),
			Commit:   commit,
			Status:   "INACTIVE",
		}

		err = models.AddModel(db, model)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.WriteHeader(200)
	}
}

func getUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]

	printRequest(r)

	if user == "" {
		http.Error(w, "Must provide a username to get his/her profile", 400)
		return
	}

	accessToken, err := GetAuth0AccessToken()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	users, err := GetAuth0UsersByQuery(accessToken, "username:"+user)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	if len(users) != 1 {
		http.Error(w, "Found no user or more than 1 users", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response, err := json.Marshal(users[0])
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to dump JSON: %s. %v", err.Error(), users[0]), 500)
		return
	}
	w.WriteHeader(200)
	w.Write(response)
}

func putModelPageView(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	printRequest(r)

	err := IncrPageViewCount(kvstore, models.ModelId(user, name, tag))
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
}

func getModelPageView(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	printRequest(r)

	result, err := GetPageViewCounts(kvstore, models.ModelId(user, name, tag))
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response, err := json.Marshal(result)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to dump JSON: %s. %v", err.Error(), result), 500)
		return
	}
	w.WriteHeader(200)
	w.Write(response)
}

func putModelDemoRun(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	printRequest(r)

	err := IncrDemoRunCount(kvstore, models.ModelId(user, name, tag))
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
}

func getModelDemoRun(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	printRequest(r)

	result, err := GetDemoRunCount(kvstore, models.ModelId(user, name, tag))
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response, err := json.Marshal(result)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to dump JSON: %s. %v", err.Error(), result), 500)
		return
	}
	w.WriteHeader(200)
	w.Write(response)
}
func teardownModel(user string, name string, tag string) error {
	deployName := getModelDeployName(user, name, tag)
	path := GetModelPath(user, name, tag)

	err := TeardownDeploy(kubeClient, deployName)
	if err != nil {
		return err
	}
	err = TeardownService(kubeClient, deployName)
	if err != nil {
		return err
	}
	err = RemoveServiceFromIngress(kubeClient, path)
	if err != nil {
		return err
	}

	return nil
}

func deleteModelWithTag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	printRequest(r, fmt.Sprintf("Deleting model %s/%s:%s", vars["user"], vars["model"], vars["tag"]))

	// Get ModelId based on user, model name and tag.
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	modelId := models.ModelId(user, name, tag)

	// Check if the model is live.
	status := getModelStatus(user, name, tag)
	if status == "LIVE" {
		err := teardownModel(user, name, tag)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
	}

	// Otherwise, delete the model from database.
	err := models.DeleteModel(db, modelId)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
}

func deleteModels(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	printRequest(r, fmt.Sprintf("Deleting model %s/%s:%s", vars["user"], vars["model"], vars["tag"]))

	// Get ModelId based on user, model name and tag.
	userId := vars["user"]
	modelName := vars["model"]

	ms, err := models.ListModelByUserAndName(db, userId, modelName)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	fmt.Println("models to delete", ms)

	for _, model := range ms {
		tag := model.Tag
		modelId := models.ModelId(userId, modelName, tag)
		// Check if the model is live.
		status := getModelStatus(userId, modelName, tag)
		if status == "LIVE" {
			err := teardownModel(userId, modelName, tag)
			if err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
		}

		// Delete the model from database.
		err := models.DeleteModel(db, modelId)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
	}

	w.WriteHeader(200)
}

func getModelDeployName(userId string, modelName string, tag string) string {
	modelId := models.ModelId(userId, modelName, tag)
	model, err := models.GetModelById(db, modelId)
	if err != nil {
		return ""
	}

	return GetDeployName(userId, modelName, tag, model.Commit)
}

func getModelStatus(userId string, modelName string, tag string) string {
	deployName := getModelDeployName(userId, modelName, tag)

	pods, err := GetPodsByDeployName(kubeClient, deployName)

	if err != nil {
		return models.StatusError
	}

	if len(pods) == 0 {
		return models.StatusInactive
	}

	phase := pods[0].Status.Phase
	fmt.Println("Pod phase", phase, deployName)

	if phase == "Pending" {
		return models.StatusPending
	} else if phase == "Running" {
		return models.StatusLive
	} else if phase == "Terminating" {
		return models.StatusTerminating
	} else {
		return models.StatusError
	}
}

func getModel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	printRequest(r, fmt.Sprintf("Get model %s/%s:%s", user, name, tag))

	w.Header().Set("Content-Type", "application/json")

	// Get ModelId based on user, model name and tag.
	modelId := models.ModelId(user, name, tag)
	// fmt.Printf("modelId = %s\n", modelId)

	model, err := models.GetModelById(db, modelId)
	var status string
	var metadataYAML string
	var specYAML string

	if model.Commit == "" {
		status = models.StatusEmpty
		metadataYAML = model.Metadata
		specYAML = model.Spec
	} else if err == nil {
		status = getModelStatus(user, name, tag)
		metadataYAML = model.Metadata
		specYAML = model.Spec
	} else {
		status = models.StatusNone
		metadataYAML = ""
		specYAML = ""
	}

	var metadata map[interface{}]interface{}
	yaml.Unmarshal([]byte(metadataYAML), &metadata)

	var spec map[interface{}]interface{}
	yaml.Unmarshal([]byte(specYAML), &spec)

	// By default YAML returns map[interface{}][interface{}} for nested maps.
	// See https://github.com/go-yaml/yaml/issues/139
	results := cleanupInterfaceMap(map[interface{}]interface{}{
		"status":   status,
		"metadata": metadata,
		"spec":     spec,
	})

	response, err := json.Marshal(results)
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to dump JSON: %s. %v", err.Error(), results), 500)
		return
	}
	w.WriteHeader(200)
	w.Write(response)
}

func postModel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	fmt.Printf("[POST] Changing the state of the model %s/%s:%s\n",
		user, name, tag)

	// Get ModelId based on user, model name and tag.
	modelId := models.ModelId(user, name, tag)
	fmt.Printf("modelId = %s\n", modelId)

	// Read request JSON.
	var data map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Unable to read the HTTP request body", 400)
		return
	}

	model, err := models.GetModelById(db, modelId)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	fmt.Println(model)

	if data["action"] == "deploy" {
		fmt.Println(fmt.Sprintf("[POST] Deploying model %s/%s:%s", user, name, tag))

		replicas, ok := data["replicas"].(int)
		if !ok {
			replicas = 1
		}
		deployName, err := CreateDeployV2(kubeClient, user, name, tag, model.Commit, model.Spec, replicas)
		if err != nil {
			http.Error(w, "Unable to create deployment. "+err.Error(), 500)
			return
		}

		err = CreateService(kubeClient, deployName)
		if err != nil {
			http.Error(w, "Unable to expose deployment as service. "+err.Error(), 500)
			// Rollback deployment.
			TeardownDeploy(kubeClient, deployName)
			return
		}

		path := GetModelPath(user, name, tag)

		RemoveServiceFromIngress(kubeClient, path)

		err = AddServiceToIngress(kubeClient, path, deployName)
		if err != nil {
			http.Error(w, "Unable to create Ingress endpoint for "+deployName, 500)
			// Rollback service and deployment.
			TeardownService(kubeClient, deployName)
			TeardownDeploy(kubeClient, deployName)
			return
		}

		w.WriteHeader(200)
		return
	} else if data["action"] == "ping" {
		w.WriteHeader(200)
		return
	} else if data["action"] == "teardown" {
		err = teardownModel(user, name, tag)
		if err != nil {
			http.Error(w, err.Error(), 500)
		}
		return
	} else {
		w.WriteHeader(400)
		w.Write([]byte(fmt.Sprintf("[POST] Deploying model using unknown action %s", data["action"])))
	}
}

func putJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	repo := vars["repo"]
	commit := vars["commit"]

	fmt.Println(fmt.Sprintf("[PUT] Create a new experiment job %s/%s:%s",
		user, repo, commit))

	// Check if the job already exists.
	_, err := models.GetJobById(db, models.JobId(user, repo, commit))
	if err == nil {
		http.Error(w, fmt.Sprintf("Experiment %s/%s:%s already exists",
			user, repo, commit), 500)
		return
	}

	// Extract parameters.
	var params map[string]interface{}
	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	yamlString := params["yaml"].(string)
	if yamlString == "" {
		http.Error(w, "Experiment YAML not provided", 400)
		return
	}

	// Launch job through Kubernetes controller.
	_, err = CreateJobV1(kubeClient, commit, yamlString)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create job %s", err.Error()), 500)
		return
	}

	// Write experiment job to database.
	var config map[string]interface{}
	yaml.Unmarshal([]byte(yamlString), &config)

	job := models.Job{
		UserId: user,
		Repo:   repo,
		Commit: commit,
		Name:   config["name"].(string),
		Yaml:   yamlString,
		Status: "PENDING",
	}

	err = models.AddJob(db, job)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(200)
	w.Write([]byte(""))
}

// For Jobs. Deprecated.
func logJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	repo := vars["repo"]
	commit := vars["commit"]

	fmt.Println(fmt.Sprintf("[PUT] Logging an experiment job %s/%s:%s",
		user, repo, commit))

	jobName := GetJobName(user, repo, commit)

	w.WriteHeader(200)
	err := StreamLogsFromJob(kubeClient, jobName, true, w)

	if err != nil {
		http.Error(w, fmt.Sprintf("Error: %s", err.Error()), 500)
	}
}

func logModel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["user"]
	modelName := vars["model"]
	tag := vars["tag"]

	modelId := models.ModelId(userId, modelName, tag)
	model, err := models.GetModelById(db, modelId)
	if err != nil {
		http.Error(w, err.Error(), 500)
	}

	follow, err := strconv.ParseBool(r.URL.Query().Get("follow"))
	if err != nil {
		http.Error(w, err.Error(), 500)
	}

	fmt.Println(fmt.Sprintf("[PUT] Logging a model deployment %s/%s:%s",
		userId, modelName, tag))

	w.WriteHeader(200)
	flushedWriter := FlushedWriter{HttpWriter: w}
	if err := StreamLogsFromModel(kubeClient, userId, modelName, tag, model.Commit, follow, &flushedWriter); err != nil {
		http.Error(w, err.Error(), 500)
	}
}

// Put a rating in the database.
// The request body contains a JSON object {"value": <rating_value>}
func putRating(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]
	modelId := vars["modelId"]

	printRequest(r)

	var params map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	value := params["value"].(float64)

	err = models.UpdateRating(db, userId, modelId, value)
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
}

// Get the rating from the database.
func getRating(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]
	modelId := vars["modelId"]

	printRequest(r)

	rating, err := models.GetRatingById(db, models.RatingId(userId, modelId))
	value := 0.

	if err == nil {
		value = rating.Value
	}

	w.WriteHeader(200)

	response, _ := json.Marshal(map[string]float64{
		"value": value,
	})
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

// Delete the rating from the database.
func deleteRating(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userId := vars["userId"]
	modelId := vars["modelId"]

	printRequest(r)

	err := models.DeleteRating(db, models.RatingId(userId, modelId))
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(200)
}

func putExample(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	printRequest(r)

	var params map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	var clientVersion string
	if clientVersionInterface, ok := params["clientVersion"]; ok {
		clientVersion = clientVersionInterface.(string)
	} else {
		http.Error(w, "putExample request must have key clientVersion", 400)
		return
	}

	var clientLatency float32
	if clientLatencyInterface, ok := params["clientLatency"]; ok {
		clientLatency = float32(clientLatencyInterface.(float64))
	} else {
		http.Error(w, "putExample request must have key clientLatency", 400)
		return
	}

	example := models.Example{
		Uid:           vars["exampleId"],
		ModelId:       vars["user"] + "/" + vars["model"] + ":" + vars["tag"],
		ClientLatency: clientLatency,
		ClientVersion: clientVersion,
	}

	err = models.AddExample(db, example)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(200)
}

func putDemoExample(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	example := models.DemoExample{
		Uid:     vars["exampleId"],
		ModelId: vars["user"] + "/" + vars["model"] + ":" + vars["tag"],
	}

	err := models.AddDemoExample(db, example)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(200)
}

func listExamples(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	modelId := vars["user"] + "/" + vars["model"] + ":" + vars["tag"]

	examples, err := models.ListExamples(db, modelId)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var results []map[string]interface{}
	for _, example := range examples {
		results = append(results, map[string]interface{}{
			"exampleId":     example.Uid,
			"modelId":       example.ModelId,
			"clientVersion": example.ClientVersion,
			"clientLatency": example.ClientLatency,
		})
	}

	response, _ := json.Marshal(results)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	w.Write(response)
}

func listDemoExamples(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	modelId := vars["user"] + "/" + vars["model"] + ":" + vars["tag"]

	examples, err := models.ListDemoExamples(db, modelId)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var results []map[string]interface{}
	for _, example := range examples {
		results = append(results, map[string]interface{}{
			"exampleId": example.Uid,
			"modelId":   example.ModelId,
		})
	}

	response, _ := json.Marshal(results)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	w.Write(response)
}

func main() {
	var err error

	// Initialize Global Constants based on environment variable.
	InitGlobal()

	if len(os.Args) < 2 {
		fmt.Println("Usage: master-server [migrate / start]")
		return
	}

	command := os.Args[1]

	if command == "migrate" {
		// migrate database schema.
		db = models.CreateDB(DBAddress)
		defer db.Close()

		models.MigrateDB(db)
	} else if command == "migrate092417" {
		// Migrate database schema.
		// Currently, model metadata are separate for every version of the model.
		// We want to have them share same metadata.
		db = models.CreateDB(DBAddress)
		db.Model(&models.Model{}).DropColumn("repo")
		models.MigrateDB(db)

	} else if command == "start" {
		// Database.
		db = models.CreateDB(DBAddress)
		kvstore = models.CreateKeyValueStore(RedisDBAddress, RedisDBPassword)
		kubeClient = CreateClient(KubeConfig)
		defer db.Close()

		// Authorization.
		jwtMiddleware := jwtmiddleware.New(jwtmiddleware.Options{
			ValidationKeyGetter: func(token *jwt.Token) (interface{}, error) {
				// https://github.com/dgrijalva/jwt-go/issues/147
				// Need to parse RSA public key first.
				key, _ := jwt.ParseRSAPublicKeyFromPEM([]byte(JWT_PUBLIC_KEY_CLI))
				return key, nil
			},
			// When set, the middleware verifies that tokens are signed with the specific signing algorithm
			// If the signing method is not constant the ValidationKeyGetter callback can be used to implement additional checks
			// Important to avoid security issues described here: https://auth0.com/blog/2015/03/31/critical-vulnerabilities-in-json-web-token-libraries/
			SigningMethod: jwt.SigningMethodRS256,
			ErrorHandler:  AuthenticationError,
		})
		fmt.Println(jwtMiddleware)

		// HTTP Router.
		router := mux.NewRouter()

		// Authentication based on JWT.
		router.Handle(`/git/{rest:[a-zA-Z0-9=\.\-\/]+}`, negroni.New(
			negroni.HandlerFunc(jwtMiddleware.HandlerWithNext),
			negroni.Wrap(GetGitRequestHandler()),
		))

		// No authentication. For debugging.
		// router.Handle(`/git/{rest:[a-zA-Z0-9=\-\/]+}`, GetGitRequestHandler())

		router.Handle("/ping/{user}", jwtMiddleware.Handler(http.HandlerFunc(ping))).Methods("GET")
		router.HandleFunc("/", sayHello).Methods("GET")
		router.HandleFunc("/url/code", getRepoURL).Methods("GET")
		router.HandleFunc("/url/data", getDataURL).Methods("GET")
		router.HandleFunc("/users/{user}/models/{model}/{tag}", getModel).Methods("GET")
		// PUT is used to create / update metadata. POST is used to control model deployments.
		router.HandleFunc("/users/{user}/models/{model}/{tag}", putModel).Methods("PUT")
		router.HandleFunc("/users/{user}/models/{model}/{tag}", postModel).Methods("POST")
		router.HandleFunc("/users/{user}/models/{model}", deleteModels).Methods("DELETE")
		router.HandleFunc("/users/{user}/models/{model}/{tag}", deleteModelWithTag).Methods("DELETE")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/log", logModel).Methods("GET")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/examples/{exampleId}", putExample).Methods("PUT")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/examples", listExamples).Methods("GET")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/demo-examples/{exampleId}", putDemoExample).Methods("PUT")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/demo-examples", listDemoExamples).Methods("GET")
		// Get user metadata.
		router.HandleFunc("/users/{user}", getUser).Methods("GET")
		// Endpoints for analytics.
		router.HandleFunc("/users/{user}/models/{model}/{tag}/analytics/page-view", putModelPageView).Methods("PUT")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/analytics/page-view", getModelPageView).Methods("GET")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/analytics/demo-run", putModelDemoRun).Methods("PUT")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/analytics/demo-run", getModelDemoRun).Methods("GET")
		// List models.
		router.HandleFunc("/users/{user}/models", listModels).Methods("GET")
		router.HandleFunc("/users/{user}/models/{model}", listModelTags).Methods("GET")
		router.HandleFunc("/job/{user}/{repo}/{commit}", putJob).Methods("PUT")
		router.HandleFunc("/job/{user}/{repo}/{commit}/log", logJob).Methods("GET")
		// Endpoints for manipulating user rating for models.
		router.HandleFunc(`/rating/{userId}/{modelId:(?:.|\/)*}`, putRating).Methods("PUT")
		router.HandleFunc("/rating/{userId}/{modelId:.*}", getRating).Methods("GET")
		router.HandleFunc(`/rating/{userId}/{modelId:[.\/]*}`, deleteRating).Methods("DELETE")
		// Other endpoints.
		router.HandleFunc("/landing", postLanding).Methods("POST")
		router.HandleFunc("/auth", getAuth).Methods("GET")

		fmt.Println(fmt.Sprintf("0.0.0.0:%d", MasterPort))
		fmt.Println("Starting HTTP master server")
		server := &http.Server{
			Handler:      router,
			Addr:         fmt.Sprintf("0.0.0.0:%d", MasterPort),
			WriteTimeout: 3600 * time.Second,
			ReadTimeout:  3600 * time.Second,
		}
		err = server.ListenAndServe()
		if err != nil {
			panic(err)
		}

	} else {
		panic("Unknown command " + command)
	}
}
