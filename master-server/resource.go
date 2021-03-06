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
	"os/exec"
	"path"
	"time"
)

var gcsAccessID string
var gcsAccessKey string

var _ = fmt.Println

// Create a worktree mirror of a given repo.
func GitAddWorktree(srcPath string, destPath string, branch string) error {
	command := exec.Command("git", "worktree", "add", "-f", destPath, branch)
	command.Dir = srcPath

	output, err := command.CombinedOutput()
	if err != nil {
		return errors.New("Failed to add worktree: " + err.Error())
	}

	command = exec.Command("chmod", "-R", "a+rwx", destPath)
	output, err = command.CombinedOutput()
	if err != nil {
		return errors.New("Failed to add worktree permission: " + err.Error())
	}

	fmt.Println(string(output))
	return nil
}

// Get the repo root path where repo and mirrors sit.
func GetRepoRootPath(user string, repo string) string {
	return path.Join(GitRoot, user, repo)
}

// Get the repo path given user and project name
func GetRepoPath(user string, repo string) string {
	return path.Join(GitRoot, user, repo, "main")
}

// Get the repo root path given user, project name.
func GetMirrorRootPath(user string, repo string) string {
	return path.Join(GitRoot, user, repo, "mirror")
}

// Get the repo mirror path given user, project name and commit
func GetRepoMirrorPath(user string, repo string, commit string) string {
	return path.Join(GitRoot, user, repo, "mirror", commit)
}

// Get the path to asset.
func GetAssetPath(user string, repo string, commit string) string {
	return path.Join(user, repo, commit)
}

// Create a mirror of repo given commit.
func CreateRepoMirror(user string, repo string, commit string) error {

	srcPath := GetRepoPath(user, repo)
	mirrorRoot := GetMirrorRootPath(user, repo)
	destPath := GetRepoMirrorPath(user, repo, commit)
	branch := commit

	if _, err := os.Stat(mirrorRoot); os.IsNotExist(err) {
		os.MkdirAll(mirrorRoot, 0777)

		command := exec.Command("chmod", "-R", "a+rwx", mirrorRoot)
		_, err := command.CombinedOutput()
		if err != nil {
			return errors.New("Failed to add mirror permission: " + err.Error())
		}

	}

	if pathExists(destPath) {
		return nil
	}

	return GitAddWorktree(srcPath, destPath, branch)
}

// Get the url for a git repo, given user and name.
func GetRepoURL(user string, name string) (string, error) {
	if user == "" {
		return "", errors.New("User cannot be nil or empty")
	}

	if name == "" {
		return "", errors.New("Project name cannot be nil or empty")
	}

	gitPath := user + "/" + name
	gitFileRoot := GetRepoRootPath(user, name)
	gitFilePath := GetRepoPath(user, name)

	if _, err := os.Stat(gitFilePath); os.IsNotExist(err) {
		// Create an empty git repo if it does not exist.
		// isBare: false
		_, err := git.PlainInit(gitFilePath, false)
		if err != nil {
			return "", err
		}

		command := exec.Command("chmod", "-R", "a+rwx", gitFileRoot)
		output, err := command.CombinedOutput()
		if err != nil {
			return "", errors.New(fmt.Sprintf("Failed to add git repo permission: %s\nOutput: %s", err.Error(), output))
		}

	}

	return GitRegistry + "/" + gitPath + "/main", nil
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
func GetGCloudStorageURL(user string, name string, path string, verb string, contentType string) (string, error) {
	if gcsAccessID == "" || gcsAccessKey == "" {
		LoadGCSCredentials()
	}

	if verb != "GET" && verb != "PUT" {
		return "", errors.New("Unknown HTTP Verb " + verb)
	}

	method := verb
	expires := time.Now().Add(time.Second * 3600)

	gcsPath := user + "/" + name + "/" + path

	options := gcs.SignedURLOptions{
		GoogleAccessID: gcsAccessID,
		PrivateKey:     []byte(gcsAccessKey),
		Method:         method,
		Expires:        expires,
	}

	if contentType != "ignore" {
		options.ContentType = contentType
	}
	url, err := gcs.SignedURL(gcsBucket, gcsPath, &options)

	if err != nil {
		return "", err
	}

	fmt.Println("URL = " + url)

	return url, nil
}
