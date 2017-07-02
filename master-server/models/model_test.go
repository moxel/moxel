package models

import (
	// "fmt"
	"testing"
)

func TestAddModel(t *testing.T) {
	db := CreateDB()
	model := Model{UserId: "strin", RepoId: "inception-v3", Tag: "latest",
		Git: "github.com/strin/inception", Docker: "strin/inception", Metadata: ""}
	err := AddModel(db, model)
	if err != nil {
		t.Errorf(err.Error())
	}
}

func TestGetModelId(t *testing.T) {
	const userId = "strin"
	const repoId = "inception"
	const tag = "0.0.1"
	modelId := GetModelId(userId, repoId, tag)
	if modelId != "xHNie6dxkpn9iVd2ujniIPYVdPc=" {
		t.Errorf("ModelId is not computed correctly.")
	}
}
