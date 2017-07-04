// Running these test cases require setting up a kube cluster first.
// TODO: automatically run CreateDeploy, ListDeploy and DeleteDeploy in order.
package main

import (
	"errors"
	"fmt"
	kube "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"testing"
)

var _ = fmt.Println

const deploymentTarget = "tf-object-detection"
const kubeconfig = "admin.conf"

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
func TestCreateDeploy(t *testing.T) {
	client := createClient(kubeconfig)

	name, err := CreateDeploy(client, deploymentTarget, "dummyai/tf-object-detection", 1)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Created deployment %q.\n", name)

	if name != deploymentTarget {
		panic(errors.New(fmt.Sprintf("Name of deployed target %s does not match %s",
			name, deploymentTarget)))
	}
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
