// User authentication and management.
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
)

func GetAuth0AccessToken() (string, error) {
	payload := strings.NewReader(fmt.Sprintf(
		"{\"client_id\":\"%s\",\"client_secret\":\"%s\",\"audience\":\"https://dummyai.auth0.com/api/v2/\",\"grant_type\":\"client_credentials\"}", AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET))

	req, _ := http.NewRequest("POST",
		"https://"+AUTH0_DOMAIN+"/oauth/token",
		payload)

	req.Header.Add("content-type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)

	credentials := make(map[string]interface{})

	err := json.Unmarshal(body, &credentials)
	if err != nil {
		return "", err
	}

	accessToken := credentials["access_token"].(string)

	return accessToken, nil
}

func GetAuth0Users(accessToken string) ([]map[string]interface{}, error) {
	return GetAuth0UsersByQuery(accessToken, "")
}

func GetAuth0UsersByQuery(accessToken string, query string) ([]map[string]interface{}, error) {
	const numUsersPerPage = 10
	totalUsers := -1
	pageId := 0
	var users []map[string]interface{}

	for {
		if len(users) >= totalUsers && totalUsers != -1 {
			break
		}
		req, _ := http.NewRequest("GET",
			"https://"+AUTH0_DOMAIN+
				fmt.Sprintf("/api/v2/users?page=%s&per_page=%s&include_totals=true&q=%s", strconv.Itoa(pageId), strconv.Itoa(numUsersPerPage), query), nil)
		req.Header.Add("Authorization", "Bearer "+accessToken)

		res, _ := http.DefaultClient.Do(req)

		defer res.Body.Close()
		body, _ := ioutil.ReadAll(res.Body)

		result := make(map[string]interface{})
		err := json.Unmarshal(body, &result)
		if err != nil {
			return nil, err
		}

		totalUsers = int(result["total"].(float64))

		for _, user := range result["users"].([]interface{}) {
			users = append(users, user.(map[string]interface{}))
		}

		pageId++
	}

	return users, nil
}
