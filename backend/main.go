package main

import (
	"log"
	"net/http"
	"os"

	"github.com/GlitchGuru19/react-go-fullAuthV1/database"
	"github.com/GlitchGuru19/react-go-fullAuthV1/initializers"
	"github.com/GlitchGuru19/react-go-fullAuthV1/routes"
)

func main() {
	// Load environment variables
	initializers.LoadEnv()

	// Connect to database
	database.Connect()

	// Create HTTP router
	mux := http.NewServeMux()

	// Register routes
	routes.RegisterRoutes(mux)

	// Read port from env or fallback
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
