/*
Package "models" defines the basic database schema. It includes the following files
*/
package models

import (
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

const dbAddress = "35.185.221.185"

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
	dbString := fmt.Sprintf("host=%s user=postgres dbname=postgres sslmode=disable password=postgres", dbAddress)
	db, err := gorm.Open("postgres", dbString)
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
