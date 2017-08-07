package models

import (
	// "fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"time"
)

type Rating struct {
	Uid       string `gorm:"size:64;primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	UserId    string
	ModelId   string
	Value     float64
}

func RatingId(userId string, modelId string) string {
	return userId + "/" + modelId
}

func GetRatingById(db *gorm.DB, uid string) (Rating, error) {
	rating := Rating{Uid: uid}
	err := db.Where("uid = ?", uid).First(&rating).Error
	return rating, err
}

func UpdateRating(db *gorm.DB, userId string, modelId string, value float64) error {
	rating, err := GetRatingById(db, RatingId(userId, modelId))
	if err != nil {
		rating = Rating{Uid: RatingId(userId, modelId),
			UserId:  userId,
			ModelId: modelId,
			Value:   value,
		}
	} else {
		rating.Value = value
	}

	err = db.Save(&rating).Error

	return err

}

func DeleteRating(db *gorm.DB, uid string) error {
	rating := Rating{Uid: uid}
	return db.Delete(&rating).Error
}
