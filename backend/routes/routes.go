package routes

import (
	"net/http"

	"github.com/GlitchGuru19/react-go-fullAuthV1/handlers"
	"github.com/GlitchGuru19/react-go-fullAuthV1/middleware"
)

func RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/signup", middleware.CORSMiddleware(handlers.SignupHandler))
	mux.HandleFunc("/login", middleware.CORSMiddleware(handlers.LoginHandler))
	mux.HandleFunc("/logout", middleware.CORSMiddleware(handlers.LogoutHandler))
	mux.HandleFunc("/refresh", middleware.CORSMiddleware(handlers.RefreshHandler)) // <-- new

	// Protected route example
	mux.HandleFunc("/profile", middleware.CORSMiddleware(middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		username := r.Header.Get("Username")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message": "Welcome ` + username + `"}`))
	})))
}
