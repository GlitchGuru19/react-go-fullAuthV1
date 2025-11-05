package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/GlitchGuru19/react-go-fullAuthV1/database"
	"github.com/GlitchGuru19/react-go-fullAuthV1/models"
	"github.com/GlitchGuru19/react-go-fullAuthV1/middleware"
	"golang.org/x/crypto/bcrypt"
)

// SignupHandler handles user registration
func SignupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check if user already exists
	var exists bool
	err := database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)", user.Username).Scan(&exists)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if exists {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	_, err = database.DB.Exec("INSERT INTO users (username, password) VALUES (?, ?)", user.Username, string(hashed))
	if err != nil {
		http.Error(w, "Failed to save user", http.StatusInternalServerError)
		return
	}

	// Generate tokens
	accessToken, _ := middleware.GenerateAccessToken(user.Username)
	refreshToken, _ := middleware.GenerateRefreshToken(user.Username)

	// Return consistent JSON
	resp := map[string]interface{}{
		"user": map[string]string{
			"username": user.Username,
		},
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
