package main

import (
	"errors"
	"fmt"
	"github.com/urfave/cli"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"
)

// Parse a modelId of format <modelName>:<tag> into parts.
// Return modelName, tag, error.
func ParseModelId(modelId string) (string, string, error) {
	modelIdParts := strings.Split(modelId, ":")

	if len(modelIdParts) != 2 {
		return "", "", errors.New("Ill-formatted model id \"" + modelId + "\". Should be [model]:[tag].")
	}

	modelName := modelIdParts[0]

	if strings.Contains(modelName, "/") {
		return "", "", errors.New(fmt.Sprintf("Ill-formatted model name %s: shouldn't contain /", modelName))
	}

	tag := modelIdParts[1]

	return modelName, tag, nil
}

// Deploy model LIVE.
func DeployModel(modelName string, tag string) error {
	fmt.Println(fmt.Sprintf("> Deploying model %s:%s", modelName, tag))
	resp, err := GlobalAPI.DeployModel(GlobalUser.Username(), modelName, tag)
	if err != nil {
		return err
	}

	if resp.StatusCode != 200 {
		fmt.Println("Error:", resp.String())
		return nil
	}

	if err := WaitForModelStatus(modelName, tag, "LIVE"); err != nil {
		return err
	}

	fmt.Println(fmt.Sprintf("Successfully deployed %s:%s", modelName, tag))
	return nil
}

func LogModel(modelName string, modelTag string) error {
	fmt.Println("> Model is now LIVE! Showing logs...")
	fmt.Println("-------------------------------------------")

	// Stream logs from model.
	err := GlobalAPI.LogModel(GlobalUser.Username(), modelName, modelTag, os.Stdout, true)
	if err != nil {
		return err
	}
	return nil
}

// Push code to Git repo.
// Return (commit, error)
func PushCode(repo *Repo, modelName string) (string, error) {
	url, err := GlobalAPI.GetRepoURL(GlobalUser.Username(), modelName)
	if err != nil {
		return "", errors.New(fmt.Sprintf("Failed to reach remote repo: %s", err.Error()))
	}

	fmt.Println("> Pushing code...")
	commit, err := repo.PushCode(GlobalAPI.authToken, url)
	if err != nil {
		return "", errors.New("Failed to push code: " + err.Error())
	}
	return commit, nil
}

// Push assets to Git repo.
func PushAssets(repo *Repo, modelName string, commit string, config map[string]interface{}) error {
	fmt.Println("> Uploading model files...")

	if assets, ok := config["assets"]; ok {
		// Normalize the asset paths.
		var assetPaths []string
		if assets != nil {
			for _, asset := range assets.([]interface{}) {
				assetPath, _ := filepath.Abs(asset.(string))
				assetInfo, _ := os.Stat(assetPath)
				if assetInfo.Mode().IsDir() {
					filepath.Walk(assetPath, func(path string, f os.FileInfo, err error) error {
						fmt.Printf("Visited: %s\n", path)
						if assetInfo, _ := os.Stat(path); !assetInfo.Mode().IsDir() {
							path, _ = filepath.Rel(repo.Path, path)
							assetPaths = append(assetPaths, path)
						}
						return nil
					})
				} else {
					assetPath, _ = filepath.Rel(repo.Path, assetPath)
					assetPaths = append(assetPaths, assetPath)
				}
			}
			fmt.Println("assetPaths", assetPaths)
		}
		// Push data to cloud.
		if err := repo.PushData(assetPaths, GlobalUser.Username(), modelName, commit); err != nil {
			return errors.New(fmt.Sprintf("Failed to push data: %s", err.Error()))
		}
	}
	return nil
}

func WaitForModelStatus(modelName string, modelTag string, targetStatus string) error {
	for {
		modelData, err := GetModel(modelName, modelTag)
		if err != nil {
			return err
		}
		modelStatus := modelData["status"]

		if modelStatus != targetStatus {
			fmt.Println(fmt.Sprintf("Waiting model to be %s. Currently, it's %s", targetStatus, modelStatus))
			time.Sleep(3 * time.Second)
		} else {
			break
		}
	}

	return nil
}

