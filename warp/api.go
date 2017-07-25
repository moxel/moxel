package main

import (
	"errors"
	"fmt"
	"github.com/levigross/grequests"
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

	fmt.Println(resp.String())
	result := make(map[string]interface{})
	err = resp.JSON(&result)

	if err != nil {
		return "", errors.New(fmt.Sprintf("Cannot parse JSON. %s", resp.String()))
	}

	url := result["url"].(string)
	fmt.Println("url", url)

	return url, nil
}
