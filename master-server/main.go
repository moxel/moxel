package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/auth0/go-jwt-middleware"
	"github.com/codegangsta/negroni"
	"github.com/dgrijalva/jwt-go"
	"github.com/dummy-ai/mvp/master-server/models"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	"github.com/levigross/grequests"
	"gopkg.in/yaml.v2"
	kube "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"net/http"
	"os"
	"strconv"
	"time"
)

var db *gorm.DB
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

func getDataURL(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	user := query.Get("user")   // dummy user
	name := query.Get("name")   // project name
	cloud := query.Get("cloud") // cloud provider: gcloud
	verb := query.Get("verb")   // HTTP verb: PUT | GET
	path := query.Get("path")   // path to object

	fmt.Println("[GET] Data URL from Cloud Provider " + cloud)

	var url string
	var err error

	if cloud == "gcloud" {
		// Signed URL from Google Cloud Storage.
		url, err = GetGCloudStorageURL(user, name, path, verb)
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

	var results []map[string]interface{}

	for _, model := range ms {
		results = append(results, model.ToMap())
	}

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

	fmt.Println(fmt.Sprintf("[PUT] Create a new model %s/%s:%s",
		user, name, tag))

	// Check if the model already exists.
	model, err := models.GetModelById(db, models.ModelId(user, name, tag))
	if err == nil {
		// http.Error(w, fmt.Sprintf("Model %s/%s:%s already exists", user, name, tag), 500)
		// Model already exists. Update the metadata.
		// TODO: use transaction to avoid race.
		// First merge YAML.
		var currMetadata map[interface{}]interface{}
		yaml.Unmarshal([]byte(model.Yaml), &currMetadata)

		var newMetadata map[interface{}]interface{}
		yaml.Unmarshal([]byte(params["yaml"].(string)), &newMetadata)

		updateInterfaceMap(currMetadata, newMetadata)

		if commit == "" {
			commit = model.Commit
		}

		status := model.Status

		yamlBytes, err := yaml.Marshal(cleanupInterfaceMap(currMetadata))
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		yamlString := string(yamlBytes)

		fmt.Println(yamlString)

		model = models.Model{
			UserId: vars["user"],
			Name:   vars["model"],
			Tag:    vars["tag"],
			Yaml:   yamlString,
			Commit: commit,
			Status: status,
		}

		models.UpdateModel(db, model)
		return
	} else {
		// Create a new model.
		model = models.Model{
			UserId: vars["user"],
			Name:   vars["model"],
			Tag:    vars["tag"],
			Yaml:   params["yaml"].(string),
			Commit: commit,
			Status: "INACTIVE",
		}

		err = models.AddModel(db, model)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}

		w.WriteHeader(200)
	}
}

func deleteModel(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, "Unable to delete model, because the model is live. Unpublish it first", 500)
		return
	}

	// Otherwise, delete the model from database.
	err := models.DeleteModel(db, modelId)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
}

func getModelStatus(userId string, modelName string, tag string) string {
	deployName := GetDeployName(userId, modelName, tag)

	pods, err := GetPodsByDeployName(kubeClient, deployName)

	if err != nil {
		return "ERROR"
	}

	if len(pods) == 0 {
		return "INACTIVE"
	}

	phase := pods[0].Status.Phase

	if phase == "Pending" {
		return "PENDING"
	} else if phase == "Running" {
		return "LIVE"
	} else if phase == "Terminating" {
		return "TERMINATING"
	} else {
		return "ERROR"
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
	var yamlString string
	if err == nil {
		status = getModelStatus(user, name, tag)
		yamlString = model.Yaml
	} else {
		status = "NONE"
		yamlString = ""
	}

	// fmt.Println(model)

	// Convert YAML into JSON.
	var metadata map[interface{}]interface{}
	yaml.Unmarshal([]byte(yamlString), &metadata)

	// By default YAML returns map[interface{}][interface{}} for nested maps.
	// See https://github.com/go-yaml/yaml/issues/139
	results := cleanupInterfaceMap(map[interface{}]interface{}{
		"status":   status,
		"yaml":     yamlString,
		"metadata": metadata,
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
		deployName, err := CreateDeployV2(kubeClient, user, name, tag, model.Commit, model.Yaml, replicas)
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

		err = AddServiceToIngress(kubeClient, path, deployName)
		if err != nil {
			http.Error(w, "Unable to create Ingress endpoint for "+deployName, 500)
			// Rollback service and deployment.
			TeardownService(kubeClient, deployName)
			TeardownDeploy(kubeClient, deployName)
			return
		}

		models.UpdateModel(db, model)

		w.WriteHeader(200)
		return
	} else if data["action"] == "ping" {
		w.WriteHeader(200)
		return
	} else if data["action"] == "teardown" {
		deployName := GetDeployName(user, name, tag)
		path := GetModelPath(user, name, tag)

		err = TeardownDeploy(kubeClient, deployName)
		if err != nil {
			fmt.Println(err.Error())
		}
		err = TeardownService(kubeClient, deployName)
		if err != nil {
			fmt.Println(err.Error())
		}
		err := RemoveServiceFromIngress(kubeClient, path)
		if err != nil {
			fmt.Println(err.Error())
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
	modelId := vars["model"]
	tag := vars["tag"]

	follow, err := strconv.ParseBool(r.URL.Query().Get("follow"))
	if err != nil {
		http.Error(w, err.Error(), 500)
	}

	fmt.Println(fmt.Sprintf("[PUT] Logging a model deployment %s/%s:%s",
		userId, modelId, tag))

	w.WriteHeader(200)
	flushedWriter := FlushedWriter{HttpWriter: w}
	if err := StreamLogsFromModel(kubeClient, userId, modelId, tag, follow, &flushedWriter); err != nil {
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
	} else if command == "start" {
		// Database.
		db = models.CreateDB(DBAddress)
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
		router.HandleFunc("/users/{user}/models/{model}/{tag}", deleteModel).Methods("DELETE")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/log", logModel).Methods("GET")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/examples/{exampleId}", putExample).Methods("PUT")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/examples", listExamples).Methods("GET")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/demo-examples/{exampleId}", putDemoExample).Methods("PUT")
		router.HandleFunc("/users/{user}/models/{model}/{tag}/demo-examples", listDemoExamples).Methods("GET")
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
