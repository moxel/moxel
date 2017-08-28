package main

import (
	"path"
	"testing"
)

func TestGetRepo(t *testing.T) {
	_, err := GetRepo("test/tf-bare-not-exist")
	if err == nil {
		t.Error("Expect git cannot open tf-bare-not-exist")
	}

	_, err = GetRepo("test/tf-bare")
	if err != nil {
		t.Error("Git cannot open tf-bare")
	}

	_, err = GetRepo("test/tf-bare/results")
	if err != nil {
		t.Error("Git cannot open tf-bare under subdir results")
	}

}

func TestLoadSaveYAML(t *testing.T) {
	repo, err := GetRepo("test/tf-bare")
	if err != nil {
		t.Error("Git cannot open tf-bare")
	}

	config, err := LoadYAML(path.Join(repo.Path, "dummy.yml"))
	if err != nil {
		t.Error("Error in loading YAML: " + err.Error())
	}

	err = SaveYAML(path.Join(repo.Path, "dummy.yml"), config)
	if err != nil {
		t.Error("Error in saving YAML: " + err.Error())
	}
}
