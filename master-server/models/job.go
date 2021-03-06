package models

import (
	"crypto/sha1"
	"encoding/base32"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"io"
	"strings"
	"time"
)

var _ = fmt.Println

// In Warpdrive, we assume each experiment has a unique Git commit.
type Job struct {
	Uid       string `gorm:"size:64;primary_key"`
	CreatedAt time.Time
	UpdatedAt time.Time
	UserId    string `gorm:"size:64"`
	Name      string `gorm:"size:64"`
	Repo      string
	Commit    string
	Yaml      string
	Status    string
}

// Compute the unique ID of the Job.
func JobId(userId string, repoId string, commit string) string {
	hash := sha1.New()
	io.WriteString(hash, userId)
	io.WriteString(hash, "/")
	io.WriteString(hash, repoId)
	io.WriteString(hash, ":")
	io.WriteString(hash, commit)
	return strings.ToLower(base32.StdEncoding.EncodeToString(hash.Sum(nil)))

}

// Add a Job to the database.
func AddJob(db *gorm.DB, job Job) error {
	job.Uid = JobId(job.UserId, job.Repo, job.Commit)
	err := db.Create(&job).Error
	return err
}

// Update the properties of a Job.
func UpdateJob(db *gorm.DB, job Job) error {
	job.Uid = JobId(job.UserId, job.Repo, job.Commit)
	err := db.Save(&job).Error
	return err
}

// Get Job by Id.
func GetJobById(db *gorm.DB, uid string) (Job, error) {
	job := Job{Uid: uid}
	err := db.Where("uid = ?", uid).First(&job).Error
	return job, err
}

// Get Job by commit.
func GetJobByCommit(db *gorm.DB, userId string, repoId string, commit string) (Job, error) {
	uid := JobId(userId, repoId, commit)
	job, err := GetJobById(db, uid)
	return job, err
}

// Delete job from database.
func DeleteJob(db *gorm.DB, uid string) error {
	job := Job{Uid: uid}
	return db.Delete(&job).Error
}

// List the jobs a user has.
func ListJobByUser(db *gorm.DB, user string) ([]Job, error) {
	var jobs []Job
	err := db.Find(&jobs, "user_id = ?", user).Error
	return jobs, err
}
