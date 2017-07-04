package main

import (
	"bytes"
	"fmt"
	"github.com/google/uuid"
	"k8s.io/api/apps/v1beta1"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/yaml"
	kube "k8s.io/client-go/kubernetes"
	"strings"
	"text/template"
)

const templateDeploy = `
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: {{.Name}} 
spec:
  replicas: {{.Replica}}
  template:
    metadata:
      name: {{.Name}}
      labels:
        app: dummy
    spec:
      containers:
      - name: main
        image: {{.Image}}
        ports:
        - containerPort: 5900
        tty: true
`

func panicNil(err error) {
	if err != nil {
		panic(err)
	}
}

func SpecFromTemplate(templateString string, data interface{}, output interface{}) {
	template, err := template.New(uuid.New().String()).Parse(templateString)
	panicNil(err)

	buf := new(bytes.Buffer)
	err = template.Execute(buf, data)
	panicNil(err)

	specPod := buf.String()
	fmt.Println(specPod)

	reader := strings.NewReader(specPod)
	yaml.NewYAMLOrJSONDecoder(reader, 32).Decode(output)
}

func CreateDeploy(client *kube.Clientset, name string, image string, replica int) (string, error) {
	// Instantiate templates.
	args := struct {
		Name    string
		Replica int
		Image   string
	}{
		name,
		replica,
		image,
	}
	var deployment v1beta1.Deployment
	SpecFromTemplate(templateDeploy, args, &deployment)

	fmt.Println(deployment)

	// Create deployment.
	deploymentClient := client.AppsV1beta1().Deployments(v1.NamespaceDefault)

	result, err := deploymentClient.Create(&deployment)

	// Extract results.
	if err != nil {
		return "", err
	}
	return result.GetObjectMeta().GetName(), nil
}

func ListDeploy(client *kube.Clientset) ([]string, error) {
	var names []string

	deploymentClient := client.AppsV1beta1().Deployments(v1.NamespaceDefault)

	list, err := deploymentClient.List(metav1.ListOptions{LabelSelector: "app=dummy"})
	if err != nil {
		return names, err
	}

	for _, d := range list.Items {
		names = append(names, d.Name)
	}

	return names, nil
}

func TeardownDeploy(client *kube.Clientset, name string) error {
	deploymentClient := client.AppsV1beta1().Deployments(v1.NamespaceDefault)

	deletePolicy := metav1.DeletePropagationForeground
	err := deploymentClient.Delete(name,
		&metav1.DeleteOptions{
			PropagationPolicy: &deletePolicy,
		})

	return err
}
