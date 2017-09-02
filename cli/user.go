package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type User struct{}

func (user *User) Initialized() bool {
	if _, err := os.Stat(user.GetConfigPath()); err == nil {
		return true
	}
	return false
}

func (user *User) UpdateUserConfig(newConfig map[string]interface{}) {
	// create dummy file if not exists
	_, err := os.Stat(GetUserConfigPath())
	if os.IsNotExist(err) {
		var file, err = os.Create(user.GetConfigPath())
		if err != nil {
			fmt.Println("Error:", err.Error())
			return
		}
		defer file.Close()
	}

	config := user.LoadUserConfig()

	for k, v := range newConfig {
		config[k] = v
	}

	configJSON, _ := json.Marshal(config)
	err = ioutil.WriteFile(user.GetConfigPath(), configJSON, 0644)
	if err != nil {
		fmt.Println("Error:", err.Error())
	}
}

func (user *User) Username() string {
	config := user.LoadUserConfig()
	profile := config["profile"].(map[string]interface{})
	return profile["username"].(string)
}

func (user *User) JWT() string {
	config := user.LoadUserConfig()
	return config["JWT"].(string)
}

func (user *User) LoadUserConfig() map[string]interface{} {
	// Load existing config.
	config := make(map[string]interface{})
	data, err := ioutil.ReadFile(user.GetConfigPath())
	if err != nil {
		fmt.Println("Error:", err.Error())
		return config
	}

	err = json.Unmarshal(data, &config)
	if err != nil {
		fmt.Println("Error:", err.Error())
		return config
	}

	return config
}

func (user *User) GetConfigPath() string {
	configPath := GetUserConfigPath()
	Debugln("User configPath = ", configPath)
	return configPath
}
