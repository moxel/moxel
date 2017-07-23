package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"time"
)

func StartServer() {
	router := mux.NewRouter()

	router.HandleFunc("/", CallbackHandler)
	server := &http.Server{
		Handler:      router,
		Addr:         fmt.Sprintf("0.0.0.0:%d", CALLBACK_PORT),
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	server.ListenAndServe()
}
