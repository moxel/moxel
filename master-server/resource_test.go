package main

import (
	"fmt"
	"testing"
)

const user = "dummy"
const name = "tf-bare"

func TestGetRepoURL(t *testing.T) {

	repoURL, err := GetRepoURL(user, name)
	if err != nil {
		panic(err)
	}

	fmt.Println(repoURL)

	assertEqual(t, repoURL, "ssh://master-dev.dummy.ai:/mnt/code/dummy/tf-bare", "RepoURL does not match")
}

func TestLoadGCSredentials(t *testing.T) {
	accessID, accessKey := LoadGCSCredentials()
	fmt.Println(accessID)
	fmt.Println(accessKey)

	if accessID == "" || accessKey == "" {
		t.Fatal("Cannot read GCS credentials")
	}
}

func TestGetGCloudStorageURL(t *testing.T) {
	url, err := GetGCloudStorageURL(user, name, "tmp/test_gcs.txt", "PUT")
	if err != nil {
		t.Fatal("Cannot get signed URL from GCloud. Reason:", err.Error())
		return
	}

	fmt.Println("Signed GCS URL = ", url)
}
