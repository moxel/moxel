package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

func UpdateUserConfig(newConfig map[string]interface{}) {
	// create dummy file if not exists
	_, err := os.Stat(GetUserConfigPath())
	if os.IsNotExist(err) {
		fmt.Println("not exist")
		var file, err = os.Create(GetUserConfigPath())
		if err != nil {
			fmt.Println("Error:", err.Error())
			return
		}
		defer file.Close()
	}

	config := LoadUserConfig()

	for k, v := range newConfig {
		config[k] = v
	}

	configJSON, _ := json.Marshal(config)
	err = ioutil.WriteFile(GetUserConfigPath(), configJSON, 0644)
	if err != nil {
		fmt.Println("Error:", err.Error())
	}
}

func LoadUserConfig() map[string]interface{} {
	// Load existing config.
	config := make(map[string]interface{})
	data, err := ioutil.ReadFile(GetUserConfigPath())
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
