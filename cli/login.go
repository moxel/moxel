package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/skratchdot/open-golang/open"
	"golang.org/x/crypto/ssh/terminal"
	"io/ioutil"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var server *http.Server

func StartHeadlessLoginFlow() error {
	// Scan user name and password.
	var username string
	fmt.Print("User: ")
	fmt.Scanf("%s", &username)
	fmt.Print("Password: ")
	password, err := terminal.ReadPassword(0)
	if err != nil {
		return err
	}
	fmt.Println()

	payload := strings.NewReader(fmt.Sprintf(
		"{\"client_id\":\"%s\",\"client_secret\":\"%s\",\"audience\":\"https://dummyai.auth0.com/api/v2/\",\"grant_type\":\"http://auth0.com/oauth/grant-type/password-realm\", \"username\": \"%s\", \"password\":\"%s\", \"realm\":\"Username-Password-Authentication\", \"scope\": \"openid\"}", AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, username, password))

	req, _ := http.NewRequest("POST",
		"https://"+AUTH0_DOMAIN+"/oauth/token",
		payload)

	req.Header.Add("content-type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)

	credentials := make(map[string]interface{})

	err = json.Unmarshal(body, &credentials)
	if err != nil {
		return err
	}

	if credentials["error"] != nil {
		return errors.New(credentials["error_description"].(string))
	}
	accessToken := credentials["access_token"].(string)
	idToken := credentials["id_token"].(string)

	// make a request to get user profile.
	req, _ = http.NewRequest("GET",
		"https://"+AUTH0_DOMAIN+"/userinfo", nil)
	req.Header.Add("Authorization", "Bearer "+accessToken)

	res, _ = http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ = ioutil.ReadAll(res.Body)

	profile := make(map[string]interface{})
	err = json.Unmarshal(body, &profile)
	if err != nil {
		return err
	}
	if profile["username"] == nil {
		profile["username"] = profile["nickname"]
	}

	user := User{}
	user.UpdateUserConfig(map[string]interface{}{
		"JWT":         idToken,
		"AccessToken": accessToken,
		"profile":     profile,
	})

	fmt.Println("Logged in successfully!")
	return nil
}

func StartBrowserLoginFlow() error {
	router := mux.NewRouter()

	router.HandleFunc("/", CallbackHandler)
	server = &http.Server{
		Handler:      router,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	Debugln("Server listening")

	var listener net.Listener
	var err error
	const beginPort = 15900
	const endPort = 15910
	var tryPort int
	for tryPort = beginPort; tryPort < endPort; tryPort += 1 {
		listener, err = net.Listen("tcp", "0.0.0.0:"+strconv.Itoa(tryPort))
		if err != nil {
			return err
		} else {
			break
		}
	}

	if tryPort == endPort {
		return errors.New("Login flow couldn't find a port to listen to")
	}

	eles := strings.Split(listener.Addr().String(), ":")
	callbackPort = eles[len(eles)-1]

	Debugln("PORT", callbackPort)

	err = open.Run(GetAuthorizeURL())
	if err != nil {
		return errors.New("Cannot open login URL through browser")
	}

	server.Serve(listener)

	Debugln("Server finished")
	return nil
}

func StopLoginFlow(context context.Context) {
	server.Shutdown(context)
}
