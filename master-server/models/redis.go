// Redis DB to store analytics data.
package models

import (
	"github.com/go-redis/redis"
)

func CreateKeyValueStore(redisAddress string, redisPassword string) *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     redisAddress + ":6379",
		Password: redisPassword, // no password set
		DB:       0,             // use default DB
	})

	return client
}
