package main

import (
	"github.com/auth0-samples/auth0-golang-web-app/01-Login/app"
	"github.com/skratchdot/open-golang/open"
)

func main() {
	open.Run(GetAuthorizeURL())

	app.Init()
	StartServer()
}
