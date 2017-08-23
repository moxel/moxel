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

				nameAndTag := c.Args().Get(0)
				entries := strings.Split(nameAndTag, ":")

				if len(entries) != 2 {
					return errors.New(fmt.Sprintf("Unrecognized format %s", nameAndTag))
				}

				projectName := entries[0]
				tag := entries[1]

				resp, err := GlobalAPI.TeardownDeployModel(GlobalUser.Username(), projectName, tag)
				if err != nil {
					return err
				}

				if resp.StatusCode != 200 {
					fmt.Println("Error:", resp.String())
					return nil
				}

				fmt.Println("Successfully torn down", nameAndTag)
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

				nameAndTag := c.Args().Get(0)
				entries := strings.Split(nameAndTag, ":")

				if len(entries) != 2 {
					return errors.New(fmt.Sprintf("Unrecognized format %s", nameAndTag))
				}

				projectName := entries[0]
				tag := entries[1]

				resp, err := GlobalAPI.DeployModel(GlobalUser.Username(), projectName, tag)
				if err != nil {
					return err
				}

				if resp.StatusCode != 200 {
					fmt.Println("Error:", resp.String())
					return nil
				}

				fmt.Println("Successfully deployed", nameAndTag)
				return nil

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

				fmt.Println("modelId", modelId)

				userName := GlobalUser.Username()

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

				projectName := config["name"].(string)
				tag := config["tag"].(string)

				fmt.Printf("> Model %s:%s\n", projectName, tag)

				// Check to see if model already exists.
				var modelData map[string]string
				resp, err := GlobalAPI.GetModel(userName, projectName, tag)
				if err != nil {
					fmt.Printf("Failed to get model data: %s\n", err.Error())
					return nil
				}
				if resp.StatusCode != 200 {
					msg := resp.String()
					fmt.Println("Error:", msg)
					return errors.New(msg)
				}
				resp.JSON(&modelData)
				if modelData["status"] != "UNKNOWN" {
					fmt.Printf("Model already exists. Overwrite? [y/n]\t")
					isYes := AskForConfirmation()
					if isYes {
						resp, err = GlobalAPI.DeleteModel(userName, projectName, tag)
						if err != nil {
							fmt.Println("Error:", err.Error())
							return err
						}

						if resp.StatusCode != 200 {
							msg := resp.String()
							fmt.Println("Error: ", msg)
							return errors.New(msg)
						}
					} else {
						return nil
					}
				}

				// Push code to git registry.
				url, err := GlobalAPI.GetRepoURL(userName, projectName)
				if err != nil {
					fmt.Printf("Failed to reach remote repo: %s\n", err.Error())
					return nil
				}

				fmt.Println("> Pushing code...")
				commit, err := repo.PushCode(GlobalAPI.authToken, url)
				if err != nil {
					fmt.Printf("Failed to push code: ", err.Error())
					return nil
				}

				fmt.Println("> Commit ", commit)

				fmt.Println("> Uploading weight files...")
				// Push assets to cloud storage.
				if assets, ok := config["assets"]; ok {
					// Normalize the asset paths.
					var assetPaths []string
					for _, asset := range assets.([]interface{}) {
						assetPath, _ := filepath.Abs(asset.(string))
						assetPath, _ = filepath.Rel(repo.Path, assetPath)
						assetPaths = append(assetPaths, assetPath)
					}
					// Push data to cloud.
					err = repo.PushData(assetPaths, userName, projectName, commit)
					if err != nil {
						fmt.Println("Failed to push data:", err.Error())
					}
				}

				// Create model in the database.
				yamlString, _ := SaveYAMLToString(config)
				resp, err = GlobalAPI.PutModel(userName, projectName, tag, commit, yamlString)
				if err != nil {
					return err
				}
				if resp.StatusCode != 200 {
					fmt.Println("Cannot save model:", resp.String())
					os.Exit(1)
				}
				fmt.Println("> Done!")

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
	}

	sort.Sort(cli.FlagsByName(app.Flags))
	sort.Sort(cli.CommandsByName(app.Commands))

	app.Run(os.Args)
}
