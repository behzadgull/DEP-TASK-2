const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3002; 

app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'blog_db'        
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Create a blog post
app.post('/posts', (req, res) => {
    const { user_id, title, content } = req.body;
    const sql = 'INSERT INTO blog_posts (user_id, title, content) VALUES (?, ?, ?)';
    connection.query(sql, [user_id, title, content], (err, results) => {
        if (err) {
            console.error('Error creating post: ', err);
            res.status(500).send('Error creating post');
            return;
        }
        res.status(201).send(`Post created with ID: ${results.insertId}`);
    });
});

// Read all blog posts
app.get('/posts', (req, res) => {
    const sql = 'SELECT * FROM blog_posts';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching posts: ', err);
            res.status(500).send('Error fetching posts');
            return;
        }
        res.status(200).json(results);
    });
});

// Read a single blog post
app.get('/posts/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM blog_posts WHERE id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching post: ', err);
            res.status(500).send('Error fetching post');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Post not found');
            return;
        }
        res.status(200).json(results[0]);
    });
});

// Update a blog post
app.put('/posts/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const sql = 'UPDATE blog_posts SET title = ?, content = ? WHERE id = ?';
    connection.query(sql, [title, content, id], (err, results) => {
        if (err) {
            console.error('Error updating post: ', err);
            res.status(500).send('Error updating post');
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).send('Post not found');
            return;
        }
        res.status(200).send('Post updated successfully');
    });
});

// Delete a blog post
app.delete('/posts/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM blog_posts WHERE id = ?';
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error deleting post: ', err);
            res.status(500).send('Error deleting post');
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).send('Post not found');
            return;
        }
        res.status(200).send('Post deleted successfully');
    });
});

// Error handling for port in use
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please use a different port.`);
    } else {
        console.error('Error occurred: ', err);
    }
});
