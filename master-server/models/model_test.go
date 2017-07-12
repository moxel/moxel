package models

import (
	"fmt"
	"testing"
)

var _ = fmt.Println

func TestAddModel(t *testing.T) {
	db := CreateDB()
	model := Model{UserId: "dummy", Name: "tf-object-detection", Tag: "test",
		Repo: "tf-object-detection", Commit: "test-commit", Yaml: "test-yaml", Status: "LIVE"}
	err := AddModel(db, model)
	if err != nil {
		t.Errorf(err.Error())
	}
}

func TestDeleteModel(t *testing.T) {
	db := CreateDB()
	modelId := "dummy/tf-object-detection:test"
	err := DeleteModel(db, modelId)
	if err != nil {
		t.Errorf("Delete model failed: " + err.Error())
	}
}

func TestGetModelById(t *testing.T) {
	db := CreateDB()
	modelId := "dummy/tf-object-detection:test"
	model, err := GetModelById(db, modelId)
	if err != nil {
		t.Errorf("Cannot get model by id = %s. %s", modelId, err.Error())
	}

	if model.UserId != "dummy" {
		t.Errorf("Expect UserId = dummy")
	}
	if model.Name != "tf-object-detection" {
		t.Errorf("Expect RepoId = tf-object-detection")
	}
	if model.Tag != "test" {
		t.Errorf("Expect Tag = test")
	}
}

func TestModelId(t *testing.T) {
	const userId = "dummy"
	const repoId = "tf-object-detection"
	const tag = "test"
	modelId := ModelId(userId, repoId, tag)
	if modelId != "dummy/tf-object-detection:test" {
		t.Errorf("ModelId is not computed correctly.")
	}
}
