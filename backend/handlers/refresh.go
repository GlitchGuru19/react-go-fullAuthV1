package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/GlitchGuru19/react-go-fullAuthV1/middleware"
)

// RefreshHandler generates a new access token using a refresh token
func RefreshHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var body struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if body.RefreshToken == "" {
		http.Error(w, "Missing refresh token", http.StatusBadRequest)
		return
	}

	// Validate refresh token
	claims, err := middleware.ValidateToken(body.RefreshToken, true)
	if err != nil {
		http.Error(w, "Invalid or expired refresh token", http.StatusUnauthorized)
		return
	}

	username, _ := claims["username"].(string)

	// Generate new access token
	newAccessToken, _ := middleware.GenerateAccessToken(username)

	resp := map[string]interface{}{
		"user": map[string]string{
			"username": username,
		},
		"access_token": newAccessToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
