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
	UserId    string `gorm:"size:64"`
	RepoId    string `gorm:"size:64"`
	Tag       string
	Git       string // git remote and branch
	Docker    string // docker image
	Metadata  string // model metadata
}

// Compute the unique ID of a Model.
func GetModelId(userId string, repoId string, tag string) string {
	hash := sha1.New()
	io.WriteString(hash, userId)
	io.WriteString(hash, repoId)
	io.WriteString(hash, tag)
	return base64.URLEncoding.EncodeToString(hash.Sum(nil))
}

// AddModel inserts a row of type Model into the database.
func AddModel(db *gorm.DB, model Model) error {
	// compute uuid.
	model.Uid = GetModelId(model.UserId, model.RepoId, model.Tag)
	// database operations.
	err := db.Create(&model).Error
	return err
}
