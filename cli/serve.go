package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

type LocalModel struct {
	user string
	name string
	tag  string

	config     map[string]interface{}
	driverType string
	driverSpec map[string]interface{}

	proxy *httputil.ReverseProxy
}

func printRequest(r *http.Request, args ...interface{}) error {
	if r == nil {
		return errors.New("Cannot print nil request")
	}
	fmt.Printf("%s %s %s %s %v\n", r.RemoteAddr, r.Method, r.URL.Path, r.Proto, args)
	return nil
}

func CreateLocalModel(file string) (*LocalModel, error) {
	config, err := LoadYAML(file)
	if err != nil {
		return nil, err
	}

	if err := VerifyModelConfig(config); err != nil {
		return nil, err
	}

	config = CleanupModelConfig(config)

	user := GlobalUser.Username()
	name := "awesome"
	if _, ok := config["name"]; ok {
		name = config["name"].(string)
	}
	tag := "latest"
	if _, ok := config["tag"]; ok {
		tag = config["tag"].(string)
	}
	model := LocalModel{user: user, name: name, tag: tag, config: config}

	main := config["main"].(map[interface{}]interface{})
	model.driverType = main["type"].(string)

	params := make(map[interface{}]interface{})

	repo, err := GetWorkingRepo()
	if err != nil {
		return nil, err
	}

	params["code_root"] = repo.Path
	params["work_path"] = GetWorkingPath(filepath.Dir(file), repo)
	params["asset_root"] = repo.Path

	// TODO: verify all assets exist.
	params["assets"] = []interface{}{}
	params["entrypoint"] = main["entrypoint"].(string)
	params["input_space"] = config["input_space"]
	params["output_space"] = config["output_space"]

	model.driverSpec = cleanupInterfaceMap(params)

	// create proxy to model API.
	url, _ := url.Parse("http://localhost:5900")
	model.proxy = httputil.NewSingleHostReverseProxy(url)
	return &model, nil
}

func (model *LocalModel) HandleProxy(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("X-GoProxy", "GoProxy")
	r.URL.Path = "/"
	model.proxy.ServeHTTP(w, r)
}

func (model *LocalModel) Get(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user := vars["user"]
	name := vars["model"]
	tag := vars["tag"]

	printRequest(r, fmt.Sprintf("Get model %s/%s:%s", user, name, tag))

	w.Header().Set("Content-Type", "application/json")

	configInterface := make(map[interface{}]interface{})
	for k, v := range model.config {
		configInterface[k] = v
	}

	results := map[interface{}]interface{}{
		"status":   "LIVE",
		"metadata": configInterface,
	}
	response, err := json.Marshal(cleanupInterfaceMap(results))
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to dump JSON: %s. %v", err.Error(), results), 500)
		return
	}
	w.WriteHeader(200)
	w.Write(response)
}

func (model *LocalModel) Serve() error {
	fmt.Println(fmt.Sprintf("Serving model locally: %s/%s:%s", model.user, model.name, model.tag))

	jsonBytes, err := json.Marshal(model.driverSpec)
	if err != nil {
		return err
	}
	if model.driverType == "python" {
		cmd := exec.Command("moxel-python-driver", "--json", string(jsonBytes))
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		go func() {
			err := cmd.Start()
			if err != nil {
				panic(err)

			}
		}()

		router := mux.NewRouter()
		router.HandleFunc("/api/users/{user}/models/{model}/{tag}", model.Get).Methods("GET")
		router.HandleFunc("/model/{user}/{model}/{tag}", model.HandleProxy).Methods("GET")
		router.HandleFunc("/model/{user}/{model}/{tag}", model.HandleProxy).Methods("POST")

		server := &http.Server{
			Handler:      router,
			Addr:         fmt.Sprintf("0.0.0.0:8081"),
			WriteTimeout: 3600 * time.Second,
			ReadTimeout:  3600 * time.Second,
		}
		err = server.ListenAndServe()
		if err != nil {
			return err
		}
	}
	return nil
}
