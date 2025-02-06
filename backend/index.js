const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

const USER_FILE = './data/users.json';
const DATA_FILE = './data/userdata.json';

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

if (!fs.existsSync(USER_FILE)) {
    fs.writeFileSync(USER_FILE, '[]');
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '{}');
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const users = JSON.parse(fs.readFileSync(USER_FILE));
        
        if (users.find(user => user.username === username)) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const users = JSON.parse(fs.readFileSync(USER_FILE));
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/save', authenticateToken, (req, res) => {
    const { data } = req.body;
    const username = req.user.username;

    try {
        const userData = JSON.parse(fs.readFileSync(DATA_FILE));
        userData[username] = data;
        fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
        res.json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/read', authenticateToken, (req, res) => {
    const username = req.user.username;

    try {
        const userData = JSON.parse(fs.readFileSync(DATA_FILE));
        res.json({ data: userData[username] || null });
    } catch (error) {
        console.error('Read error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

