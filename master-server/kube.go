package main

import (
	"bytes"
	"errors"
	"fmt"
	"github.com/dummy-ai/mvp/master-server/models"
	"github.com/google/uuid"
	"io"
	"k8s.io/api/apps/v1beta1"
	batchv1 "k8s.io/api/batch/v1"
	v1 "k8s.io/api/core/v1"
	v1beta1Extensions "k8s.io/api/extensions/v1beta1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/apimachinery/pkg/util/yaml"
	kube "k8s.io/client-go/kubernetes"
	"os"
	"strconv"
	"strings"
	"text/template"
	"time"
)

const kubeNamespace string = v1.NamespaceDefault
const ingressName string = "dummy"

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
        app: {{.Name}}
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
// Warpdrive creates a container that mounts these resources.
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
        app: {{.Name}}
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
        - name: nvidia
          mountPath: "/usr/local/nvidia"
        securityContext:
          privileged: true
          capabilities:
            add:
            - SYS_ADMIN
      volumes:
      - name: nfs
        persistentVolumeClaim:
          claimName: nfs-claim
      - name: secrets
        configMap:
          name: secrets
      - name: fuse
        hostPath:
          path: /dev/fuse
      - name: nvidia
        hostPath:
          path: /var/lib/nvidia-docker/volumes/nvidia_driver/375.26
`

// experiment job template.
// Assume the user already pushes code and asset
// Warpdrive creates a job that
// - mounts these resources in the container.
// - executes the command.
const templateJobV1 = `
apiVersion: batch/v1
kind: Job
metadata:
  name: {{.Name}} 
  labels:
    owner: dummy
spec:
  replicas: 1
  activeDeadlineSeconds: 86400 # in seconds
  template:
    metadata:
      labels:
        owner: nobody
    spec:
      restartPolicy: Never
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
        - name: nvidia
          mountPath: "/usr/local/nvidia"
        securityContext:
          privileged: true
          capabilities:
          add:
          - SYS_ADMIN
      volumes:
      - name: nfs
        persistentVolumeClaim:
          claimName: nfs-claim
      - name: secrets
        configMap:
          name: secrets
      - name: fuse
        hostPath:
          path: /dev/fuse
      - name: nvidia
        hostPath:
          path: /var/lib/nvidia-docker/volumes/nvidia_driver/375.26
