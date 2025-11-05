package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/GlitchGuru19/react-go-fullAuthV1/database"
	"github.com/GlitchGuru19/react-go-fullAuthV1/middleware"
	"github.com/GlitchGuru19/react-go-fullAuthV1/models"
	"golang.org/x/crypto/bcrypt"
)

// LoginHandler authenticates a user and returns JWT tokens
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var storedHash string
	err := database.DB.QueryRow("SELECT password FROM users WHERE username = ?", user.Username).Scan(&storedHash)
	if err == sql.ErrNoRows {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	} else if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(user.Password)) != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
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
