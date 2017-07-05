// Manages resources for model build process.
// Three types of resources: code, asset (data / model weights) and env.
package main

import (
	"errors"
	"fmt"
	git "gopkg.in/src-d/go-git.v4"
	"os"
	"path"
)

const gitRegistry string = "master-dev.dummy.ai"
const gitRoot string = "/mnt/code"

var _ = fmt.Println

// Get the url for a git repo, indexed by user and name.
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

	return "ssh://" + gitRegistry + ":" + gitPath, nil
}
