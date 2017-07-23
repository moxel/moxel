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

	token := "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1UTTBNMFpHT0RrM01qUTBNVFUyTmtZeU16STNPRFpFTVRFM1JEZEVSREU0TkRreE56VkRPQSJ9.eyJpc3MiOiJodHRwczovL2R1bW15YWkuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDU5NzQ0MjIzMTNmNDBiMDg0ODVjNDYxMSIsImF1ZCI6IjBoSXRrTjFpUlZxWkd0VTJva3BpeVRKbXNpUjQ5SzlmIiwiZXhwIjoxNTAwODgzMzI3LCJpYXQiOjE1MDA4NDczMjd9.ojrlwpmM2vcpM0mz0jwApLNYKtBQQqx3wE8BrF-E9qpmDgdTAf5Hu0JR8xjyLogEwRAXmu83l5iN3JkmKfIM_jRscZYsnfjpKiTsATuMB6kvxzKCVSsj6mH2Zi08YmV8tpd_cR8m1yliCvHjAkGRaraiaV0tZMJNmUvQAnrbygunp-wtXkT1lC4DuoDoGnqZTShVYn5NZrp_SErCiq9ov_TVNfD_qFrOYNmD9P8q9PqEUyW2NqABKrL1dOBzGkIx6IbFeNoBwJTtc06QcRX4aAYcuQAx5Tdt_WkFcL1Y60swhQS2KzZSzh7_lISXeURd6lBxwQqe79edry6t7i8q5w"

	app.Commands = []cli.Command{
		{
			Name:  "login",
			Usage: "Login to dummy.ai",
			Action: func(c *cli.Context) error {
				resp, err := grequests.Get(MasterEndpoint("/ping"), &grequests.RequestOptions{
					Headers: map[string]string{
						"Authorization": token,
					},
				})
				fmt.Println(resp)

				if err == nil {
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
						r.Header.Set("Authorization", token)
						return r, nil
					})
				log.Fatal(http.ListenAndServe(":15901", proxy))

				return nil
			},
		},
	}

	sort.Sort(cli.FlagsByName(app.Flags))
	sort.Sort(cli.CommandsByName(app.Commands))

	app.Run(os.Args)
}
