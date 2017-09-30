package main

import (
	"fmt"
	"testing"
)

func TestGetAccessToken(t *testing.T) {
	accessToken, err := GetAuth0AccessToken()
	if accessToken == "" {
		t.Errorf("Access token is empty")
	}

	if err != nil {
		t.Errorf(err.Error())
	}
}

func TestGetAuth0Users(t *testing.T) {
	accessToken, _ := GetAuth0AccessToken()

	users, err := GetAuth0Users(accessToken)
	if err != nil {
		t.Errorf(err.Error())
	}

	for _, user := range users {
		fmt.Println("user", user["nickname"], user["email"])
	}
}
