const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'data')));

// Upload Excel File
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'data/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// API to upload Excel file
app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded successfully', fileName: req.file.originalname });
});

// API to get Driver sheet data
app.get('/driver-data', (req, res) => {
    const workbook = xlsx.readFile(path.join(__dirname, 'data', 'Driver - Vikram.xlsx'));
    const worksheet = workbook.Sheets['Driver'];
    const data = xlsx.utils.sheet_to_json(worksheet);
    res.json(data);
});

// API to calculate Projected Renewal
app.post('/calculate-renewal', (req, res) => {
    const { driverData } = req.body;
    const workbook = xlsx.readFile(path.join(__dirname, 'data', 'Driver - Vikram.xlsx'));
    const expirationsSheet = workbook.Sheets['Expirations'];
    const expirationsData = xlsx.utils.sheet_to_json(expirationsSheet);

    const updatedDriverData = driverData.map(row => {
        const averageRent = expirationsData
            .filter(expiration => expiration.Property === row.Property)
            .reduce((acc, curr) => acc + curr['Scheduled Charges'], 0) /
            expirationsData.filter(expiration => expiration.Property === row.Property).length;

        const increase = row['Proposed Increase'] ? row['Proposed Increase'] : row['Standard Increase'];
        row['Projected Renewal'] = averageRent * (1 + increase);
        return row;
    });

    res.json(updatedDriverData);
});

// API to get rent summary data for a specific property
app.get('/rent-summary/:property', (req, res) => {
    const property = req.params.property;
    const workbook = xlsx.readFile(path.join(__dirname, 'data', 'Driver - Vikram.xlsx'));
    const worksheet = workbook.Sheets['Rent Summary'];
    const rentSummaryData = xlsx.utils.sheet_to_json(worksheet);
    
    const propertyData = rentSummaryData.find(row => row.Property === property);
    if (propertyData) {
        res.json(propertyData);
    } else {
        res.status(404).json({ message: 'Property not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
