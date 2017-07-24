package main

import (
	"fmt"
	"github.com/elazarl/goproxy"
	"github.com/levigross/grequests"
	"github.com/skratchdot/open-golang/open"
	"github.com/urfave/cli"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
)

func main() {
	// Initialize Global Constants based on environment variable.
	InitGlobal()

	user := User{}
	fmt.Println("Logged in as: ", user.Username())
	userToken := "Bearer " + user.JWT()

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
				resp, err := grequests.Get(MasterEndpoint("/ping"), &grequests.RequestOptions{
					Headers: map[string]string{
						"Authorization": userToken,
					},
				})

				// internal server error
				if err != nil || resp.StatusCode == 500 {
					fmt.Println("Error: ", err.Error())
					fmt.Printf("Server response %d: %s\n", resp.StatusCode, resp.String())
					return nil
				}

				if resp.Ok {
					fmt.Println("Already logged in.")
					return nil
				}

				open.Run(GetAuthorizeURL())
				StartServer()

				return nil
			},
		},
		{
			Name:  "clone",
			Usage: "add a task to the list",
			Action: func(c *cli.Context) error {
				proxy := goproxy.NewProxyHttpServer()
				proxy.Verbose = true
				proxy.OnRequest().DoFunc(
					func(r *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
						r.Header.Set("Authorization", userToken)
						return r, nil
					})
				log.Fatal(http.ListenAndServe(":15901", proxy))

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

				_, err := GetWorkingRepo()
				if err != nil {
					fmt.Printf("Error: %s\n", err.Error())
					return nil
				}

				cwd, _ := os.Getwd()
				cwd, _ = filepath.Abs(cwd)

				config, err := LoadYAML(file)
				fmt.Println(config)
				if err != nil {
					fmt.Printf("Failed to load YAML file %s", file)
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
