package models

import (
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"io"
	"time"
)

var _ = fmt.Println

type Model struct {
	Uid       string `gorm:"size:64;primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	// TODO: check size.
	Name   string `gorm:"size:64"`
	UserId string `gorm:"size:64"`
	Tag    string
	Yaml   string
	Status string
}

// Compute the unique ID of a Model.
func ModelId(userId string, Name string, tag string) string {
	hash := sha1.New()
	io.WriteString(hash, userId)
	io.WriteString(hash, Name)
	io.WriteString(hash, tag)
	return base64.URLEncoding.EncodeToString(hash.Sum(nil))
}

// AddModel inserts a row of Model into the database.
func AddModel(db *gorm.DB, model Model) error {
	// compute uuid.
	model.Uid = ModelId(model.UserId, model.Name, model.Tag)
	// database operations.
	err := db.Create(&model).Error
	return err
}

// GetModelById retrieves the model by Uid
func GetModelById(db *gorm.DB, modelId string) Model {
	model := Model{Uid: modelId}
	db.Where("uid = ?", modelId).First(&model)
	return model
}

// DeleteModel removes a row of Model from the database.
func DeleteModel(db *gorm.DB, modelId string) error {
	model := Model{Uid: modelId}
	return db.Delete(&model).Error
}
