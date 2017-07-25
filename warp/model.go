package main

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
)

func LoadYAML(yamlPath string) (map[string]interface{}, error) {
	data, err := ioutil.ReadFile(yamlPath)
	config := make(map[string]interface{})
	if err != nil {
		return nil, err
	}
	yaml.Unmarshal(data, &config)
	return config, nil
}

func SaveYAML(yamlPath string, config map[string]interface{}) error {
	data, err := yaml.Marshal(config)
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(yamlPath, data, 0644)
	if err != nil {
		return err
	}
	return nil
}

func InitModelConfig(name string) map[string]interface{} {
	return map[string]interface{}{
		"type":        "model",
		"name":        name,
		"description": "A gorgeous model",
		"tag":         "0.0.0",
		"setup":       []string{},
		"labels":      []string{},
		"image":       "dummyai/python3",
	}
}
