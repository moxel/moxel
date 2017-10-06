package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"
)

type LocalModel struct {
	pathToYAML string

	user string
	name string
	tag  string

	env string

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
	model := LocalModel{user: user, name: name, tag: tag, config: config,
		env: config["image"].(string), pathToYAML: file}

	main := config["main"].(map[interface{}]interface{})
	model.driverType = main["type"].(string)
	params := make(map[interface{}]interface{})

	// TODO: verify all assets exist.
	params["assets"] = []interface{}{}

	if model.driverType == "python" {
		params["entrypoint"] = main["entrypoint"].(string)
	} else if model.driverType == "http" {
		params["entrypoint"] = main["entrypoint"].(string)
	} else {
		return nil, errors.New("Unknown driver type " + model.driverType)
	}

	params["input_space"] = config["input_space"]
	params["output_space"] = config["output_space"]
	if config["setup"] != nil {
		params["setup"] = config["setup"]
	}

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

	if model.user != user {
		http.Error(w, fmt.Sprintf("User name does not match. Expected \"%s\" but get \"%s\" :(", model.user, user), 400)
		return
	}

	if model.name != name {
		http.Error(w, fmt.Sprintf("Model name does not match. Expected \"%s\" but get \"%s\" :(", model.name, name), 400)
		return
	}

	if model.tag != tag {
		http.Error(w, fmt.Sprintf("Model tag does not match. Expected \"%s\" but get \"%s\" :(", model.tag, tag), 400)
		return
	}

	printRequest(r, fmt.Sprintf("Get model %s/%s:%s", user, name, tag))

	w.Header().Set("Content-Type", "application/json")

	configInterface := make(map[interface{}]interface{})
	for k, v := range model.config {
		configInterface[k] = v
	}

	results := map[interface{}]interface{}{
		"status": "LIVE",
		"spec":   configInterface,
	}
	response, err := json.Marshal(cleanupInterfaceMap(results))
	if err != nil {
		http.Error(w, fmt.Sprintf("Unable to dump JSON: %s. %v", err.Error(), results), 500)
		return
	}
	w.WriteHeader(200)
	w.Write(response)
}

func (model *LocalModel) Serve(useDocker bool) error {
	useDockerPrompt := ""
	if useDocker {
		useDockerPrompt = "Using Docker image: " + model.env + "."
	}

	fmt.Println(fmt.Sprintf("Locally serving model %s/%s:%s. %s", model.user, model.name, model.tag, useDockerPrompt))

	repo, err := GetWorkingRepo()
	if err != nil {
		return err
	}

	if useDocker {
		model.driverSpec["code_root"] = "/app"
		model.driverSpec["asset_root"] = "/app"
	} else {
		model.driverSpec["code_root"] = repo.Path
		model.driverSpec["asset_root"] = repo.Path
	}
	model.driverSpec["work_path"] = GetWorkingPath(filepath.Dir(model.pathToYAML), repo)

	jsonBytes, err := json.Marshal(model.driverSpec)
	if err != nil {
		return err
	}

	var cmd *exec.Cmd
	var command []string

	if useDocker {
		command = append(command, []string{"docker", "run",
			"--rm",
			"-v", repo.Path + ":/app",
			"-p", "5900:5900",
			"-i"}...)

		// If useDev is true, we search for moxel clients and drivers.
		// And map them to ones in docker.
		useDev := os.Getenv("DRIVER_DEV") != ""
		if useDev {
			moxelHostPath, _ := exec.Command("/usr/bin/env", []string{"python", "-c", "import moxel, sys; sys.stdout.write(moxel.__path__[0])"}...).CombinedOutput()
			moxelContainerPath, _ := exec.Command("docker", []string{"run", "-i", model.env, "python", "-c", "import sys, moxel; sys.stdout.write(moxel.__path__[0])"}...).CombinedOutput()
			command = append(command, []string{"-v", string(moxelHostPath) + ":" + string(moxelContainerPath)}...)
		}

		command = append(command, []string{model.env}...)
	}

	if model.driverType == "python" {
		command = append(command, []string{"moxel-python-driver", "--json", string(jsonBytes)}...)
	} else if model.driverType == "http" {
		command = append(command, []string{
			"moxel-http-driver",
			"--code_root", model.driverSpec["code_root"].(string),
			"--asset_root", model.driverSpec["asset_root"].(string),
			"--work_path", model.driverSpec["work_path"].(string)}...)
		command = append(command, "--cmd")
		for _, line := range model.driverSpec["setup"].([]interface{}) {
			fmt.Println("line", line)
			command = append(command, line.(string))
		}
		command = append(command, model.driverSpec["entrypoint"].(string))
	} else {
		return errors.New("Unknow driver type " + model.driverType)
	}

	fmt.Println("Command:", command)
	cmd = exec.Command(command[0], command[1:]...)

	// Run the HTTP driver.
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	doneCommand := make(chan bool)
	go func() {
		cmd.Start()
		cmd.Wait()
		doneCommand <- true
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

	doneServer := make(chan bool)
	go func() {
		server.ListenAndServe()
		doneServer <- true
	}()

	// Wait for shutdown.
	irqSig := make(chan os.Signal, 1)
	signal.Notify(irqSig, syscall.SIGINT, syscall.SIGTERM)
	<-irqSig

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = server.Shutdown(ctx)
	if err != nil {
		return err
	}

	<-doneServer
	<-doneCommand

	return nil
}
