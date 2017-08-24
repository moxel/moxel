package models

import (
	"crypto/sha1"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"gopkg.in/yaml.v2"
	"io"
	"time"
)

var _ = fmt.Println

type Model struct {
	Uid       string `gorm:"size:64;primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	// TODO: check size.
	UserId string `gorm:"size:64"`
	Name   string `gorm:"size:64"`
	Tag    string
	Repo   string
	Commit string
	Yaml   string
	Status string
}

// Convert model struct to map representation.
func (model *Model) ToMap() map[string]interface{} {
	var metadata map[interface{}]interface{}
	yaml.Unmarshal([]byte(model.Yaml), &metadata)
	return cleanupInterfaceMap(map[interface{}]interface{}{
		"uid":      model.Uid,
		"name":     model.Name,
		"tag":      model.Tag,
		"status":   model.Status,
		"yaml":     model.Yaml,
		"metadata": metadata,
	})
}

// Convert model struct to JSON representation.
func (model *Model) ToJSON() (string, error) {
	result, err := json.Marshal(model.ToMap())
	return string(result), err
}

// Compute the unique ID of a Model.
func ModelId(userId string, name string, tag string) string {
	const mode string = "NATURAL"

	if mode == "SHA1" {
		hash := sha1.New()
		io.WriteString(hash, userId)
		io.WriteString(hash, name)
		io.WriteString(hash, tag)
		return base64.URLEncoding.EncodeToString(hash.Sum(nil))
	} else if mode == "NATURAL" {
		return userId + "/" + name + ":" + tag
	} else {
		panic(errors.New(fmt.Sprintf("Unknown mode to compute ModelId: %s", mode)))
	}
}

// AddModel inserts a row of Model into the database.
func AddModel(db *gorm.DB, model Model) error {
	// compute uuid.
	model.Uid = ModelId(model.UserId, model.Name, model.Tag)
	// database operations.
	err := db.Create(&model).Error
	return err
}

// UpdateModel updates a row of Model based on ModelId.
func UpdateModel(db *gorm.DB, model Model) error {
	// compute uuid.
	model.Uid = ModelId(model.UserId, model.Name, model.Tag)

	err := db.Save(&model).Error
	return err
}

// GetModelById retrieves the model by Uid
func GetModelById(db *gorm.DB, modelId string) (Model, error) {
	model := Model{Uid: modelId}
	err := db.Where("uid = ?", modelId).First(&model).Error
	return model, err
}

// DeleteModel removes a row of Model from the database.
func DeleteModel(db *gorm.DB, modelId string) error {
	model := Model{Uid: modelId}
	return db.Delete(&model).Error
}

// ListModelByUser lists models that belong to UserId.
func ListModelByUser(db *gorm.DB, userId string) ([]Model, error) {
	var models []Model
	err := db.Find(&models, "user_id = ?", userId).Error

	return models, err
}

func ListModelAll(db *gorm.DB) ([]Model, error) {
	var models []Model
	err := db.Find(&models).Error

	return models, err
}

// ListModelByUser lists models that belong to UserId and modelName.
func ListModelByUserAndName(db *gorm.DB, userId string, modelName string) ([]Model, error) {
	var models []Model
	err := db.Find(&models, "user_id = ? AND name = ?", userId, modelName).Error

	return models, err
}