func TeardownModel(modelName string, modelTag string, block bool) error {
	fmt.Println(fmt.Sprintf("> Tearing down model %s:%s. This might take a while.", modelName, modelTag))
	resp, err := GlobalAPI.TeardownDeployModel(GlobalUser.Username(), modelName, modelTag)
	if err != nil {
		return err
	}

	if block {
		if err := WaitForModelStatus(modelName, modelTag, "INACTIVE"); err != nil {
			return err
		}
	}

	if resp.StatusCode != 200 {
		return errors.New(resp.String())
	}
	return nil
}

// Create or update a model.
func PutModel(modelName string, tag string, commit string, spec map[string]interface{}) error {
	resp, err := GlobalAPI.PutModel(GlobalUser.Username(), modelName, tag, commit, nil, spec)
	if err != nil {
		return err
	}
	if resp.StatusCode != 200 {
		return errors.New("Cannot save model:" + resp.String())
	}
	return nil
}

// Get model metadata.
func GetModel(modelName string, tag string) (map[string]string, error) {
	var modelData map[string]string
	resp, err := GlobalAPI.GetModel(GlobalUser.Username(), modelName, tag)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Failed to get model data: %s", err.Error()))
	}
	if resp.StatusCode != 200 {
		msg := resp.String()
		fmt.Println("Error:", msg)
		return nil, errors.New(msg)
	}
	resp.JSON(&modelData)
	return modelData, nil
}

// Delete model.
func DeleteModel(modelName string, tag string) error {
	resp, err := GlobalAPI.DeleteModel(GlobalUser.Username(), modelName, tag)
	if err != nil {
		return err
	}

	if resp.StatusCode != 200 {
		msg := resp.String()
		fmt.Println("Error: ", msg)
		return errors.New(msg)
	}
	return nil
}

func VerifyVariableFormat(variable string) error {
	varPattern, _ := regexp.Compile(`^[a-zA-Z0-9_]*$`)
	if !varPattern.MatchString(variable) {
		return errors.New(fmt.Sprintf("Variable \"%s\" does not match required format %s", variable, varPattern))
	}
	return nil
}

// Verify if the model configuration has the correct format.
func VerifyModelConfig(config map[string]interface{}) error {
	// Check if all keys in config are in whitelist.
	// `YAMLWhitelist` is defined in `constants.go`
	for k, _ := range config {
		if _, ok := YAMLWhitelist[k]; ok {
		} else {
			return errors.New("Unknown key in YAML: \"" + k + "\"")
		}
	}

	// Check if all required keys in whitelist are in config.
	for k, v := range YAMLWhitelist {
		_, ok := config[k]
		if v && !ok {
			return errors.New(fmt.Sprintf("Required key %s is not in YAML", k))
		}
	}

	// Check model input types.
	inputSpace := config["input_space"].(map[interface{}]interface{})
	for k, v := range inputSpace {
		if err := VerifyVariableFormat(k.(string)); err != nil {
			return err
		}

		if _, ok := TypeWhitelist[v.(string)]; !ok {
			return errors.New(fmt.Sprintf("Input type %s is not valid", v.(string)))
		}
	}

	// Check model output types.
	outputSpace := config["output_space"].(map[interface{}]interface{})
	for k, v := range outputSpace {
		if err := VerifyVariableFormat(k.(string)); err != nil {
			return err
		}

		if _, ok := TypeWhitelist[v.(string)]; !ok {
			return errors.New(fmt.Sprintf("Output type %s is not valid", v.(string)))
		}
	}

	// Check resources.
	if config["resources"] != nil {
		for k, _ := range config["resources"].(map[interface{}]interface{}) {
			if _, ok := ResourceWhitelist[k.(string)]; !ok {
				return errors.New(fmt.Sprintf("Resource type %s is not supported", k.(string)))
			}
		}
	}

	// Check images.
	if _, ok := ImageWhitelist[config["image"].(string)]; !ok {
		return errors.New(fmt.Sprintf("Image \"%s\" is not supported", config["image"].(string)))
	}

	// Check main.
	main := config["main"].(map[interface{}]interface{})

	if main["type"] == nil {
		return errors.New("Please specify main type")
	} else if main["type"].(string) == "http" || main["type"].(string) == "python" {
		if main["entrypoint"] == nil {
			return errors.New("In \"main\", please specify \"entrypoint\"")
		}

		if main["entrypoint"].(string) == "" {
			return errors.New("The main entrypoint cannot be empty string")
		}
	}
	return nil
}

