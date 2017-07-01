/*
Package "models" defines the basic database schema. It includes the following files
*/
package models

import (
	"fmt"
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

func CreateDB() *gorm.DB {
	db, err := gorm.Open("postgres", "host=35.185.221.185 user=postgres dbname=postgres sslmode=disable password=postgres")
	if err != nil {
		panic(err)
	}

	db.SingularTable(true)
	return db
}

func MigrateDB(db *gorm.DB) {
	fmt.Println("Migrating data")
	db.Debug().AutoMigrate(&Model{})
}