`

func panicNil(err error) {
	if err != nil {
		panic(err)
	}
}

func decodeYAML(yamlString string, output interface{}) error {
	reader := strings.NewReader(yamlString)
	return yaml.NewYAMLOrJSONDecoder(reader, 32).Decode(output)
}

func SpecFromTemplate(templateString string, data interface{}, output interface{}) error {
	template, err := template.New(uuid.New().String()).Parse(templateString)
	panicNil(err)

	buf := new(bytes.Buffer)
	err = template.Execute(buf, data)
	panicNil(err)

	specPod := buf.String()
	fmt.Println(specPod)

	return decodeYAML(specPod, &output)
}

func GetDeployName(user string, model string, tag string) string {
	return "deploy-" +
		strings.Replace(user, "-", "--", -1) +
		"-" +
		strings.Replace(model, "-", "--", -1) +
		"-" +
		strings.Replace(tag, ".", "-1", -1)
}

func GetJobName(user string, repo string, commit string) string {
	jobId := models.JobId(user, repo, commit)
	return "job-" + jobId
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
	err := SpecFromTemplate(templateDeployV1, args, &deployment)
	if err != nil {
		return "", err
	}

	fmt.Println(deployment)

	// Create deployment.
	deploymentClient := client.AppsV1beta1().Deployments(kubeNamespace)

	result, err := deploymentClient.Create(&deployment)

	// Extract results.
	if err != nil {
		return "", err
	}
	return result.GetObjectMeta().GetName(), nil
}

func CreateDeployV2(client *kube.Clientset, user string, name string, tag string, commit string, yamlString string, replica int) (string, error) {
	// Load YAML configuration.
	var err error
	var config map[string]interface{}
	decodeYAML(yamlString, &config)

	// Get basic properties.
	image := config["image"].(string)
	resources := config["resources"].(map[string]interface{})
	workPath := config["work_path"].(string)

	// Create git worktree for the container.
	err = CreateRepoMirror(user, name, commit)
	if err != nil {
		fmt.Println("Error: " + err.Error())
	}

	// Command to run in container.
	var command []string

	// Add code root. This is where the code repo sits.
	command = append(command, "--code_root")
	command = append(command, GetRepoMirrorPath(user, name, commit))

	// Add asset root. This is where data / model weights sit.
	command = append(command, "--asset_root")
	command = append(command, GetAssetPath(user, name, commit))

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
	// TODO: use a better separator.
	deployName := GetDeployName(user, name, tag)

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
	err = SpecFromTemplate(templateDeployV2, args, &deployment)
	if err != nil {
		return "", err
	}

	// https://godoc.org/k8s.io/api/core/v1#Container
	container := deployment.Spec.Template.Spec.Containers[0]
	container.Args = command
	fmt.Println(deployment)

	// Set up resource specs.
	container.Resources.Requests = make(v1.ResourceList)
	if cpu, ok := resources["cpu"]; ok {
		container.Resources.Requests["cpu"] = resource.MustParse(fmt.Sprintf("%v", cpu))
	}

	if memory, ok := resources["memory"]; ok {
		container.Resources.Requests["memory"] = resource.MustParse(fmt.Sprintf("%v", memory))
	}

	if gpu, ok := resources["gpu"]; ok {
		container.Resources.Requests["alpha.kubernetes.io/nvidia-gpu"] = resource.MustParse(fmt.Sprintf("%v", gpu))
	}

	deployment.Spec.Template.Spec.Containers[0] = container // Update container spec.

	// Create deployment.
	deploymentClient := client.AppsV1beta1().Deployments(kubeNamespace)

	result, err := deploymentClient.Create(&deployment)

	// Extract results.
	if err != nil {
		return "", err
	}
	return result.GetObjectMeta().GetName(), nil
}

// TODO: Refractor needed. Code duplication with CreateDeployV2.
func CreateJobV1(client *kube.Clientset, commit string, yamlString string) (string, error) {
	// Load YAML configuration.
	var err error
	var config map[string]interface{}
	decodeYAML(yamlString, &config)

	// Get basic properties.
	user := config["user"].(string)
	repo := config["repo"].(string)
	image := config["image"].(string)
	workPath := config["work_path"].(string)
	// name := config["name"].(string)
	// tag := config["tag"].(string)

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

	if assetsInterface != nil && len(assetsInterface.([]interface{})) > 0 {
		command = append(command, "--assets")
		for _, asset := range assetsInterface.([]interface{}) {
			command = append(command, asset.(string))
		}
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

	jobName := GetJobName(user, repo, commit)

	args := struct {
		Name  string
		Image string
	}{
		jobName,
		image,
	}

	var job batchv1.Job
	err = SpecFromTemplate(templateJobV1, args, &job)
	if err != nil {
		return "", err
	}

	job.Spec.Template.Spec.Containers[0].Args = command
	fmt.Println(job.Spec.Template.Spec)

	// Create job.
	jobClient := client.BatchV1().Jobs(kubeNamespace)

	result, err := jobClient.Create(&job)
	fmt.Println(result)
	fmt.Println(err)

	// Extract results.
	if err != nil {
		return "", err
	}
	return result.GetObjectMeta().GetName(), nil
}

// Get the Pod based on the given job.
func GetPodsByJobName(client *kube.Clientset, jobName string) ([]v1.Pod, error) {
	podClient := client.CoreV1().Pods(kubeNamespace)
	var options = metav1.ListOptions{
		LabelSelector: fmt.Sprintf("job-name=%s", jobName),
	}
	pods, err := podClient.List(options)
	return pods.Items, err
}

// Get the Pod based on the given deployment.
func GetPodsByDeployName(client *kube.Clientset, deployName string) ([]v1.Pod, error) {
	podClient := client.CoreV1().Pods(kubeNamespace)
	var options = metav1.ListOptions{
		LabelSelector: fmt.Sprintf("app=%s", deployName),
	}
	pods, err := podClient.List(options)
	return pods.Items, err
}

// Stream logs from a pod.
// Reference implementation: https://github.com/kubernetes/kubernetes/blob/c2e90cd1549dff87db7941544ce15f4c8ad0ba4c/pkg/kubectl/cmd/log.go#L186
func StreamLogsFromPod(client *kube.Clientset, podID string, follow bool, out io.Writer) error {
	logOptions := v1.PodLogOptions{
		Container:  "main",
		Follow:     follow,
		Previous:   false,
		Timestamps: true,
	}

	req := client.CoreV1().RESTClient().Get().
		Namespace(kubeNamespace).
		Name(podID).
		Resource("pods").
		SubResource("log").
		Param("follow", strconv.FormatBool(logOptions.Follow)).
		Param("container", logOptions.Container).
		Param("previous", strconv.FormatBool(logOptions.Previous)).
		Param("timestamps", strconv.FormatBool(logOptions.Timestamps))

	if logOptions.SinceSeconds != nil {
		req.Param("sinceSeconds", strconv.FormatInt(*logOptions.SinceSeconds, 10))
	}
	if logOptions.SinceTime != nil {
		req.Param("sinceTime", logOptions.SinceTime.Format(time.RFC3339))
	}
	if logOptions.LimitBytes != nil {
		req.Param("limitBytes", strconv.FormatInt(*logOptions.LimitBytes, 10))
	}
	if logOptions.TailLines != nil {
		req.Param("tailLines", strconv.FormatInt(*logOptions.TailLines, 10))
	}
	readCloser, err := req.Stream()
	if err != nil {
		return err
	}

	defer readCloser.Close()
	_, err = io.Copy(out, readCloser)
	_, err = io.Copy(os.Stdout, readCloser)
	return err
}

// Stream logs from a job.
func StreamLogsFromJob(client *kube.Clientset, jobName string, follow bool, out io.Writer) error {
	pods, err := GetPodsByJobName(client, jobName)
	if err != nil {
		return err
	}

	if len(pods) == 0 {
		return errors.New(fmt.Sprintf("Cannot find job with given name: %s", jobName))
	}

	podId := pods[0].GetObjectMeta().GetName()

	return StreamLogsFromPod(client, podId, follow, out)
}

// Stream logs from a model.
func StreamLogsFromModel(client *kube.Clientset, userId string, modelName string, tag string, follow bool, out io.Writer) error {
	deployName := GetDeployName(userId, modelName, tag)

	pods, err := GetPodsByDeployName(client, deployName)
	if err != nil {
		return err
	}

	if len(pods) == 0 {
		return errors.New(fmt.Sprintf("Cannot find job with given name: %s", deployName))
	}

	podId := pods[0].GetObjectMeta().GetName()

	fmt.Println("Log from pod", podId)

	return StreamLogsFromPod(client, podId, follow, out)
}

func CreateService(client *kube.Clientset, deployName string) error {
	serviceSpec := &v1.Service{
		TypeMeta: metav1.TypeMeta{
			Kind:       "Service",
			APIVersion: "v1beta1",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: deployName,
		},
		Spec: v1.ServiceSpec{
			Type:     v1.ServiceTypeNodePort,
			Selector: map[string]string{"app": deployName},
			Ports: []v1.ServicePort{
				v1.ServicePort{
					Protocol: v1.ProtocolTCP,
					Port:     5900,
					TargetPort: intstr.IntOrString{
						Type:   intstr.Int,
						IntVal: 5900,
					},
				},
			},
		},
	}

	services := client.CoreV1().Services(kubeNamespace)
	service, err := services.Get(deployName, metav1.GetOptions{})

	switch {
	case err == nil:
		serviceSpec.ObjectMeta.ResourceVersion = service.ObjectMeta.ResourceVersion
		serviceSpec.Spec.ClusterIP = service.Spec.ClusterIP
		_, err = services.Update(serviceSpec)
	case k8sErrors.IsNotFound(err):
		_, err = services.Create(serviceSpec)
	}

	return err
}

func AddServiceToIngress(client *kube.Clientset, path string, serviceName string) error {
	ingresses := client.ExtensionsV1beta1().Ingresses(kubeNamespace)
	ingress, err := ingresses.Get(ingressName, metav1.GetOptions{})

	modelBackend := &v1beta1Extensions.IngressBackend{
		ServiceName: serviceName,
		ServicePort: intstr.IntOrString{
			Type:   intstr.Int,
			IntVal: 5900,
		},
	}
	if k8sErrors.IsNotFound(err) {
		defaultBackend := &v1beta1Extensions.IngressBackend{
			ServiceName: "default-http-backend",
			ServicePort: intstr.IntOrString{
				Type:   intstr.Int,
				IntVal: 80,
			},
		}
		ingressSpec := &v1beta1Extensions.Ingress{
			TypeMeta: metav1.TypeMeta{
				Kind:       "Ingress",
				APIVersion: "v1beta1",
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: ingressName,
				Annotations: map[string]string{
					"ingress.kubernetes.io/ssl-redirect":          "false",
					"kubernetes.io/ingress.class":                 "nginx",
					"ingress.kubernetes.io/rewrite-target":        "/",
					"kubernetes.io/ingress.global-static-ip-name": "dummy-ingress",
					"ingress.kubernetes.io/proxy-body-size":       "500m",
					"nginx/client_max_body_size":                  "500m",
				},
			},
			Spec: v1beta1Extensions.IngressSpec{
				Backend: defaultBackend,
				Rules: []v1beta1Extensions.IngressRule{
					v1beta1Extensions.IngressRule{
						IngressRuleValue: v1beta1Extensions.IngressRuleValue{
							HTTP: &v1beta1Extensions.HTTPIngressRuleValue{
								Paths: []v1beta1Extensions.HTTPIngressPath{
									v1beta1Extensions.HTTPIngressPath{
										Path:    path,
										Backend: *modelBackend,
									},
								},
							},
						},
					},
				},
			},
		}
		_, err = ingresses.Create(ingressSpec)
	} else if err == nil {
		// check if the path already exists.
		paths := []v1beta1Extensions.HTTPIngressPath{}
		if len(ingress.Spec.Rules) > 0 {
			paths = ingress.Spec.Rules[0].IngressRuleValue.HTTP.Paths
		}

		for _, rule := range paths {
			if rule.Path == path {
				return fmt.Errorf("Ingress rule already exists for path %s", path)
			}
		}

		newPaths := append(paths,
			v1beta1Extensions.HTTPIngressPath{
				Path:    path,
				Backend: *modelBackend,
			},
		)

		if len(ingress.Spec.Rules) == 0 {
			ingress.Spec.Rules = []v1beta1Extensions.IngressRule{
				v1beta1Extensions.IngressRule{
					IngressRuleValue: v1beta1Extensions.IngressRuleValue{
						HTTP: &v1beta1Extensions.HTTPIngressRuleValue{
							Paths: newPaths,
						},
					},
				},
			}
		} else {
			ingress.Spec.Rules[0].IngressRuleValue.HTTP.Paths = newPaths
		}
		_, err = ingresses.Update(ingress)
	}
	return err
}

func RemoveServiceFromIngress(client *kube.Clientset, path string) error {
	ingresses := client.ExtensionsV1beta1().Ingresses(kubeNamespace)
	ingress, err := ingresses.Get(ingressName, metav1.GetOptions{})

	if err == nil {
		paths := []v1beta1Extensions.HTTPIngressPath{}
		if len(ingress.Spec.Rules) == 0 {
			return errors.New("There is zero ingress rules. Cannot delete")
		}

		paths = ingress.Spec.Rules[0].IngressRuleValue.HTTP.Paths

		index := -1
		for i, rule := range paths {
			if rule.Path == path {
				index = i
				break
			}
		}

		if index == -1 {
			return errors.New(fmt.Sprintf("Path %s not found in ingress", path))
		}
		paths = append(paths[:index], paths[index+1:]...)
		fmt.Println("paths", paths)

		if len(paths) == 0 {
			ingress.Spec.Rules = []v1beta1Extensions.IngressRule{}
		} else {
			ingress.Spec.Rules[0].IngressRuleValue.HTTP.Paths = paths
		}

		_, err = ingresses.Update(ingress)
	}
	return err
}

func ListDeploy(client *kube.Clientset) ([]string, error) {
	var names []string

	deploymentClient := client.AppsV1beta1().Deployments(kubeNamespace)

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
	deploymentClient := client.AppsV1beta1().Deployments(kubeNamespace)

	deletePolicy := metav1.DeletePropagationForeground
	err := deploymentClient.Delete(name,
		&metav1.DeleteOptions{
			PropagationPolicy: &deletePolicy,
		})

	return err
}

func TeardownService(client *kube.Clientset, name string) error {
	services := client.CoreV1().Services(kubeNamespace)

	err := services.Delete(name, &metav1.DeleteOptions{})
	return err
}
