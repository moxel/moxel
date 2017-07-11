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

// V1 deployment template
// Assume the user has packaged the model in a docker container.
// All we need to do is to ship the container to cloud.
const templateDeployV1 = `
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

// V2 deployment template
// Assume the user pushes code and assets.
// We will create a container that mounts these resources.
const templateDeployV2 = `
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
        volumeMounts:
        - name: nfs
          mountPath: "/mnt/nfs"
        - name: secrets
          mountPath: "/secrets"
        - name: fuse
          mountPath: "/dev/fuse"
        securityContext:
          privileged: true
          capabilities:
            add:
            - SYS_ADMIN
      volumes:
      - name: nfs
        persistentVolumeClaim:
          claimName: nfs-east-claim
      - name: secrets
        configMap:
          name: secrets
      - name: fuse
        hostPath:
          path: /dev/fuse
`

func panicNil(err error) {
	if err != nil {
		panic(err)
	}
}

func decodeYAML(yamlString string, output interface{}) {
	reader := strings.NewReader(yamlString)
	yaml.NewYAMLOrJSONDecoder(reader, 32).Decode(output)
}

func SpecFromTemplate(templateString string, data interface{}, output interface{}) {
	template, err := template.New(uuid.New().String()).Parse(templateString)
	panicNil(err)

	buf := new(bytes.Buffer)
	err = template.Execute(buf, data)
	panicNil(err)

	specPod := buf.String()
	fmt.Println(specPod)

	decodeYAML(specPod, &output)
}

func CreateDeployV1(client *kube.Clientset, name string, image string, replica int) (string, error) {
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
	SpecFromTemplate(templateDeployV1, args, &deployment)

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

func CreateDeployV2(client *kube.Clientset, commit string, yamlString string, replica int) (string, error) {
	// Load YAML configuration.
	var err error
	var config map[string]interface{}
	decodeYAML(yamlString, &config)

	// Get basic properties.
	user := config["user"].(string)
	name := config["name"].(string)
	repo := config["repo"].(string)
	tag := config["tag"].(string)
	image := config["image"].(string)
	workPath := config["work_path"].(string)

	// Create git worktree for the container.
	err = CreateRepoMirror(user, repo, commit)
	if err != nil {
		fmt.Println("Error: " + err.Error())
	}

	// Command to run in container.
	var command []string

	// Add code root. This is where the code repo sits.
	command = append(command, "--code_root")
	command = append(command, GetRepoMirrorPath(user, repo, commit))

	// Add asset root. This is where data / model weights sit.
	command = append(command, "--asset_root")
	command = append(command, GetAssetPath(user, repo, commit))

	// Add working path.
	command = append(command, "--work_path")
	command = append(command, workPath)

	// Add assets
	assetsInterface := config["assets"]

	command = append(command, "--assets")
	for _, asset := range assetsInterface.([]interface{}) {
		command = append(command, asset.(string))
	}

	// Add command.
	commandInterface := config["cmd"]
	command = append(command, "--cmd")

	var cmd string
	for _, line := range commandInterface.([]interface{}) {
		cmd += line.(string) + " ; "
	}
	command = append(command, cmd)

	fmt.Println("command", command)

	// Basic derived properties for deployment.
	deployName := user + "." + name + "." + tag

	args := struct {
		Name    string
		Replica int
		Image   string
	}{
		deployName,
		replica,
		image,
	}

	var deployment v1beta1.Deployment
	SpecFromTemplate(templateDeployV2, args, &deployment)

	// https://godoc.org/k8s.io/api/core/v1#Container
	deployment.Spec.Template.Spec.Containers[0].Args = command
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
