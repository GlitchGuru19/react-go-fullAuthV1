package handlers

import (
	"encoding/json"
	"net/http"
)

// LogoutHandler — clears tokens on frontend side (stateless logout)
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}
