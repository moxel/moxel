package main

import (
	"bytes"
	"fmt"
	"github.com/google/uuid"
	"k8s.io/api/apps/v1beta1"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/util/yaml"
	kube "k8s.io/client-go/kubernetes"
	"strings"
	"text/template"
)

const templateDeploy = `
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: tf-object-detection
spec:
  replicas: {{.Replica}}
  template:
    metadata:
      name: {{.Name}}
      labels:
        app: {{.Name}}
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

func CreateDeploy(client *kube.Clientset, name string, image string, replica int) {
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
	panicNil(err)
	fmt.Printf("Created deployment %q.\n", result.GetObjectMeta().GetName())
}
