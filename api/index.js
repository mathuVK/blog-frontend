const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const app = express();

// Use memory storage for uploads
const uploadMiddleware = multer({ storage: multer.memoryStorage() });
const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';
const PORT = 4000;
const DB_URI = process.env.MONGODB_URI; 
const CLIENT_URL = process.env.CLIENT_URL;

// Middleware
app.use(cors({
    credentials: true,
    origin: '*',  // Allow any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow specific methods
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.set('strictQuery', false);
mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Register User
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        console.error('Error during registration:', e);
        res.status(400).json(e);
    }
});

// Login User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.findOne({ username });
        if (!userDoc) {
            return res.status(400).json('User not found');
        }
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json({ id: userDoc._id, username });
            });
        } else {
            res.status(400).json('Wrong credentials');
        }
    } catch (e) {
        console.error('Error during login:', e);
        res.status(500).json('Server error');
    }
});

// Get Profile
app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json('Unauthorized');
    
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) return res.status(401).json('Token invalid');
        res.json(info);
    });
});

// Logout User
app.post('/logout', (req, res) => {
    res.cookie('token', '').json('Logged out');
});

// Create Post (now using memory storage for file upload)
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname } = req.file;
    const { token } = req.cookies;

    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) return res.status(401).json('Token invalid');

        const { title, summary, content } = req.body;
        try {
            const postDoc = await Post.create({
                title,
                summary,
                content,
                cover: originalname,  // Handle cover file (in memory)
                author: info.id,
            });
            res.json(postDoc);
        } catch (e) {
            console.error('Error creating post:', e);
            res.status(500).json('Server error');
        }
    });
});

// Update Post
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) return res.status(401).json('Token invalid');
        
        const { id, title, summary, content } = req.body;
        try {
            const postDoc = await Post.findById(id);
            if (!postDoc) return res.status(404).json('Post not found');
            
            const isAuthor = String(postDoc.author) === String(info.id);
            if (!isAuthor) return res.status(403).json('You are not the author');
            
            await postDoc.update({
                title,
                summary,
                content,
                cover: req.file ? req.file.originalname : postDoc.cover,
            });
            res.json(postDoc);
        } catch (e) {
            console.error('Error updating post:', e);
            res.status(500).json('Server error');
        }
    });
});

// Fetch Recent Posts
app.get('/post', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(posts);
    } catch (e) {
        console.error('Error fetching posts:', e);
        res.status(500).json('Server error');
    }
});

// Fetch Single Post by ID
app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const postDoc = await Post.findById(id).populate('author', ['username']);
        if (!postDoc) return res.status(404).json('Post not found');
        res.json(postDoc);
    } catch (e) {
        console.error('Error fetching post:', e);
        res.status(500).json('Server error');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
