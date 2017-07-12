package main

import (
	"encoding/json"
	"fmt"
	"github.com/dummy-ai/mvp/master-server/models"
	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	"io/ioutil"
	kube "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"net/http"
	"os"
	"time"
)

var db *gorm.DB
var kubeClient *kube.Clientset

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

func sayHello(w http.ResponseWriter, r *http.Request) {
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

func putModel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	var params map[string]interface{}

	fmt.Println(fmt.Sprintf("[PUT] Create a new model %s/%s:%s",
		vars["user"], vars["model"], vars["tag"]))

	err := json.NewDecoder(r.Body).Decode(&params)
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

	fmt.Println(fmt.Sprintf("[DELETE] Removing a model %s/%s:%s",
		vars["user"], vars["model"], vars["tag"]))

	// Get ModelId based on user, model name and tag.
	modelId := models.ModelId(vars["user"], vars["model"], vars["tag"])

	// Check if the model is active.
	isActive := models.GetModelById(db, modelId).Status == "LIVE"

	if isActive {
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

func postModel(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	fmt.Println(fmt.Sprintf("[POST] Changing the state of the model %s/%s:%s",
		user, name, tag))

	// Get ModelId based on user, model name and tag.
	modelId := models.ModelId(user, name, tag)

	// Read request JSON.
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read the HTTP request body", 400)
		return
	}
	var data map[string]interface{}
	json.Unmarshal(body, &data)

	model := models.GetModelById(db, modelId)

	fmt.Println(model)

	if data["action"] == "deploy" {
		fmt.Println(fmt.Sprintf("[POST] Deploying model %s/%s:%s", user, name, tag))

		replicas, ok := data["replicas"].(int)
		if !ok {
			replicas = 1
		}
		deployName, err := CreateDeployV2(kubeClient, model.Commit, model.Yaml, replicas)
		if err != nil {
			http.Error(w, "Unable to create deployment. "+err.Error(), 500)
			return
		}

		err = CreateService(kubeClient, deployName)
		if err != nil {
			http.Error(w, "Unable to expose deployment as service. "+err.Error(), 500)
			return
		}

		path := fmt.Sprintf("/model/%s/%s/%s", user, name, tag)
		err = AddServiceToIngress(kubeClient, path, deployName)
		if err != nil {
			http.Error(w, "Unable to create Ingress endpoint for "+deployName, 500)
			return
		}

		model.Status = "live"
		models.UpdateModel(db, model)

		w.WriteHeader(200)
		return
	}
}

func main() {
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
		db = models.CreateDB()
		kubeClient = CreateClient(KubeConfig)
		defer db.Close()

		router := mux.NewRouter()

		router.HandleFunc("/", sayHello).Methods("GET")
		router.HandleFunc("/url/code", getRepoURL).Methods("GET")
		router.HandleFunc("/url/data", getDataURL).Methods("GET")
		router.HandleFunc("/model/{user}/{model}/{tag}", putModel).Methods("PUT")
		router.HandleFunc("/model/{user}/{model}/{tag}", deleteModel).Methods("DELETE")
		router.HandleFunc("/model/{user}/{model}/{tag}", postModel).Methods("POST")

		fmt.Println("Starting HTTP master server")
		server := &http.Server{
			Handler:      router,
			Addr:         "0.0.0.0:8080",
			WriteTimeout: 15 * time.Second,
			ReadTimeout:  15 * time.Second,
		}
		server.ListenAndServe()
	} else {
		panic("Unknown command " + command)
	}
}
