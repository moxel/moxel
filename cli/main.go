package main

import (
	"errors"
	"fmt"
	"github.com/urfave/cli"
	"os"
	"path/filepath"
	"sort"
	"strings"
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

	fmt.Println(fmt.Sprintf("  Successfully deployed %s:%s", modelName, tag))
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
				assetPath, _ = filepath.Rel(repo.Path, assetPath)
				assetPaths = append(assetPaths, assetPath)
			}
		}
		// Push data to cloud.
		if err := repo.PushData(assetPaths, GlobalUser.Username(), modelName, commit); err != nil {
			return errors.New(fmt.Sprintf("Failed to push data: %s", err.Error()))
		}
	}
	return nil
}

// Teardown the model. From LIVE to INACTIVE.
func TeardownModel(modelName string, tag string) error {
	fmt.Println(fmt.Sprintf("> Tearing down model %s:%s", modelName, tag))
	resp, err := GlobalAPI.TeardownDeployModel(GlobalUser.Username(), modelName, tag)
	if err != nil {
		return err
	}

	if resp.StatusCode != 200 {
		return errors.New(resp.String())
	}
	return nil
}

// Create or update a model.
func PutModel(modelName string, tag string, commit string, config map[string]interface{}) error {
	yamlString, _ := SaveYAMLToString(config)
	resp, err := GlobalAPI.PutModel(GlobalUser.Username(), modelName, tag, commit, yamlString)
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
	for _, v := range inputSpace {
		if _, ok := TypeWhitelist[v.(string)]; !ok {
			return errors.New(fmt.Sprintf("Input type %s is not valid", v.(string)))
		}
	}

	// Check model output types.
	outputSpace := config["output_space"].(map[interface{}]interface{})
	for _, v := range outputSpace {
		if _, ok := TypeWhitelist[v.(string)]; !ok {
			return errors.New(fmt.Sprintf("Output type %s is not valid", v.(string)))
		}
	}

	return nil
}

func CleanupModelConfig(config map[string]interface{}) map[string]interface{} {
	if config["assets"] == nil {
		config["assets"] = []interface{}{}
	}

	if _, ok := config["assets"]; !ok {
		config["assets"] = []interface{}{}
	}

	if config["resources"] == nil {
		fmt.Println("Using default resource setting", DefaultResources)
		config["resources"] = interface{}(DefaultResources)
	}
	return config
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
				Name:  "debug",
				Usage: "Show debugging information",
			},
		},
		Action: func(c *cli.Context) error {
			GlobalContext = c
			StartLoginFlow()
			return nil
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

			if err := TeardownModel(modelName, tag); err != nil {
				return err
			}

			fmt.Println("  Successfully torn down", modelId)
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

			format := "%40s | %20s | %10s\n"

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
				Usage: "Config file to specify the model",
			},
			cli.StringFlag{
				Name:  "modelId, m",
				Value: "",
				Usage: "ID of the model to be pushed.",
			},
		},
		Action: func(c *cli.Context) error {
			if err := InitGlobal(c); err != nil {
				return err
			}

			file := c.String("file")
			modelId := c.Args().Get(0)

			modelName, tag, err := ParseModelId(modelId)
			if err != nil {
				return err
			}

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

			cwd, _ := os.Getwd()
			cwd, _ = filepath.Abs(cwd)

			config, err := LoadYAML(file)
			if err != nil {
				return err
			}

			if err := VerifyModelConfig(config); err != nil {
				return err
			}

			config = CleanupModelConfig(config)

			// Default map values for compatibility.
			// Compute workpath.
			moxelFileDir, _ := filepath.Abs(filepath.Dir(file))
			workPath, _ := filepath.Rel(repo.Path, moxelFileDir)
			config["work_path"] = workPath

			fmt.Printf("> Model %s:%s\n", modelName, tag)

			// Check to see if model already exists.
			modelData, err := GetModel(modelName, tag)
			if err != nil {
				return err
			}

			if modelData["status"] == "LIVE" {
				fmt.Printf("Model is LIVE!. Teardown it down? [y/n]\t")
				if err := TeardownModel(modelName, tag); err != nil {
					return err
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
			if err := PutModel(modelName, tag, commit, config); err != nil {
				return err
			}

			// Deploy model.
			if err := DeployModel(modelName, tag); err != nil {
				return err
			}

			fmt.Println("> Done. Showing logs from model:")
			fmt.Println("-------------------------------------------")

			// Stream logs from model.
			bytesRead := 0
			for {
				resp, err := GlobalAPI.LogModel(GlobalUser.Username(), modelName, tag)
				if err != nil {
					break
				}
				bytes := resp.Bytes()
				if bytes == nil {
					break
				}
				// fmt.Println("bytesRead", bytesRead)
				// fmt.Println("bytesBuffer", len(bytes))
				fmt.Print(string(bytes[bytesRead:len(bytes)]))
				bytesRead = len(bytes)
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
		Action: func(c *cli.Context) error {
			if err := InitGlobal(c); err != nil {
				return err
			}

			modelId := c.Args().Get(0)

			modelName, tag, err := ParseModelId(modelId)
			if err != nil {
				return err
			}

			resp, err := GlobalAPI.LogModel(GlobalUser.Username(), modelName, tag)
			buffer := make([]byte, 128)
			for {
				bytesRead, err := resp.Read(buffer)
				if bytesRead == 0 || err != nil {
					break
				}
				fmt.Printf(string(buffer))
			}

			fmt.Println()
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
		CommandLogin(),
		CommandTeardown(),
		CommandDeploy(),
		CommandLS(),
		CommandPush(),
		CommandLogs(),
	}

	sort.Sort(cli.FlagsByName(app.Flags))
	sort.Sort(cli.CommandsByName(app.Commands))

	err := app.Run(os.Args)
	if err != nil {
		fmt.Println(err)
	}
}
