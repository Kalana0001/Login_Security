const express = require("express"); 
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "KAlana#23",
    database: "login_security"
});

// Customer Sign Up
app.post("/signup", async (req, res) => {
    const sql = "INSERT INTO users (name, email, password) VALUES (?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ];
    db.query(sql, [values], (err, data) => {
        if (err) {
            return res.json("Error");
        }
        return res.json(data);
    });
});

// Customer Sign In
app.post("/signin", (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            return res.status(500).json("Error"); // Server error
        }
        if (data.length > 0) {
            return res.json("Success"); // Successful login
        } else {
            return res.status(401).json("Fail"); // Unauthorized
        }
    });
});

// Get User Data
app.get("/users", (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, data) => {
        if (err) {
            return res.status(500).json("Error fetching data"); // Server error
        }
        return res.json(data); // Send user data
    });
});



app.listen(8087, () => {
    console.log("Server is running on port 8087");
});
