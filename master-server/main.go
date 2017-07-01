package main

import (
	"fmt"
	"github.com/dummy-ai/mvp/master-server/models"
	"net/http"
	"os"
)

func sayHello(w http.ResponseWriter, r *http.Request) {
	fmt.Print("hello")
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: master-server [migrate / start]")
		return
	}

	command := os.Args[1]

	if command == "migrate" {
		// migrate database schema.
		db := models.CreateDB()
		defer db.Close()

		models.MigrateDB(db)
	} else if command == "start" {
		http.HandleFunc("/", sayHello)

	} else {
		panic("Unknown command " + command)
	}
}
