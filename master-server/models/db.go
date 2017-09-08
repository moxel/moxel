/*
Package "models" defines the basic database schema. It includes the following files
*/
package models

import (
	"errors"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"os"
	"strings"
)

func CreateDB(dbAddress string) *gorm.DB {
	dbString := fmt.Sprintf("host=%s user=postgres dbname=postgres sslmode=disable password=postgres", dbAddress)
	db, err := gorm.Open("postgres", dbString)
	if err != nil {
		panic(err)
	}

	db.SingularTable(true)
	return db
}

func CreateTestDB(dbFilePath string) (*gorm.DB, error) {
	if !strings.HasPrefix(dbFilePath, "/tmp/") {
		return nil, errors.New("Test DB must starts with path /tmp/")
	}

	if err := os.Remove(dbFilePath); err != nil {
		return nil, err
	}

	db, err := gorm.Open("sqlite3", dbFilePath)
	if err != nil {
		return nil, err
	}
	MigrateDB(db)

	return db, nil
}

func CreateDefaultTestDB() (*gorm.DB, error) {
	return CreateTestDB("/tmp/moxel-test.db")
}

func MigrateDB(db *gorm.DB) {
	fmt.Println("Migrating DB schemas")
	db.Debug().AutoMigrate(&Model{})
	db.Debug().AutoMigrate(&User{})
	db.Debug().AutoMigrate(&Landing{})
	db.Debug().AutoMigrate(&Job{})
	db.Debug().AutoMigrate(&Rating{})
	db.Debug().AutoMigrate(&Example{})
	db.Debug().AutoMigrate(&DemoExample{})
}
