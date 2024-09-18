const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes'); 
const hospitalAdminRoutes = require('./routes/hospitalAdminRoutes'); 
const app = express();
const normalUserRoutes = require('./routes/normalUserRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const cors = require('cors');

require('./models');

app.use(express.json());
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hospitalAdmin', hospitalAdminRoutes);
app.use('/api/normalUser', normalUserRoutes);
app.use('/api/vendor', vendorRoutes);

sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
    });

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error syncing database: ', err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
