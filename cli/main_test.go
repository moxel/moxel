package main

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

var tfObjectDetectionConfig = map[string]interface{}{
	"image": "dummyai/py3-tf-gpu",
	"assets": []string{
		"ssd_mobilenet_v1_coco_11_06_2017/frozen_inference_graph.pb",
	},
	"resources": map[interface{}]interface{}{
		"memory": "512Mi",
		"cpu":    "1",
	},
	"input_space": map[interface{}]interface{}{
		"image": "Image",
	},
	"output_space": map[interface{}]interface{}{
		"boxes": "JSON",
		"vis":   "Image",
	},
	"cmd": []string{
		"cd ..",
		"protoc object_detection/protos/*.proto --python_out=.",
		"cd object_detection",
		"pip install flask",
		"python serve_model.py",
	},
}

func TestVerifyModelConfig(t *testing.T) {
	err := VerifyModelConfig(tfObjectDetectionConfig)
	fmt.Println(err)
	assert.Equal(t, nil, err)
}

func TestInvalidModelConfig(t *testing.T) {
	tfObjectDetectionConfig["xxx"] = "hello"
	err := VerifyModelConfig(tfObjectDetectionConfig)
	fmt.Println(err)
	assert.NotEqual(t, nil, err)
}

func TestInvalidModelInputType(t *testing.T) {
	tfObjectDetectionConfig["input_space"] = map[interface{}]interface{}{
		"image": "image",
	}
	err := VerifyModelConfig(tfObjectDetectionConfig)
	fmt.Println(err)
	assert.NotEqual(t, nil, err)
}

func TestInvalidResourceType(t *testing.T) {
	tfObjectDetectionConfig["resources"] = map[interface{}]interface{}{
		"gpu":    "1",
		"cpu":    "1",
		"memory": "512Mi",
	}
	err := VerifyModelConfig(tfObjectDetectionConfig)
	fmt.Println(err)
	assert.NotEqual(t, nil, err)
}

func TestInvalidModelOutputType(t *testing.T) {
	tfObjectDetectionConfig["output_space"] = map[string]string{
		"image": "Json",
	}
	err := VerifyModelConfig(tfObjectDetectionConfig)
	fmt.Println(err)
	assert.NotEqual(t, nil, err)
}
