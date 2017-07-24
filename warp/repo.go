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
	// private variable.
	// use Repo.Config to access the configuration to make sure
	// it is in sync with the file
	config map[string]interface{}
}

var _ = fmt.Println

func (repo *Repo) Config() map[string]interface{} {
	err := repo.LoadYAML()
	if err != nil {
		panic(err)
	}
	return repo.config
}

func (repo *Repo) SaveConfig(config map[string]interface{}) error {
	repo.config = config

	return repo.SaveYAML()
}

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

func (repo *Repo) LoadYAML() error {
	data, err := ioutil.ReadFile(path.Join(repo.Path, "dummy.yml"))
	repo.config = make(map[string]interface{})
	if err != nil {
		return err
	}
	yaml.Unmarshal(data, &repo.config)
	return nil
}

func (repo *Repo) SaveYAML() error {
	data, err := yaml.Marshal(repo.config)
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(path.Join(repo.Path, "dummy.yml"), data, 666)
	if err != nil {
		return err
	}
	return nil
}

func (repo *Repo) AddModel(config map[string]interface{}) error {
	name, ok := config["name"]
	if !ok {
		return errors.New("Model config must have key \"name\"")
	}

	models := repo.Config()["models"].([]interface{})
	for _, modelInterface := range models {
		model := modelInterface.(map[interface{}]interface{})

		thisName, ok := model["name"]
		if !ok {
			return errors.New("Model config must have key \"name\"")
		}

		if thisName == name {
			return errors.New(fmt.Sprintf("Model %s already exists", name))
		}
	}

	models = append(models, config)
	oldConfig := repo.Config()
	oldConfig["models"] = models
	return repo.SaveConfig(oldConfig)
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
