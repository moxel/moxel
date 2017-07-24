package main

import (
	"errors"
	"fmt"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path"
)

type Repo struct {
	Path    string
	GitRepo *git.Repository
	Config  map[string]interface{}
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

func (repo *Repo) LoadYAML() error {
	data, err := ioutil.ReadFile(path.Join(repo.Path, "dummy.yml"))
	repo.Config = make(map[string]interface{})
	if err != nil {
		return err
	}
	yaml.Unmarshal(data, &repo.Config)
	return nil
}

func (repo *Repo) SaveYAML() error {
	data, err := yaml.Marshal(repo.Config)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(path.Join(repo.Path, "dummy.yml"), data, 666)
	if err != nil {
		return err
	}
	return nil
}
