const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");  // For password hashing
const jwt = require("jsonwebtoken");  // For JWT authentication
require('dotenv').config();  // For environment variables

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Change to your frontend's URL
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "KAlana#23",
    database: "login_security"
});

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    console.log("Received token:", token); // Log the received token
    if (!token) return res.status(401).json("Access Denied: No Token Provided");

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => { // Split to get token after "Bearer"
        if (err) {
            console.error("Token verification failed:", err); // Log the error
            return res.status(403).json("Invalid Token");
        }
        req.user = user;
        next();
    });
}

// Audit log function
function logAction(userId, action) {
    const sql = "INSERT INTO audit_logs (user_id, action) VALUES (?, ?)";
    db.query(sql, [userId, action], (err) => {
        if (err) console.error("Error logging action:", err);
    });
}

// Customer Sign Up
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    const sql = "INSERT INTO signs (name, email, password) VALUES (?)";
    
    try {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        const values = [name, email, hashedPassword];
        
        db.query(sql, [values], (err) => {
            if (err) {
                return res.status(500).json("Error registering user");
            }
            res.json("User Registered Successfully");
        });
    } catch (err) {
        res.status(500).json("Error hashing password");
    }
});

// Customer Sign In
app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM signs WHERE email = ?";
    
    db.query(sql, [email], async (err, data) => {
        if (err) {
            return res.status(500).json("Error");
        }
        if (data.length > 0) {
            const user = data[0];
            
            // Compare the provided password with the stored hashed password
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            
            if (!isPasswordCorrect) {
                return res.status(401).json("Fail");
            }
            
            // Generate JWT
            const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
            
            // Log successful login action
            logAction(user.id, "Signed in");
            
            res.json({ message: "Success", token });
        } else {
            return res.status(401).json("Fail");
        }
    });
});

// Get User Data (Authenticated route)
app.get("/users", authenticateToken, (req, res) => {
    // Change the SQL query to fetch only the authenticated user's data
    const sql = "SELECT * FROM signs WHERE id = ?";
    
    db.query(sql, [req.user.id], (err, data) => {
        if (err) {
            return res.status(500).json("Error fetching data");
        }
        
        // Log user access to this data
        logAction(req.user.id, "Viewed own data");
        
        // Check if the user exists
        if (data.length > 0) {
            return res.json(data[0]); // Return only the logged-in user's data
        } else {
            return res.status(404).json("User not found");
        }
    });
});

app.listen(8087, () => {
    console.log("Server is running on port 8087");
});
