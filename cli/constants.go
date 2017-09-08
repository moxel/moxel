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

const AUTH0_DOMAIN = "dummyai.auth0.com"
const AUTH0_CLIENT_ID = "0hItkN1iRVqZGtU2okpiyTJmsiR49K9f"
const AUTH0_CLIENT_SECRET = "po_dTnKdw3ZTcNblzOu_M3QLG8s1p5qwMdkwGNg7AbOpoFLLgiIxLjiuOEB8NF3J" // Suffer from reverse-compilation.
const CLOUD_VENDOR = "gcloud"

const USER_CONFIG = ".dummy"

var MasterAddress = "http://beta.dummy.ai/api"
var WebsiteAddress = "http://beta.dummy.ai"

// The URL to create a new model on Moxel website.
var CreateModelURL = WebsiteAddress + "/new"

var GlobalContext *cli.Context
var GlobalUser *User
var GlobalAPI *MasterAPI
var callbackPort string

// A moxel.yml whitelist that maps <key> => <isRequired>
var YAMLWhitelist = map[string]bool{
	"image":        true,
	"assets":       false,
	"resources":    false,
	"input_space":  true,
	"output_space": true,
	"cmd":          true,
}

var DefaultResources = map[string]interface{}{
	"cpu":    "1",
	"memory": "512Mi",
}

// A whitelist for model input/output types.
// the values don't have meaning, and are always "true".
var TypeWhitelist = map[string]bool{
	"Image":  true,
	"JSON":   true,
	"String": true,
}

// Checks if the user has logged in.
func CheckLogin() error {
	if GlobalUser.Initialized() {
		GlobalUser = &User{}
		GlobalAPI = NewMasterAPI(GlobalUser)

		// Check if user has logged in.
		resp, err := GlobalAPI.ping()

		// Internal server error
		if err != nil {
			fmt.Println("Unable to connect to dummy.ai: ", err.Error())
			return errors.New("User not logged in")
		}

		if resp.StatusCode != 200 {
			fmt.Printf("Server response %d: %s\n", resp.StatusCode, resp.String())
			fmt.Println("Please login first. Run `warp login`")
			return errors.New("User not logged in")
		}

		return nil
	} else {
		fmt.Println("Please login first. Run `warp login`")
		return errors.New("User login failed")
	}
}

// Initializes global context and constants.
// First checks if the user has logged in.
func InitGlobal(c *cli.Context) error {
	if err := CheckLogin(); err != nil {
		return err
	}

	GlobalContext = c

	env := os.Getenv("ENV")
	// fmt.Println("Env:", env)
	if env == "local" {
		MasterAddress = "http://0.0.0.0:8080"
	} else if env == "dev" {
		MasterAddress = "http://dev.dummy.ai/api"
	} else if env == "devbox" {
		// Run in dev mode.
		MasterAddress = "http://35.196.226.10:8080"
	} else {
		// default: Production.
	}

	return nil
}

func MasterEndpoint(path string) string {
	return MasterAddress + path
}

func GetUserConfigPath() string {
	usr, err := user.Current()
	if err != nil {
		log.Fatal(err)
	}
	return usr.HomeDir + "/" + USER_CONFIG
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
