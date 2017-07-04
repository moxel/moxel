package main

import (
	"fmt"
	kube "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"testing"
)

var _ = fmt.Println

func TestCreateDeploy(t *testing.T) {
	kubeconfig := "admin.conf"
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err)
	}

	client, err := kube.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	CreateDeploy(client, "tf-object-detection", "dummyai/tf-object-detection", 1)
}
