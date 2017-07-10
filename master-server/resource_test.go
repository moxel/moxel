package main

import (
	"fmt"
	"os"
	"path"
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

func TestGitAddWorktree(t *testing.T) {
	pwd, err := os.Getwd()
	if err != nil {
		t.Fatal("Cannot get current dir")
	}

	err = os.RemoveAll(path.Join(pwd, "tests/tf-bare-mirror"))
	if err != nil {
		t.Fatal("Cannot clean up worktree mirror:", err.Error())
	}

	fmt.Println(path.Join(pwd, "tests/tf-bare-mirror"))
	err = GitAddWorktree(path.Join(pwd, "tests/tf-bare"),
		path.Join(pwd, "tests/tf-bare-mirror"), "master")
	if err != nil {
		t.Fatal("Cannot create worktree mirror:", err.Error())
	}

	err = os.RemoveAll(path.Join(pwd, "tests/tf-bare-mirror"))
	if err != nil {
		t.Fatal("Cannot clean up worktree mirror:", err.Error())
	}
}

func TestCreateRepoMirror(t *testing.T) {
	CreateRepoMirror("dummy", "tf-object-detection", "07aab83f0516918f691178e15b68695f2bd9e29b")
}
