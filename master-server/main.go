package main

import (
	"fmt"
	//"github.com/jinzhu/gorm"
	//_ "github.com/jinzhu/gorm/dialects/postgres"
	"net/http"
)

//func main() {
//	db, _ := gorm.Open("postgres", "host= user=gorm dbname=gorm sslmode=disable password=mypassword")
//	fmt.Print("hi")
//	defer db.Close()
//}
func sayHello(w http.ResponseWriter, r *http.Request) {
	fmt.Print("hello")

}

func main() {
	http.HandleFunc("/", sayHello)
}
