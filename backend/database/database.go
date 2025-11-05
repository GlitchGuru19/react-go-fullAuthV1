package database

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

// Connect opens SQLite DB and ensures the users table exists
func Connect() {
	var err error
	DB, err = sql.Open("sqlite", "./users.db")
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	createTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL
	);
	`
	if _, err := DB.Exec(createTable); err != nil {
		log.Fatal("❌ Failed to create users table:", err)
	}

	log.Println("✅ Database connected and table ready")
}
