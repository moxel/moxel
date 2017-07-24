package main

import (
	"errors"
	"fmt"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"os"
	"path"
)

type Repo struct {
	Path    string
	GitRepo *git.Repository
}

var _ = fmt.Println

// Start from the given path, recursively go up
// until a git repository is found.
func GetRepo(repoPath string) (*Repo, error) {
	repoPath = path.Clean(repoPath)
	for {
		_, err := git.PlainOpen(repoPath)
		if err == nil {
			break
		}
		if repoPath == "/" || repoPath == "." {
			return nil, errors.New("No repo found from " + repoPath)
		}
		repoPath = path.Dir(repoPath)
	}
	gitRepo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, err
	}

	repo := Repo{
		Path:    repoPath,
		GitRepo: gitRepo,
	}
	return &repo, nil
}

func LoadYAML(yamlPath string) (map[string]interface{}, error) {
	data, err := ioutil.ReadFile(yamlPath)
	config := make(map[string]interface{})
	if err != nil {
		return nil, err
	}
	yaml.Unmarshal(data, &config)
	return config, nil
}

func SaveYAML(yamlPath string, config map[string]interface{}) error {
	data, err := yaml.Marshal(config)
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(yamlPath, data, 0644)
	if err != nil {
		return err
	}
	return nil
}

func InitModelConfig(name string) map[string]interface{} {
	return map[string]interface{}{
		"name":        name,
		"description": "A gorgeous model",
		"tag":         "0.0.0",
		"setup":       []string{},
		"labels":      []string{},
		"image":       "dummyai/python3",
	}
}

// Get current working repo.
func GetWorkingRepo() (*Repo, error) {
	dir, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	repo, err := GetRepo(dir)
	if err != nil {
		return nil, err
	}

	return repo, nil
}
