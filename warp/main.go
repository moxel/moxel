package main

import (
	"errors"
	"fmt"
	"github.com/levigross/grequests"
	"github.com/skratchdot/open-golang/open"
	"github.com/urfave/cli"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

func main() {
	// Initialize Global Constants based on environment variable.
	InitGlobal()

	// Get user profile.
	user := User{}
	var userName string
	var userToken string

	if user.Initialized() {
		// fmt.Println("User: ", user.Username())
		userToken = "Bearer " + user.JWT()
		userName = user.Username()

		// Check if user has logged in.
		resp, err := grequests.Get(MasterEndpoint("/ping"), &grequests.RequestOptions{
			Headers: map[string]string{
				"Authorization": userToken,
			},
		})

		// Internal server error
		if err != nil {
			fmt.Println("Unable to connect to dummy.ai: ", err.Error())
			return
		}

		if resp.StatusCode == 500 {
			fmt.Printf("Server response %d: %s\n", resp.StatusCode, resp.String())
			fmt.Println("Please login first. Run `warp login`")
			return
		}
	} else {
		fmt.Println("Please login first. Run `warp login`")
		return
	}

	// Create API remote.
	api := MasterAPI{}

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
			Action: func(c *cli.Context) error {

				open.Run(GetAuthorizeURL())
				StartServer()

				return nil
			},
		},
		{
			Name:  "deploy",
			Usage: "warp deploy [model-name]:[tag]",
			Action: func(c *cli.Context) error {
				nameAndTag := c.Args().Get(0)
				entries := strings.Split(nameAndTag, ":")

				if len(entries) != 2 {
					return errors.New(fmt.Sprintf("Unrecognized format %s", nameAndTag))
				}

				projectName := entries[0]
				tag := entries[1]

				resp, err := api.DeployModel(userName, projectName, tag)
				if err != nil {
					return err
				}

				if resp.StatusCode != 200 {
					fmt.Println("Error:", resp.String())
					return nil
				}

				fmt.Println("successfully deployed", nameAndTag)
				return nil

			},
		},
		{
			Name:  "list",
			Usage: "warp list [deploy/run]",
			Action: func(c *cli.Context) error {
				kind := c.Args().Get(0)

				if kind == "deploy" {
					format := "%40s | %20s | %10s\n"
					results, err := api.ListDeployModel(userName)
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
			Name:  "create",
			Usage: "warp create -f [file]",
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "file, f",
					Value: "dummy.yml",
					Usage: "The YAML filename",
				},
			},
			Action: func(c *cli.Context) error {
				file := c.String("file")

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

				// Push code to git registry.
				url, err := api.GetRepoURL(userName, projectName)
				if err != nil {
					fmt.Printf("Failed to reach remote repo: %s\n", err.Error())
					return nil
				}

				fmt.Println("> Pushing code...")
				commit, err := repo.PushCode(userToken, url)
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
				resp, err := api.PutModel(userName, projectName, tag, commit, yamlString)
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
			Usage: "warp init model -f [file] -n [name]",
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