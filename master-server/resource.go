// Manages resources for model build process.
// Three types of resources: code, asset (data / model weights) and env.
package main

import (
	gcs "cloud.google.com/go/storage"
	"encoding/json"
	"errors"
	"fmt"
	git "gopkg.in/src-d/go-git.v4"
	"io/ioutil"
	"os"
	"path"
	"time"
)

const gitRegistry string = "master-dev.dummy.ai"
const gitRoot string = "/mnt/code"

const gcsBucket string = "dummy-dev"
const gcsCredentials string = "secrets/dummy-87bbacfcb748.json"

var gcsAccessID string
var gcsAccessKey string

var _ = fmt.Println

// Get the url for a git repo, given user and name.
func GetRepoURL(user string, name string) (string, error) {
	if user == "" {
		return "", errors.New("User cannot be nil or empty")
	}

	if name == "" {
		return "", errors.New("Project name cannot be nil or empty")
	}

	gitPath := path.Join(gitRoot, user, name)

	if _, err := os.Stat(gitPath); os.IsNotExist(err) {
		// Create an empty git repo if it does not exist.
		// isBare: false
		_, err := git.PlainInit(gitPath, false)
		if err != nil {
			return "", err
		}
	}

	return "ssh://warp@" + gitRegistry + ":" + gitPath, nil
}

// If gcsAccessID or gcsAccessKey is empty, the system loads them from secrets
func LoadGCSCredentials() (string, string) {
	data, err := ioutil.ReadFile(gcsCredentials)
	if err != nil {
		panic(err)
	}

	var credentials map[string]string
	json.Unmarshal(data, &credentials)

	gcsAccessID = credentials["client_email"]
	gcsAccessKey = credentials["private_key"]

	return gcsAccessID, gcsAccessKey
}

// Get the signed url for storage, given user, project name, and path.
func GetGCloudStorageURL(user string, name string, path string, verb string) (string, error) {
	if gcsAccessID == "" || gcsAccessKey == "" {
		LoadGCSCredentials()
	}

	if verb != "GET" && verb != "PUT" {
		return "", errors.New("Unknown HTTP Verb " + verb)
	}

	method := verb
	expires := time.Now().Add(time.Second * 3600)

	url, err := gcs.SignedURL(gcsBucket, path, &gcs.SignedURLOptions{
		GoogleAccessID: gcsAccessID,
		PrivateKey:     []byte(gcsAccessKey),
		Method:         method,
		Expires:        expires,
		ContentType:    "application/octet-stream",
	})

	if err != nil {
		return "", err
	}

	fmt.Println("URL = " + url)

	return url, nil
}
