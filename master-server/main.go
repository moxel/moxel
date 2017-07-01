package main

import (
	"fmt"
	"github.com/dummy-ai/mvp/master-server/models"
	"net/http"
)

func sayHello(w http.ResponseWriter, r *http.Request) {
	fmt.Print("hello")
}

func main() {
	http.HandleFunc("/", sayHello)
	db := models.CreateDB()
	defer db.Close()

	models.MigrateDB(db)
}