func CleanupModelConfig(config map[string]interface{}) map[string]interface{} {
	if config["assets"] == nil {
		config["assets"] = []interface{}{}
	}

	if config["setup"] == nil {
		config["setup"] = []interface{}{}
	}
	if _, ok := config["assets"]; !ok {
		config["assets"] = []interface{}{}
	}

	if config["resources"] == nil {
		fmt.Println("Using default resource setting", DefaultResources)
		config["resources"] = interface{}(DefaultResources)
	}

	config["image"] = "moxel/" + config["image"].(string)
	return config
}

func VerifyModelTag(tag string) error {
	if tag != "latest" {
		return errors.New("Model versioning is still under development. Only tag \"latest\" is supported. \n\nHow would you like your models versioned? Reach out to support@moxel.ai to tell us!")
	}
	return nil
}

func CommandInit() cli.Command {
	return cli.Command{
		Name:      "init",
		Usage:     "Create a boilerplate yaml file",
		ArgsUsage: "-f [yaml] [model]:[tag]",
		Flags: []cli.Flag{
			cli.StringFlag{
				Name:  "file, f",
				Value: "moxel.yml",
				Usage: "Config file to specify the model",
			},
		},
		Action: func(c *cli.Context) error {
			if err := InitGlobal(c); err != nil {
				return err
			}

			file := c.String("file")

			repo, err := GetWorkingRepo()
			if err != nil {
				return err
			}

			fmt.Println("Initializing moxel yaml file...")
			fmt.Println("Current git repo: " + repo.Path)

			if _, err := os.Stat(file); err == nil {
				return errors.New(fmt.Sprintf("File %s already exists.", file))
			}

			if c.Args().Get(0) != "" {
				modelId := c.Args().Get(0)
				modelName, modelTag, err := ParseModelId(modelId)
				if err != nil {
					return err
				}

				if err := VerifyModelTag(modelTag); err != nil {
					return err
				}

				SampleModelConfig = fmt.Sprintf("name: %s\ntag: %s\n%s", modelName, modelTag, SampleModelConfig)
			}

			yamlBytes := []byte(SampleModelConfig)

			err = ioutil.WriteFile(file, yamlBytes, 0777)
			if err != nil {
				return err
			}

			fmt.Println("Created " + file)
			return nil
		},
	}
}

func CommandVersion() cli.Command {
	return cli.Command{
		Name:  "version",
		Usage: "Print version of CLI",
		Action: func(c *cli.Context) error {
			fmt.Println(CLI_VERSION)
			return nil
		},
	}
}

func CommandLogin() cli.Command {
	return cli.Command{
		Name:  "login",
		Usage: "Log in Moxel",
		Flags: []cli.Flag{
			cli.BoolFlag{
				Name:  "console, c",
				Usage: "Login using console instead web browser",
			},
			cli.BoolFlag{
				Name:  "debug",
				Usage: "Show debugging information",
			},
		},
		Action: func(c *cli.Context) error {
			GlobalContext = c
			var err error

			if c.Bool("console") {
				err = StartHeadlessLoginFlow()
			} else {
				err = StartBrowserLoginFlow()
				if err != nil {
					err = StartHeadlessLoginFlow()
				}
			}
			return err
		},
	}
}

func CommandTeardown() cli.Command {
	return cli.Command{
		Name:      "teardown",
		Usage:     "Teardown a model",
		ArgsUsage: "[model]:[tag]",
		Action: func(c *cli.Context) error {
			if err := InitGlobal(c); err != nil {
				return err
			}

			modelId := c.Args().Get(0)
			modelName, tag, err := ParseModelId(modelId)
			if err != nil {
				return err
			}

			if err := TeardownModel(modelName, tag, true); err != nil {
				return err
			}

			fmt.Println("Successfully torn down", modelId)
			return nil

		},
	}
}

