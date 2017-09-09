package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/levigross/grequests"
	"io/ioutil"
	"path"
)

// API for the MasterServer
type MasterAPI struct {
	authToken string
	user      *User
}

func NewMasterAPI(user *User) *MasterAPI {
	authToken := "Bearer " + user.JWT()
	api := MasterAPI{
		authToken: authToken,
		user:      user,
	}
	return &api
}

func (api *MasterAPI) ping() (*grequests.Response, error) {
	resp, err := grequests.Get(MasterEndpoint("/ping/"+api.user.Username()),
		&grequests.RequestOptions{
			Headers: map[string]string{
				"Authorization": api.authToken,
			},
		})
	return resp, err
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
	body, _ := ioutil.ReadAll(resp.RawResponse.Body)

	if err != nil {
		return "", err
	}

	result := make(map[string]interface{})
	err = json.NewDecoder(bytes.NewReader(body)).Decode(&result)

	if err != nil {
		return "", errors.New(fmt.Sprintf("Cannot parse JSON. %s", string(body)))
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

func (api *MasterAPI) GetModel(user string, name string, tag string) (*grequests.Response, error) {
	return grequests.Get(MasterEndpoint(fmt.Sprintf("/users/%s/models/%s/%s", user, name, tag)), &grequests.RequestOptions{})
}

func (api *MasterAPI) LogModel(user string, name string, tag string) (*grequests.Response, error) {
	return grequests.Get(MasterEndpoint(fmt.Sprintf("/users/%s/models/%s/%s/log", user, name, tag)), &grequests.RequestOptions{})
}

func (api *MasterAPI) PutModel(user string, name string, tag string, commit string, yaml string) (*grequests.Response, error) {
	return grequests.Put(MasterEndpoint(fmt.Sprintf("/users/%s/models/%s/%s", user, name, tag)), &grequests.RequestOptions{
		JSON: map[string]string{
			"commit": commit,
			"yaml":   yaml,
		},
	})
}

func (api *MasterAPI) DeleteModel(user string, name string, tag string) (*grequests.Response, error) {
	return grequests.Delete(MasterEndpoint(fmt.Sprintf("/users/%s/models/%s/%s", user, name, tag)), &grequests.RequestOptions{})
}

func (api *MasterAPI) DeployModel(user string, name string, tag string) (*grequests.Response, error) {
	return grequests.Post(MasterEndpoint(fmt.Sprintf("/users/%s/models/%s/%s", user, name, tag)), &grequests.RequestOptions{
		JSON: map[string]string{
			"action": "deploy",
		},
	})
}

func (api *MasterAPI) TeardownDeployModel(user string, name string, tag string) (*grequests.Response, error) {
	return grequests.Post(MasterEndpoint(fmt.Sprintf("/users/%s/models/%s/%s", user, name, tag)), &grequests.RequestOptions{
		JSON: map[string]string{
			"action": "teardown",
		},
	})
}

func (api *MasterAPI) ListModelTags(userId string, modelName string) ([]map[string]interface{}, error) {
	resp, err := grequests.Get(MasterEndpoint(fmt.Sprintf("/users/%s/models/%s", userId, modelName)), &grequests.RequestOptions{})
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

		if data == nil {
			return []map[string]interface{}{}, nil
		}
		interfaces := data.([]interface{})
		for _, item := range interfaces {
			results = append(results, item.(map[string]interface{}))
		}
	}
	return results, nil
}

func (api *MasterAPI) ListModels(user string) ([]map[string]interface{}, error) {
	resp, err := grequests.Get(MasterEndpoint(fmt.Sprintf("/users/%s/models", user)), &grequests.RequestOptions{})
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

		if data != nil {
			interfaces := data.([]interface{})
			for _, item := range interfaces {
				results = append(results, item.(map[string]interface{}))
			}
		}
	}
	return results, nil
}
