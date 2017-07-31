package main

import (
	"context"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/skratchdot/open-golang/open"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var server *http.Server

func StartLoginFlow() {
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
		} else {
			break
		}
	}

	if tryPort == endPort {
		fmt.Println("Error: ", err.Error())
	}

	eles := strings.Split(listener.Addr().String(), ":")
	callbackPort = eles[len(eles)-1]

	Debugln("PORT", callbackPort)

	open.Run(GetAuthorizeURL())

	server.Serve(listener)
	Debugln("Server finished")
}

func StopLoginFlow(context context.Context) {
	server.Shutdown(context)
}
