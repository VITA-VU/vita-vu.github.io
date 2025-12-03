const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to SQLite (creates file if missing)
const db = new sqlite3.Database("./data.sqlite");

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avatar TEXT,
    name TEXT,
    age INTEGER,
    profile TEXT,
    programme TEXT,
    num_tasks INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS question_events (
        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id TEXT,
        user_id TEXT,
        opened BOOLEAN,
        answer TEXT,
        feedback TEXT,
        timeOnTask INTEGER
    )
`);


// Save an interaction
app.post("/create", (req, res) => {
  const { avatar, name, age, profile, programme, num_tasks } = req.body;

  db.run(
    `INSERT INTO users (avatar, name, age, profile, programme)
     VALUES (?, ?, ?, ?, ?)`,
    [avatar, name, age, profile, programme],
    function () {
      res.json({ success: true, id: this.lastID });
    }
  );
});

//Increment tasks completed for a user
app.post("/increment-tasks", (req, res) => {
  const { id } = req.body;

  // Ensure user exists
  db.run(
    `INSERT INTO users (id) VALUES (?) 
     ON CONFLICT(id) DO NOTHING`,
    [id]
  );

  db.run(
    `
    UPDATE users
    SET num_tasks = num_tasks + 1
    WHERE id = ?
    `,
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.post("/log-question", (req, res) => {
  const { question_id, user_id, opened, answer, feedback, timeOnTask } = req.body;

  db.run(
    `
    INSERT INTO question_events 
      (question_id, user_id, opened, answer, feedback, timeOnTask)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [question_id, user_id, opened, answer, feedback, timeOnTask],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, event_id: this.lastID });
    }
  );
});



// Get all interactions
app.get("/interactions", (req, res) => {
  db.all(`SELECT * FROM interactions`, (err, rows) => {
    res.json(rows);
  });
});

app.listen(3001, () => console.log("SQLite backend running on port 3001"));
