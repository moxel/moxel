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
		return "", "", errors.New("Ill-formatted modelId \"" + modelId + "\"")
	}

	modelName := modelIdParts[0]
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
		for _, asset := range assets.([]interface{}) {
			assetPath, _ := filepath.Abs(asset.(string))
			assetPath, _ = filepath.Rel(repo.Path, assetPath)
			assetPaths = append(assetPaths, assetPath)
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
	// A whitelist that maps <key> => <isRequired>
	YAMLWhitelist := map[string]bool{
		"image":        true,
		"assets":       false,
		"resources":    false,
		"input_space":  true,
		"output_space": true,
		"cmd":          false,
	}

	// Check if all keys in config are in whitelist.
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

	return nil
}

func main() {
	// Start application.
	app := cli.NewApp()

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
		{
			Name:  "login",
			Usage: "Login to dummy.ai",
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
		},
		{
			Name:  "teardown",
			Usage: "moxel teardown [model-name]:[tag]",
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
		},
		{
			Name:  "deploy",
			Usage: "moxel deploy [model-name]:[tag]",
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
		},
		{
			Name:  "list",
			Usage: "moxel list deploy",
			Action: func(c *cli.Context) error {
				if err := InitGlobal(c); err != nil {
					return err
				}

				userName := GlobalUser.Username()

				fmt.Println("userName", userName)

				kind := c.Args().Get(0)

				if kind == "deploy" {
					format := "%40s | %20s | %10s\n"
					results, err := GlobalAPI.ListDeployModel(userName)
					if err != nil {
						return err
					}

					fmt.Printf(format, "Name", "Tag", "Status")
					fmt.Printf(format, strings.Repeat("-", 40), strings.Repeat("-", 20), strings.Repeat("-", 10))
					for _, result := range results {
						fmt.Printf(format, result["name"].(string), result["tag"].(string), result["status"].(string))
					}
					return nil
				} else {
					return errors.New(fmt.Sprintf("Unknown command %s", kind))
				}
			},
		},
		{
			Name:  "push",
			Usage: "push -f [file] [model:tag]",
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "file, f",
					Value: "dummy.yml",
					Usage: "The YAML filename",
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

				// Verify if the config has the right format.
				if err := VerifyModelConfig(config); err != nil {
					return err
				}

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

				if modelData["status"] != "UNKNOWN" {
					fmt.Printf("  Model already exists. Overwrite? [y/n]\t")
					isYes := AskForConfirmation()
					if isYes {
						// If the model is LIVE, tear it down first.
						if modelData["status"] == "LIVE" {
							if err := TeardownModel(modelName, tag); err != nil {
								return err
							}
						}
						// Delete model.
						if err := DeleteModel(modelName, tag); err != nil {
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
		},
		{
			Name:  "init",
			Usage: "moxel init model -f [file] -n [name]",
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "file, f",
					Value: "dummy.yml",
					Usage: "The YAML filename",
				},
				cli.StringFlag{
					Name:  "name, n",
					Value: "no-name-model",
					Usage: "The name of the model",
				},
			},
			Action: func(c *cli.Context) error {
				if err := InitGlobal(c); err != nil {
					return err
				}

				kind := c.Args().Get(0)

				if kind == "model" {

					name := c.String("name")
					file := c.String("file")

					//repo, err := GetWorkingRepo()
					//if err != nil {
					//	fmt.Printf("Error: %s\n", err.Error())
					//	return nil
					//}

					config := InitModelConfig(name)
					err := SaveYAML(file, config)
					if err != nil {
						fmt.Printf("Failed to create YAML file %s", file)
						return nil
					}

					fmt.Printf("Model %s successfully initialized at %s.\n", name, file)

				} else {
					fmt.Printf("Unknown resource kind %s\n", kind)
				}

				return nil
			},
		},
		{
			Name:  "log",
			Usage: "log [model:tag]",
			Flags: []cli.Flag{
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
		},
	}

	sort.Sort(cli.FlagsByName(app.Flags))
	sort.Sort(cli.CommandsByName(app.Commands))

	err := app.Run(os.Args)
	if err != nil {
		fmt.Println(err)
	}
}
