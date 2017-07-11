// Running these test cases require setting up a kube cluster first.
// TODO: automatically run CreateDeployV1, ListDeploy and DeleteDeploy in order.
package main

import (
	"errors"
	"fmt"
	"gopkg.in/yaml.v2"
	kube "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"testing"
)

var _ = fmt.Println

const deploymentTarget = "tf-object-detection"
const kubeconfig = "secrets/admin.conf"

// Given the path to kube config file, create a Clientset.
func createClient(kubeconfig string) *kube.Clientset {
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err)
	}

	client, err := kube.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	return client
}

// Test creating a deployment.
func TestCreateDeployV1(t *testing.T) {
	client := createClient(kubeconfig)

	name, err := CreateDeployV1(client, deploymentTarget, "dummyai/tf-object-detection", 1)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Created deployment %q.\n", name)

	if name != deploymentTarget {
		panic(errors.New(fmt.Sprintf("Name of deployed target %s does not match %s",
			name, deploymentTarget)))
	}
}

// Test creating a deployment.
func TestCreateDeployV2(t *testing.T) {
	client := createClient(kubeconfig)

	data := map[string]interface{}{
		"user":      "dummy",
		"name":      "tf-object-detection",
		"repo":      "tf-object-detection",
		"tag":       "latest",
		"image":     "dummyai/py3-tf-cpu",
		"work_path": "object_detection",
		"assets": []string{
			"ssd_mobilenet_v1_coco_11_06_2017/frozen_inference_graph.pb",
		},
		"cmd": "ls -hl",
	}
	yamlBytes, err := yaml.Marshal(&data)
	if err != nil {
		panic(err)
	}
	yamlString := string(yamlBytes)
	fmt.Println("yaml", yamlString)

	name, err := CreateDeployV2(client, "b0ca1187039c30aa38bfae23d2034b17d6cc35f9", yamlString, 1)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Created deployment %q.\n", name)
}

// Test listing existing deployment.
func TestListDeploy(t *testing.T) {
	client := createClient(kubeconfig)

	names, err := ListDeploy(client)
	if err != nil {
		panic(err)
	}

	foundDeploy := false
	for _, name := range names {
		fmt.Printf("%s\n", name)
		if name == deploymentTarget {
			foundDeploy = true
		}
	}

	if foundDeploy == false {
		panic(errors.New(fmt.Sprintf("Cannot find deployed target %s", deploymentTarget)))
	}
}

// Test tearing down a deployment.
func TestDeleteDeploy(t *testing.T) {
	client := createClient(kubeconfig)

	TeardownDeploy(client, deploymentTarget)
}
