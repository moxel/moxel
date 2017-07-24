package main

import (
	"errors"
	"fmt"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/config"
	gitHTTP "gopkg.in/src-d/go-git.v4/plumbing/transport/http"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	//"net/http"
	"os"
	"path"
	"path/filepath"
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

	repoPath, _ = filepath.Abs(repoPath)

	repo := Repo{
		Path:    repoPath,
		GitRepo: gitRepo,
	}
	return &repo, nil
}

// Push code to remote registry.
func (repo *Repo) PushCode(token string, url string) error {
	//// Implementation based on Proxy Server
	//// Deprecated because go-git does not support proxy easily.
	//Port := 15900
	//// Create a proxy so we can add authentication HTTP headers.
	//fmt.Println("Starting proxy")
	//proxy := goproxy.NewProxyHttpServer()
	//proxy.Verbose = true
	//proxy.OnRequest().DoFunc(
	//	func(r *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
	//		if token != "" {
	//			r.Header.Set("Authorization", token)
	//		}
	//		return r, nil
	//	})

	//go func() {
	//	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", Port), proxy))
	//}()

	//for {
	//	time.Sleep(10 * time.Millisecond)
	//	resp, err := http.Get(fmt.Sprintf("http://localhost:%d", Port))
	//	if err != nil {
	//		continue
	//	}

	//	resp.Body.Close()
	//	break
	//}

	// Push code through Git.
	_, err := repo.GitRepo.CreateRemote(&config.RemoteConfig{
		Name: "test",
		URL:  url,
	})
	if err != nil {
		panic(err)
	}

	auth := gitHTTP.NewTokenAuth(token)
	var auth2 interface{} = auth
	fmt.Println("auth", auth2.(gitHTTP.AuthMethod))
	options := git.PushOptions{
		RemoteName: "test",
		Auth:       auth,
	}

	err = repo.GitRepo.Push(&options)
	if err != nil {
		panic(err)
	}
	return nil
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
		"type":        "model",
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
