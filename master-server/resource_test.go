package main

import (
	"fmt"
	"testing"
)

func TestGetRepoURL(t *testing.T) {
	user := "dummy"
	project := "tf-bare"

	repoURL, err := GetRepoURL(user, project)
	if err != nil {
		panic(err)
	}

	fmt.Println(repoURL)
}
