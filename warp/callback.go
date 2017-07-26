package main

import (
	_ "crypto/sha512"
	"encoding/json"
	"fmt"
	"golang.org/x/oauth2"
	"io/ioutil"
	"net/http"
	"time"
)

func CallbackHandler(w http.ResponseWriter, r *http.Request) {
	domain := AUTH0_DOMAIN

	conf := &oauth2.Config{
		ClientID:     AUTH0_CLIENT_ID,
		ClientSecret: AUTH0_CLIENT_SECRET,
		RedirectURL:  GetRedirectURL(),
		Scopes:       []string{"openid", "profile"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://" + domain + "/authorize",
			TokenURL: "https://" + domain + "/oauth/token",
		},
	}

	code := r.URL.Query().Get("code")

	token, err := conf.Exchange(oauth2.NoContext, code)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Getting now the userInfo
	client := conf.Client(oauth2.NoContext, token)
	resp, err := client.Get("https://" + domain + "/userinfo")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	raw, err := ioutil.ReadAll(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var profile map[string]interface{}
	if err = json.Unmarshal(raw, &profile); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	user := User{}
	user.UpdateUserConfig(map[string]interface{}{
		"JWT":         token.Extra("id_token"),
		"AccessToken": token.AccessToken,
		"profile":     profile,
	})

	// Write back responses.
	w.WriteHeader(200)
	w.Write([]byte("Logged in successfully!"))

	fmt.Println("Logged in successfully!")

	go func() {
		time.Sleep(3.)
		StopServer(r.Context())
	}()
}
