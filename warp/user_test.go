package main

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"os"
	"testing"
)

type UserMock struct {
	User
}

func (user *UserMock) GetConfigPath() string {
	fmt.Println("Get config")
	home := "/tmp/dummy"
	if _, err := os.Stat(home); err != nil && os.IsNotExist(err) {
		os.Mkdir(home, 0644)
	}
	return "/tmp/dummy"
}

func TestGetUserConfigPath(t *testing.T) {
	user := UserMock{}
	assert.Equal(t, "/tmp/dummy", user.GetConfigPath())
}

func TestUpdateUserConfig(t *testing.T) {
	user := User{}
	user.GetConfigPath()
}
