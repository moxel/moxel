package models

import (
	// "fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"time"
)

type Example struct {
	Uid           string `gorm:"size:64;primary_key"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
	ModelId       string
	ClientLatency float32
	ClientVersion string
}

type DemoExample struct {
	Uid     string `gorm:"size:64;primary_key"`
	ModelId string
}

func AddExample(db *gorm.DB, example Example) error {
	err := db.Create(&example).Error
	return err
}

func AddDemoExample(db *gorm.DB, example DemoExample) error {
	err := db.Create(&example).Error
	return err
}

func ListExamples(db *gorm.DB, modelId string) ([]Example, error) {
	var examples []Example
	err := db.Find(&examples, "model_id = ?", modelId).Error
	return examples, err
}

func ListDemoExamples(db *gorm.DB, modelId string) ([]DemoExample, error) {
	var examples []DemoExample
	err := db.Find(&examples, "model_id = ?", modelId).Error
	return examples, err
}
