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
	fmt.Println("Migrating DB schemas")
	db.Debug().AutoMigrate(&Model{})
	db.Debug().AutoMigrate(&User{})
	db.Debug().AutoMigrate(&Landing{})
	db.Debug().AutoMigrate(&Job{})
}
