package models

import (
	"testing"
)

func TestAddModel(t *testing.T) {
	db := CreateDB()
	model := Model{UserId: "strin", RepoId: "inception", Tag: "latest",
		Git: "github.com/strin/inception", Docker: "strin/inception", Metadata: ""}
	addModel(db, model)
}
