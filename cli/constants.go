package main

import (
	//"fmt"
	"errors"
	"fmt"
	"github.com/urfave/cli"
	"log"
	"os"
	"os/user"
)

// Subject to substitution at build time.
const CLI_VERSION = "0.0.4"

const AUTH0_DOMAIN = "dummyai.auth0.com"
const AUTH0_CLIENT_ID = "0hItkN1iRVqZGtU2okpiyTJmsiR49K9f"
const AUTH0_CLIENT_SECRET = "po_dTnKdw3ZTcNblzOu_M3QLG8s1p5qwMdkwGNg7AbOpoFLLgiIxLjiuOEB8NF3J" // Suffer from reverse-compilation.
const CLOUD_VENDOR = "gcloud"

const USER_CONFIG = ".moxel"

var MasterAddress = "http://beta.moxel.ai/api"
var WebsiteAddress = "http://beta.moxel.ai"

// The URL to create a new model on Moxel website.
var CreateModelURL = WebsiteAddress + "/new"

var GlobalContext *cli.Context
var GlobalUser *User
var GlobalAPI *MasterAPI
var callbackPort string

// A moxel.yml whitelist that maps <key> => <isRequired>
var YAMLWhitelist = map[string]bool{
	"name":         false,
	"tag":          false,
	"image":        true,
	"assets":       false,
	"resources":    false,
	"input_space":  true,
	"output_space": true,
	"setup":        false,
	"main":         true,
	"envs":         false,
}

var ResourceWhitelist = map[string]bool{
	"cpu":    true,
	"memory": true,
}

var DefaultResources = map[string]interface{}{
	"cpu":    "1",
	"memory": "1Gi",
}

var SampleModelConfig = `image: moxel/python3
assets:
resources: 
	cpu: 1
	memory: 1G
input_space: 
	in: str
output_space: 
	out: str
main:
	type: python
	entrypoint: serve.py::predict
`

// A whitelist for model input/output types.
// the values don't have meaning, and are always "true".
var TypeWhitelist = map[string]bool{
	"image":   true,
	"json":    true,
	"str":     true,
	"int":     true,
	"float":   true,
	"float32": true,
	"float64": true,
	"bool":    true,
	"bytes":   true,
	"array":   true,
}

// A whitelist for model images.
var ImageWhitelist = map[string]bool{
	"py3-tf":      true,
	"py3-tf-0.11": true,
	"py2-tf":      true,
	"py2-tf-0.11": true,
	"conda2":      true,
	"conda3":      true,
	"python2":     true,
	"python3":     true,
	"py2-caffe":   true,
	"py2-theano":  true,
	"py2-pytorch": true,
	"py3-pytorch": true,
	"redis":       true,
}

// Checks if the user has logged in.
func CheckLogin() error {
	if GlobalUser.Initialized() {
		GlobalUser = &User{}
		GlobalAPI = NewMasterAPI(GlobalUser)

		// Check if user has logged in.
		resp, err := GlobalAPI.ping()

		// Internal server error
		if err != nil || resp.StatusCode == 503 {
			fmt.Println("Unable to connect to moxel.ai: ", err.Error())
			return errors.New("Unable to connect to moxel.ai")
		}

		if resp.StatusCode != 200 {
			return errors.New("Please login first. Run \"moxel login\".")
		}

		return nil
	} else {
		return errors.New("Please login first. Run \"moxel login\".")
	}
}

func InitGlobalConstants() {
	env := os.Getenv("ENV")
	// fmt.Println("Env:", env)
	if env == "local" {
		MasterAddress = "http://0.0.0.0:8080"
		WebsiteAddress = "http://localhost:3000"
	} else if env == "dev" {
		MasterAddress = "http://dev.moxel.ai/api"
		WebsiteAddress = "http://dev.moxel.ai"
	} else if env == "devbox" {
		// Run in dev mode.
		MasterAddress = "http://35.196.226.10:8080"
		WebsiteAddress = "http://dev.moxel.ai"
	} else {
		// default: Production.
	}

	CreateModelURL = WebsiteAddress + "/new"
}

func InitGlobal(c *cli.Context) error {
	GlobalContext = c

	InitGlobalConstants()

	if err := CheckLogin(); err != nil {
		return err
	}

	return nil
}

func MasterEndpoint(path string) string {
	return MasterAddress + path
}

func GetUserHome() string {
	usr, err := user.Current()
	if err == nil {
		return usr.HomeDir
	}
	// Fall back to reading $HOME - work around user.Current() not
	// working for cross compiled binaries on OSX.
	// https://github.com/golang/go/issues/6376
	home := os.Getenv("HOME")
	if home != "" {
		return home
	}

	return "/tmp"
}

func GetUserConfigPath() string {
	return GetUserHome() + "/" + USER_CONFIG
}

func GetRedirectURL() string {
	return "http://localhost:" + callbackPort
}

func GetAuthorizeURL() string {
	return "http://" + AUTH0_DOMAIN + "/authorize?response_type=code&client_id=" + AUTH0_CLIENT_ID + "&redirect_uri=" + GetRedirectURL()
}

func Debugln(args ...interface{}) {
	if GlobalContext != nil && GlobalContext.Bool("debug") {
		fmt.Println(args)
	}
}

func Debugf(format string, args ...interface{}) {
	if GlobalContext != nil && GlobalContext.Bool("debug") {
		fmt.Printf(format, args)
	}
}

// https://gist.github.com/albrow/5882501
func AskForConfirmation() bool {
	var response string
	_, err := fmt.Scanln(&response)
	if err != nil {
		log.Fatal(err)
	}
	okayResponses := []string{"y", "Y", "yes", "Yes", "YES"}
	nokayResponses := []string{"n", "N", "no", "No", "NO"}
	if containsString(okayResponses, response) {
		return true
	} else if containsString(nokayResponses, response) {
		return false
	} else {
		fmt.Println("Please type yes or no and then press enter:")
		return AskForConfirmation()
	}
}

// posString returns the first index of element in slice.
// If slice does not contain element, returns -1.
func posString(slice []string, element string) int {
	for index, elem := range slice {
		if elem == element {
			return index
		}
	}
	return -1
}

// containsString returns true iff slice contains element
func containsString(slice []string, element string) bool {
	return !(posString(slice, element) == -1)
}