func CommandDeploy() cli.Command {
	return cli.Command{
		Name:  "deploy",
		Usage: "Deploy an existing model",
		Action: func(c *cli.Context) error {
			if err := InitGlobal(c); err != nil {
				return err
			}

			modelId := c.Args().Get(0)
			modelName, tag, err := ParseModelId(modelId)
			if err != nil {
				return err
			}

			return DeployModel(modelName, tag)
		},
	}
}

func CommandLS() cli.Command {
	return cli.Command{
		Name:      "ls",
		Usage:     "List your models on Moxel",
		ArgsUsage: " ",
		Action: func(c *cli.Context) error {
			if err := InitGlobal(c); err != nil {
				return err
			}

			userId := GlobalUser.Username()
			modelName := c.Args().Get(0)

			fmt.Println("Logged in as", "\""+userId+"\"")

			format := "%-40s | %-20s | %-10s\n"

			var results []map[string]interface{}
			var err error

			if modelName == "" {
				// List all models under user name.
				results, err = GlobalAPI.ListModels(userId)
				if err != nil {
					return err
				}
			} else {
				// List versions of the given model.
				results, err = GlobalAPI.ListModelTags(userId, modelName)
				if err != nil {
					return err
				}
			}

			// Print the list of models.
			fmt.Println()
			if len(results) > 0 {
				fmt.Printf(format, "Name", "Tag", "Status")
				fmt.Printf(format, strings.Repeat("-", 40), strings.Repeat("-", 20), strings.Repeat("-", 10))
				for _, result := range results {
					fmt.Printf(format, result["name"].(string), result["tag"].(string), result["status"].(string))
				}
			} else {
				fmt.Println("You haven't uploaded any models yet :)")
			}
			return nil
		},
	}
}

func CommandPush() cli.Command {
	return cli.Command{
		Name:      "push",
		Usage:     "Push model to Moxel",
		ArgsUsage: "-f [yaml] [model]:[tag]",
		Flags: []cli.Flag{
			cli.StringFlag{
				Name:  "file, f",
				Value: "moxel.yml",
				Usage: "Config file to specify the model.",
			},
			cli.BoolFlag{
				Name:  "yes, y",
				Usage: "Confirm to overwrite if the model is already live.",
			},
		},
		Action: func(c *cli.Context) error {
			if err := InitGlobal(c); err != nil {
				return err
			}

			file := c.String("file")
			config, err := LoadYAML(file)
			if err != nil {
				return err
			}

			if err := VerifyModelConfig(config); err != nil {
				return err
			}

			config = CleanupModelConfig(config)

			var modelName, modelTag string
			if config["name"] != nil {
				modelName = config["name"].(string)
			}
			if config["tag"] != nil {
				modelTag = config["tag"].(string)
			}
			modelId := modelName + ":" + modelTag

			if c.Args().Get(0) != "" {
				modelId = c.Args().Get(0)
				modelName, modelTag, err = ParseModelId(modelId)
				if err != nil {
					return err
				}
			}

			if modelName == "" {
				return errors.New("Model name cannot be empty\nTry: moxel push [command options] -f [yaml] [model]:[tag]")
			}

			if modelTag == "" {
				return errors.New("Model tag cannot be empty\nTry: moxel push [command options] -f [yaml] [model]:[tag]")
			}

			if err := VerifyModelTag(modelTag); err != nil {
				return err
			}

			fmt.Println("Pushing to " + modelId)

			// Check if model repo is available.
			// If model is created from Moxel site,
			// then <modelName>:latest is created by default.
			models, err := GlobalAPI.ListModelTags(GlobalUser.Username(), modelName)
			if err != nil {
				return err
			}
			if len(models) == 0 {
				return errors.New(fmt.Sprintf(
					"Model %s does not exist. Please create it first on Moxel website.", modelName) + "\n" +
					CreateModelURL)
			}

			// Load configuration.
			repo, err := GetWorkingRepo()
			if err != nil {
				return err
			}

			config["work_path"] = GetWorkingPath(filepath.Dir(file), repo)

			fmt.Printf("> Model %s:%s\n", modelName, modelTag)

			// Check to see if model already exists.
			modelData, err := GetModel(modelName, modelTag)
			if err != nil {
				return err
			}

			if modelData["status"] == "LIVE" {
				isYes := c.Bool("yes")
				if !isYes {
					fmt.Printf("Model is live! Teardown it down first? [y/n]\t")
					isYes = AskForConfirmation()
				}

				if isYes {
					if err := TeardownModel(modelName, modelTag, false); err != nil {
						return err
					}
				} else {
					return nil
				}
			}

			// Push code to git registry.
			commit, err := PushCode(repo, modelName)
			if err != nil {
				return err
			}
			fmt.Println("> Commit ", commit)

			// Push assets to cloud storage.
			if err := PushAssets(repo, modelName, commit, config); err != nil {
				return err
			}

			// Create model in the database.
			if err := PutModel(modelName, modelTag, commit, config); err != nil {
				return err
			}

			// Deploy model.
			if err := DeployModel(modelName, modelTag); err != nil {
				return err
			}

			if err := WaitForModelStatus(modelName, modelTag, "LIVE"); err != nil {
				return err
			}

			if err := LogModel(modelName, modelTag); err != nil {
				return err
			}
			return nil
		},
	}
}

