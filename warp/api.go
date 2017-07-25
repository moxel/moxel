package main

import (
	"errors"
	"fmt"
	"github.com/levigross/grequests"
	"path"
)

// API for the MasterServer
type MasterAPI struct {
}

func (api *MasterAPI) GetRepoURL(user string, name string) (string, error) {
	resp, err := grequests.Get(MasterEndpoint("/url/code"),
		&grequests.RequestOptions{
			Params: map[string]string{
				"user": user,
				"name": name,
			},
		},
	)

	if err != nil {
		return "", err
	}

	result := make(map[string]interface{})
	err = resp.JSON(&result)

	if err != nil {
		return "", errors.New(fmt.Sprintf("Cannot parse JSON. %s", resp.String()))
	}

	url := result["url"].(string)

	return url, nil
}

func (api *MasterAPI) GetAssetURL(user string, name string, commit string, relpath string, verb string) (string, error) {
	resp, err := grequests.Get(MasterEndpoint("/url/data"),
		&grequests.RequestOptions{
			Params: map[string]string{
				"user":  user,
				"name":  name,
				"cloud": CLOUD_VENDOR,
				"path":  path.Join(commit, relpath),
				"verb":  verb,
			},
		},
	)

	if err != nil {
		return "", err
	}

	result := make(map[string]interface{})
	err = resp.JSON(&result)

	if err != nil {
		return "", errors.New(fmt.Sprintf("Cannot parse JSON. %s"))
	}

	url := result["url"].(string)
	return url, err
}
