require('dotenv').config();
const mongoose = require('mongoose');

// console.log('Loaded MONGO_URI:', process.env.REACT_APP_API_URL); // Add this line for debugging
const mongoUri=process.env.MONGO_URI
console.log(process.env.MONGO_URI)
const connectToMongo = () => {
    mongoose.connect(mongoUri, 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error);
        });
};

module.exports = connectToMongo;
