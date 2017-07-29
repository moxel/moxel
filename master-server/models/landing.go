package models

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"time"
)

type Landing struct {
	Uid       string `gorm:"size:64"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Email     string
}

// AddLanding adds a new email address to the database.
func AddLanding(db *gorm.DB, landing Landing) error {
	landing.Uid = landing.Email
	err := db.Where("uid = ?", landing.Uid).First(&landing).Error
	if err != nil {
		err = db.Create(&landing).Error
		return err
	} else {
		return nil
	}
}