func CommandLogs() cli.Command {
	return cli.Command{
		Name:      "logs",
		Usage:     "Show the logs of a model",
		ArgsUsage: "[model]:[tag]",
		Flags: []cli.Flag{
			cli.BoolFlag{
				Name:  "follow, f",
				Usage: "Follow log output",
			},
		},
		Action: func(c *cli.Context) error {
			if err := InitGlobal(c); err != nil {
				return err
			}

			follow := c.Bool("follow")
			modelId := c.Args().Get(0)

			modelName, tag, err := ParseModelId(modelId)
			if err != nil {
				return err
			}

			err = GlobalAPI.LogModel(GlobalUser.Username(), modelName, tag, os.Stdout, follow)
			if err != nil {
				return err
			}

			fmt.Println()
			return nil
		},
	}
}

func CommandServe() cli.Command {
	return cli.Command{
		Name:      "serve",
		Usage:     "Serve the model locally.",
		ArgsUsage: "-f [yaml]",
		Flags: []cli.Flag{
			cli.StringFlag{
				Name:  "file, f",
				Value: "moxel.yml",
				Usage: "Config file to specify the model",
			},
		},
		Action: func(c *cli.Context) error {
			file := c.String("file")

			model, err := CreateLocalModel(file)
			if err != nil {
				return err
			}

			model.Serve()
			return nil
		},
	}
}

func main() {
	// Update help template.
	cli.AppHelpTemplate = fmt.Sprintf("%s\nVisit Moxel website at %s\nIf you have any questions, contact us at support@moxel.ai\n", cli.AppHelpTemplate, WebsiteAddress)
	// Start application.
	app := cli.NewApp()
	app.Version = CLI_VERSION
	app.Name = "Moxel"
	app.Usage = "World's Best Models, Built by the Community."
	app.CommandNotFound = func(c *cli.Context, command string) {
		fmt.Fprintf(c.App.Writer, "Command %q is not found.\n", command)
	}

	app.Flags = []cli.Flag{
		cli.StringFlag{
			Name:  "lang, l",
			Value: "english",
			Usage: "Language for the greeting",
		},
		cli.StringFlag{
			Name:  "config, c",
			Usage: "Load configuration from `FILE`",
		},
	}

	app.Commands = []cli.Command{
		CommandVersion(),
		CommandInit(),
		CommandLogin(),
		CommandTeardown(),
		CommandDeploy(),
		CommandLS(),
		CommandPush(),
		CommandLogs(),
		CommandServe(),
	}

	sort.Sort(cli.FlagsByName(app.Flags))
	sort.Sort(cli.CommandsByName(app.Commands))

	err := app.Run(os.Args)
	if err != nil {
		fmt.Println(err)
	}
}
