package main

import (
	// TODO: abstract redis as key value store.
	//"fmt"
	"github.com/go-redis/redis"
	"strconv"
	"time"
)

func IncrPageViewCount(client *redis.Client, modelId string) error {
	now := time.Now()

	_, err := client.HIncrBy(modelId+":page-view", now.Format("Jan 2 2006"), 1).Result()
	if err != nil {
		return err
	}

	_, err = client.HIncrBy(modelId+":page-view", "total", 1).Result()
	if err != nil {
		return err
	}

	return nil
}

func GetPageViewCounts(client *redis.Client, modelId string) (map[string]int, error) {
	result, err := client.HGetAll(modelId + ":page-view").Result()
	if err != nil {
		return nil, err
	}

	resultFormatted := make(map[string]int)
	for k, v := range result {
		resultFormatted[k], _ = strconv.Atoi(v)
	}

	return resultFormatted, nil
}

func IncrDemoRunCount(client *redis.Client, modelId string) error {
	now := time.Now()

	_, err := client.HIncrBy(modelId+":demo-run", now.Format("Jan 2 2006"), 1).Result()
	if err != nil {
		return err
	}
	_, err = client.HIncrBy(modelId+":demo-run", "total", 1).Result()
	if err != nil {
		return err
	}

	return nil
}

func GetDemoRunCount(client *redis.Client, modelId string) (map[string]int, error) {
	result, err := client.HGetAll(modelId + ":demo-run").Result()
	if err != nil {
		return nil, err
	}

	resultFormatted := make(map[string]int)
	for k, v := range result {
		resultFormatted[k], _ = strconv.Atoi(v)
	}

	return resultFormatted, nil
}
