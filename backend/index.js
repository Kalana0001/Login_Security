const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "KAlana#23",
    database: "login_security"
});



const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware for token authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    console.log("Token received in request:", token);
    if (!token) return res.status(401).json("Access Denied: No Token Provided");

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json("Invalid Token");
        }
        console.log("Authenticated user:", user);
        req.user = user;
        next();
    });
}

// Unified log action function
function logAction(userId, action) {
    console.log(`Attempting to log action: ${action} for user ID: ${userId}`); 
    const sql = "INSERT INTO audit_logs (user_id, action) VALUES (?, ?)";
    
    db.query(sql, [userId, action], (err) => {
        if (err) {
            console.error("Error logging action to the database:", err);
        } else {
            console.log(`Action logged: ${action} for user ID: ${userId}`);
        }
    });
}

app.post("/signup", async (req, res) => {
    const { name, email, password, userType } = req.body;
    const sql = "INSERT INTO signs (name, email, password, userType) VALUES (?, ?, ?, ?)";

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const values = [name, email, hashedPassword, userType];

        db.query(sql, values, (err) => {
            if (err) {
                return res.status(500).json("Error registering user");
            }
            res.json("User Registered Successfully");
        });
    } catch (err) {
        res.status(500).json("Error hashing password");
    }
});

// Sign-in route (login)
app.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM signs WHERE email = ?";

    db.query(sql, [email], async (err, data) => {
        if (err) {
            return res.status(500).json("Error");
        }
        if (data.length > 0) {
            const user = data[0];
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            
            if (!isPasswordCorrect) {
                logAction(user.id, "Login Failed");
                return res.status(401).json("Login Failed");
            }

            // Generate JWT
            const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
            logAction(user.id, "Signed in");
            res.json({ message: "Login Successful", token });
        } else {
            logAction(null, `Login Failed for email: ${email}`);
            return res.status(401).json("Login Failed");
        }
    });
});

// Logout route
app.post("/logout", authenticateToken, (req, res) => {
    if (req.user && req.user.id) {
        console.log("Logging out user ID:", req.user.id);
        logAction(req.user.id, "Signed out");
        res.json({ message: "Logout Successful" });
    } else {
        console.error("User ID not found, cannot log logout action");
        res.status(400).json({ message: "User ID not found" });
    }
});

// Fetch user data route
app.get("/users", authenticateToken, (req, res) => {
    const sql = "SELECT * FROM signs WHERE id = ?";
    
    db.query(sql, [req.user.id], (err, data) => {
        if (err) {
            return res.status(500).json("Error fetching data");
        }
        
        logAction(req.user.id, "Viewed own data");
        
        if (data.length > 0) {
            return res.json(data[0]);
        } else {
            return res.status(404).json("User not found");
        }
    });
});

// Corrected getUserType route
app.get('/getUserType', (req, res) => {
    const email = req.query.email;
    const sql = "SELECT userType FROM signs WHERE email = ?"; // Use your table and column names

    db.query(sql, [email], (err, data) => {
        if (err) {
            console.error("Error fetching user type:", err);
            return res.status(500).json({ message: 'Error fetching user type' });
        }

        if (data.length > 0) {
            res.json({ userType: data[0].userType });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// API endpoint to retrieve all fruits
app.get('/userActivities', (req, res) => {
    const sql = 'SELECT * FROM audit_logs';

    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

// API Endpoint to Get All Users
app.get('/viewUsers', (req, res) => {
    const query = 'SELECT * FROM signs'; // Query to fetch all users

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Server Error');
        }
        res.json(results); // Send the fetched data as JSON response
    });
});


// Start server
app.listen(8087, () => {
    console.log("Server is running on port 8087");
});
