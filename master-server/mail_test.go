package main

import (
	"io/ioutil"
	"testing"
)

func TestSendWelcomeEmail(t *testing.T) {
	template := "Hi, *|name|*"
	data := map[string]string{
		"name":      "Tim",
		"recipient": "stl501@gmail.com",
	}

	err := SendTemplateEmail("Hi from Moxel", template, []map[string]string{data})
	if err != nil {
		t.Errorf(err.Error())
	}
}

func TestSendTemplateEmail(t *testing.T) {
	templateData, _ := ioutil.ReadFile("templates/new-model.html")
	template := string(templateData)
	data := map[string]string{
		"user":        "strin",
		"author":      "futurulus",
		"model":       "color-describer",
		"title":       "Generating Compositional Color Descriptions",
		"description": `This is the model from the paper Learning to Generate Compositional Color Descriptions (Monroe, Goodman & Potts, 2016). It takes a color as input and produces a description based on data from the xkcd Color Survey assembled by McMahan & Stone (2015). Try running it more than once with the same color!`,
		"link":        "http://beta.moxel.ai/models/futurulus/color-describer/latest",
		"recipient":   "tim@moxel.ai",
	}

	err := SendTemplateEmail("[Test] A New Model is Live!", template, []map[string]string{data})
	if err != nil {
		t.Errorf(err.Error())
	}
}
