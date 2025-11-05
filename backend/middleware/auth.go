package middleware

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// GenerateAccessToken creates a short-lived JWT for user sessions
func GenerateAccessToken(username string) (string, error) {
	secret := []byte(os.Getenv("JWT_SECRET"))
	expMinutes := 15
	if val := os.Getenv("ACCESS_TOKEN_EXPIRE_MINUTES"); val != "" {
		// optional: parse custom expiry if needed
	}

	claims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(time.Minute * time.Duration(expMinutes)).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

// GenerateRefreshToken creates a long-lived JWT
func GenerateRefreshToken(username string) (string, error) {
	secret := []byte(os.Getenv("REFRESH_SECRET"))
	expHours := 24
	if val := os.Getenv("REFRESH_TOKEN_EXPIRE_HOURS"); val != "" {
		// optional: parse custom expiry
	}

	claims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(time.Hour * time.Duration(expHours)).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

// ValidateToken checks if token is valid and returns claims
func ValidateToken(tokenStr string, isRefresh bool) (jwt.MapClaims, error) {
	var secret []byte
	if isRefresh {
		secret = []byte(os.Getenv("REFRESH_SECRET"))
	} else {
		secret = []byte(os.Getenv("JWT_SECRET"))
	}

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}

	return token.Claims.(jwt.MapClaims), nil
}

// AuthMiddleware protects private routes
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := ValidateToken(token, false)
		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		username, _ := claims["username"].(string)
		r.Header.Set("Username", username)

		next(w, r)
	}
}
