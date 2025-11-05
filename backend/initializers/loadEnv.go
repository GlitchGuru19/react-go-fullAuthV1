package initializers

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// LoadEnv loads environment variables from a .env file
func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ No .env file found — using system environment variables")
	} else {
		log.Println("✅ Environment variables loaded successfully")
	}

	// Read port from env or fallback
	Port := os.Getenv("PORT")
	if Port == "" {
		Port = "8080"
	}
}
