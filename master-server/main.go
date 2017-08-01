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
	"gopkg.in/yaml.v2"
	kube "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"net/http"
	"os"
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

func listModel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]

	ms, err := models.ListModelByUser(db, user)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error: %s", err.Error()), 500)
		return
	}

	var results []map[string]string

	for _, model := range ms {
		results = append(results, map[string]string{
			"uid":    model.Uid,
			"name":   model.Name,
			"tag":    model.Tag,
			"status": model.Status,
		})
	}

	response, _ := json.Marshal(results)
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

func putModel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	fmt.Println(fmt.Sprintf("[PUT] Create a new model %s/%s:%s",
		user, name, tag))

	// Check if the model already exists.
	_, err := models.GetModelById(db, models.ModelId(user, name, tag))
	if err == nil {
		http.Error(w, fmt.Sprintf("Model %s/%s:%s already exists",
			user, name, tag), 500)
		return
	}

	var params map[string]interface{}
	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	model := models.Model{
		UserId: vars["user"],
		Name:   vars["model"],
		Tag:    vars["tag"],
		Yaml:   params["yaml"].(string),
		Commit: params["commit"].(string),
		Status: "INACTIVE",
	}

	err = models.AddModel(db, model)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(200)
}

func deleteModel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	printRequest(r, fmt.Sprintf("Deleting model %s/%s:%s", vars["user"], vars["model"], vars["tag"]))

	// Get ModelId based on user, model name and tag.
	modelId := models.ModelId(vars["user"], vars["model"], vars["tag"])

	// Check if the model is active.
	model, err := models.GetModelById(db, modelId)
	isActive := model.Status == "LIVE"
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	if isActive {
		http.Error(w, "Unable to delete model, because the model is live. Unpublish it first", 500)
		return
	}

	// Otherwise, delete the model from database.
	err = models.DeleteModel(db, modelId)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
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
	fmt.Printf("modelId = %s\n", modelId)

	model, err := models.GetModelById(db, modelId)

	status := "UNKNOWN"
	yamlString := ""

	if err == nil {
		fmt.Println(model)

		status = model.Status
		yamlString = model.Yaml
	}

	results := map[string]string{
		"status": status,
		"yaml":   yamlString,
	}

	response, _ := json.Marshal(results)
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

		model.Status = "LIVE"
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

		model.Status = "INACTIVE"
		models.UpdateModel(db, model)
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
		db = models.CreateDB()
		defer db.Close()

		models.MigrateDB(db)
	} else if command == "start" {
		// Database.
		db = models.CreateDB()
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
		router.Handle(`/git/{rest:[a-zA-Z0-9=\-\/]+}`, negroni.New(
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
		router.HandleFunc("/users/{user}/models/{model}/{tag}", putModel).Methods("PUT")
		router.HandleFunc("/users/{user}/models/{model}/{tag}", deleteModel).Methods("DELETE")
		router.HandleFunc("/users/{user}/models/{model}/{tag}", postModel).Methods("POST")
		router.HandleFunc("/users/{user}/models", listModel).Methods("GET")
		router.HandleFunc("/job/{user}/{repo}/{commit}", putJob).Methods("PUT")
		router.HandleFunc("/job/{user}/{repo}/{commit}/log", logJob).Methods("GET")
		router.HandleFunc("/landing", postLanding).Methods("POST")

		fmt.Println(fmt.Sprintf("0.0.0.0:%d", MasterPort))
		fmt.Println("Starting HTTP master server")
		server := &http.Server{
			Handler:      router,
			Addr:         fmt.Sprintf("0.0.0.0:%d", MasterPort),
			WriteTimeout: 15 * time.Second,
			ReadTimeout:  15 * time.Second,
		}
		err = server.ListenAndServe()
		if err != nil {
			panic(err)
		}

	} else {
		panic("Unknown command " + command)
	}
}
