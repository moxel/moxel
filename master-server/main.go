package main

import (
	"encoding/json"
	"fmt"
	"github.com/dummy-ai/mvp/master-server/models"
	"net/http"
	"os"
)

func sayHello(w http.ResponseWriter, r *http.Request) {
	fmt.Print("hello")
}

func getRepoURL(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	fmt.Println("[GET] Repo URL", query)

	user := query.Get("user") // dummy user
	name := query.Get("name") // project name

	if user == "" {
		http.Error(w, "User name cannot be empty", 400)
		return
	}

	if name == "" {
		http.Error(w, "Project name cannot be empty", 400)
		return
	}

	url, err := GetRepoURL(user, name)
	if err != nil {
		http.Error(w,
			fmt.Sprintf("Cannot get repo URL. Reason: %s", err.Error()),
			500)
		return
	}

	response, _ := json.Marshal(map[string]string{
		"url": url,
	})
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)

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
		http.HandleFunc("/url/code", getRepoURL)

		fmt.Println("Starting HTTP master server")
		http.ListenAndServe(":8080", nil)
	} else {
		panic("Unknown command " + command)
	}
}
