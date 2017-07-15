package models

import (
	"fmt"
	"testing"
)

var _ = fmt.Println

const user string = "dummy"
const name string = "train-tts"
const repo string = "tts"
const commit string = "0x12345"

func TestAddJob(t *testing.T) {
	db := CreateDB()
	job := Job{Uid: "", UserId: user, Name: name, Repo: repo,
		Commit: commit, Yaml: "test-yaml", Status: "Running"}
	err := AddJob(db, job)
	if err != nil {
		t.Errorf(err.Error())
	}
}

func TestJobId(t *testing.T) {
	uid := JobId(user, repo, commit)
	if len(uid) == 0 {
		t.Errorf("JobId is not computed correctly.")
	}
}

func TestListJobByUser(t *testing.T) {
	db := CreateDB()

	jobs, err := ListJobByUser(db, user)
	if err != nil {
		t.Error("Error: %s", err.Error())
	}

	fmt.Println("Jobs = ", jobs)
}

func TestGetJobById(t *testing.T) {
	db := CreateDB()
	uid := JobId(user, repo, commit)
	job, err := GetJobById(db, uid)
	if err != nil {
		t.Errorf("Cannot get job by id = %s. %s", uid, err.Error())
	}

	if job.UserId != user {
		t.Errorf("Expect UserId = %s", user)
	}
	if job.Name != name {
		t.Errorf("Expect RepoId = %s", name)
	}
}

func TestDeleteJob(t *testing.T) {
	db := CreateDB()
	uid := JobId(user, repo, commit)
	err := DeleteJob(db, uid)
	if err != nil {
		t.Errorf("Delete job failed: " + err.Error())
	}
}
