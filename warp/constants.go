package main

import (
	"log"
	"os/user"
	"strconv"
)

const AUTH0_DOMAIN = "dummyai.auth0.com"
const AUTH0_CLIENT_ID = "0hItkN1iRVqZGtU2okpiyTJmsiR49K9f"
const AUTH0_CLIENT_SECRET = "po_dTnKdw3ZTcNblzOu_M3QLG8s1p5qwMdkwGNg7AbOpoFLLgiIxLjiuOEB8NF3J" // Suffer from reverse-compilation.
const CALLBACK_PORT = 15900

const USER_CONFIG = ".dummy"

func GetUserConfigPath() string {
	usr, err := user.Current()
	if err != nil {
		log.Fatal(err)
	}
	return usr.HomeDir + "/" + USER_CONFIG
}

func GetRedirectURL() string {
	return "http://localhost:" + strconv.Itoa(CALLBACK_PORT)
}

func GetAuthorizeURL() string {
	return "http://" + AUTH0_DOMAIN + "/authorize?response_type=code&client_id=" + AUTH0_CLIENT_ID + "&redirect_uri=" + GetRedirectURL()
}
