package main

import (
	"fmt"
	"github.com/levigross/grequests"
	"github.com/skratchdot/open-golang/open"
	"github.com/urfave/cli"
	"os"
	"path/filepath"
	"sort"
)

func main() {
	// Initialize Global Constants based on environment variable.
	InitGlobal()

	// Get user profile.
	user := User{}
	var userName string
	var userToken string

	if user.Initialized() {
		fmt.Println("Logged in as: ", user.Username())
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
			Name:  "clone",
			Usage: "add a task to the list",
			Action: func(c *cli.Context) error {
				return nil
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
				fmt.Println(config)
				if err != nil {
					return err
				}

				projectName := config["name"].(string)

				// Push code to git registry.
				url, err := api.GetRepoURL(userName, projectName)
				if err != nil {
					fmt.Printf("Failed to reach remote repo: %s\n", err.Error())
					return nil
				}
				fmt.Println("url", url)
				err = repo.PushCode(userToken, url)
				if err != nil {
					fmt.Printf("Failed to push code: ", err.Error())
					return nil
				}
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
