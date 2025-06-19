const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const connectDB = require('./config/db');
require('dotenv').config();
const path = require("path")

dotenv.config();
connectDB();

const _dirname = path.resolve(); 

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoute = require('./routes/dashboardRoute');
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());



app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoute);
app.use("/api/reviews", reviewRoutes);



app.use(express.static(path.join(_dirname, "/frontend/dist")))
app.get('*', (_, res)=>{
  res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"))
});

app.get('/', (req, res) => {
  res.send('Welcome to the Auth API');
});



module.exports = app;
