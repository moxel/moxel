package models

import (
	// "fmt"
	//"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"time"
)

type User struct {
	Uid       string `gorm:"size:64"`
	CreatedAt time.Time
	UpdatedAt time.Time
	UserName  string
	FullName  string
	Email     string
}
