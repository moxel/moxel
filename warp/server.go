package main

import (
	"context"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"time"
)

var server *http.Server

func StartServer() {
	router := mux.NewRouter()

	router.HandleFunc("/", CallbackHandler)
	server = &http.Server{
		Handler:      router,
		Addr:         fmt.Sprintf("0.0.0.0:%d", CALLBACK_PORT),
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	server.ListenAndServe()
}

func StopServer(context context.Context) {
	server.Shutdown(context)
}
