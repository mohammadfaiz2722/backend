require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path=require('path')
const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB database
connectToMongo();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname,'./build')))

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('*',function(req,res){
  res.sendFile(path.join(__dirname,'./build/index.html'))
})
// Start the server
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
