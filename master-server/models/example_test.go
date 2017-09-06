package models

import (
	"fmt"
	"github.com/jinzhu/gorm"
	"testing"
)

var _ = fmt.Println

func addColorizationExample(t *testing.T, db *gorm.DB) error {
	example := Example{
		Uid:           "abc-efg",
		ModelId:       "strin/colorization:latest",
		ClientLatency: 0.,
		ClientVersion: "superior-client",
	}

	return AddExample(db, example)
}

func addColorizationDemoExample(t *testing.T, db *gorm.DB) error {
	example := DemoExample{
		Uid:     "abc-efg",
		ModelId: "strin/colorization:latest",
	}

	return AddDemoExample(db, example)
}

func TestAddExample(t *testing.T) {
	db, err := CreateDefaultTestDB()
	if err != nil {
		t.Errorf(err.Error())
	}
	err = addColorizationExample(t, db)
	if err != nil {
		t.Errorf(err.Error())
	}

}

func TestListExamples(t *testing.T) {
	db, _ := CreateDefaultTestDB()

	addColorizationExample(t, db)

	examples, err := ListExamples(db, "strin/colorization:latest")
	if err != nil {
		t.Errorf(err.Error())
	}

	if len(examples) != 1 {
		t.Errorf("Examples should have size 1")
	}
}

func TestAddDemoExample(t *testing.T) {
	db, err := CreateDefaultTestDB()
	if err != nil {
		t.Errorf(err.Error())
	}
	err = addColorizationDemoExample(t, db)
	if err != nil {
		t.Errorf(err.Error())
	}

}

func TestListDemoExamples(t *testing.T) {
	db, _ := CreateDefaultTestDB()

	addColorizationDemoExample(t, db)

	examples, err := ListDemoExamples(db, "strin/colorization:latest")
	if err != nil {
		t.Errorf(err.Error())
	}

	if len(examples) != 1 {
		t.Errorf("Demo examples should have size 1")
	}
}
