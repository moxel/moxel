package models

import (
	//"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

type Model struct {
	gorm.Model
	UserId   string `gorm:"size:64"`
	RepoId   string `gorm:"size:64"`
	Tag      string
	Git      string // git remote and branch
	Docker   string // docker image
	Metadata string // model metadata
}

func addModel(db *gorm.DB, model Model) {
	if db.NewRecord(model) {
		db.Create(&model)
	} else {
		// duplicate error.
	}
	//if err != nil {
	//	fmt.Println("Error!")
	//}
}
