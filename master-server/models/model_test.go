package models

import (
	"fmt"
	"testing"
)

var _ = fmt.Println

func TestAddModel(t *testing.T) {
	db := CreateDB()
	model := Model{UserId: "strin", RepoId: "inception", Tag: "0.0.1",
		Git: "github.com/strin/inception", Docker: "strin/inception", Metadata: ""}
	err := AddModel(db, model)
	if err != nil {
		t.Errorf(err.Error())
	}
}

func TestDeleteModel(t *testing.T) {
	db := CreateDB()
	modelId := "xHNie6dxkpn9iVd2ujniIPYVdPc="
	err := DeleteModel(db, modelId)
	if err != nil {
		t.Errorf("Delete model failed: " + err.Error())
	}
}

func TestGetModelById(t *testing.T) {
	db := CreateDB()
	model := GetModelById(db, "xHNie6dxkpn9iVd2ujniIPYVdPc=")
	if model.UserId != "strin" {
		t.Errorf("Expect UserId = strin")
	}
	if model.RepoId != "inception" {
		t.Errorf("Expect RepoId = inception")
	}
	if model.Tag != "0.0.1" {
		t.Errorf("Expect Tag = 0.0.1")
	}
}

func TestModelId(t *testing.T) {
	const userId = "strin"
	const repoId = "inception"
	const tag = "0.0.1"
	modelId := ModelId(userId, repoId, tag)
	if modelId != "xHNie6dxkpn9iVd2ujniIPYVdPc=" {
		t.Errorf("ModelId is not computed correctly.")
	}
}
