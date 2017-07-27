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

func (api *MasterAPI) PutModel(user string, name string, tag string, commit string, yaml string) (*grequests.Response, error) {
	return grequests.Put(MasterEndpoint(fmt.Sprintf("/model/%s/%s/%s", user, name, tag)), &grequests.RequestOptions{
		JSON: map[string]string{
			"commit": commit,
			"yaml":   yaml,
		},
	})
}

func (api *MasterAPI) DeployModel(user string, name string, tag string) (*grequests.Response, error) {
	return grequests.Post(MasterEndpoint(fmt.Sprintf("/model/%s/%s/%s", user, name, tag)), &grequests.RequestOptions{
		JSON: map[string]string{
			"action": "deploy",
		},
	})
}

func (api *MasterAPI) StopDeployModel(user string, name string, tag string) (*grequests.Response, error) {
	return grequests.Post(MasterEndpoint(fmt.Sprintf("/model/%s/%s/%s", user, name, tag)), &grequests.RequestOptions{
		JSON: map[string]string{
			"action": "teardown",
		},
	})
}

func (api *MasterAPI) ListDeployModel(user string) ([]map[string]interface{}, error) {
	resp, err := grequests.Get(MasterEndpoint(fmt.Sprintf("/model/%s", user)), &grequests.RequestOptions{})
	if err != nil {
		return nil, err
	}
	var results []map[string]interface{}

	if resp.StatusCode == 200 {
		var data interface{}
		err = resp.JSON(&data)
		if err != nil {
			return nil, err
		}

		interfaces := data.([]interface{})
		for _, item := range interfaces {
			results = append(results, item.(map[string]interface{}))
		}
	}
	return results, nil
}