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
	"sort"
)

func main() {
	// Initialize Global Constants based on environment variable.
	InitGlobal()

	userConfig := LoadUserConfig()
	userToken := "Bearer " + userConfig["JWT"].(string)

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
			Name:  "init",
			Usage: "warp init [model name]",
			Action: func(c *cli.Context) error {
				name := c.Args().Get(0)
				repo, err := GetWorkingRepo()
				if err != nil {
					fmt.Printf("Error: %s\n", err.Error())
					return nil
				}
				err = repo.AddModel(InitModelConfig(name))
				if err != nil {
					fmt.Printf("Error: %s\n", err.Error())
					return nil
				}
				fmt.Println(fmt.Sprintf("Model %s successfully initialized.", name))
				return nil
			},
		},
	}

	sort.Sort(cli.FlagsByName(app.Flags))
	sort.Sort(cli.CommandsByName(app.Commands))

	app.Run(os.Args)
}
