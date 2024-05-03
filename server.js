import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import XLSX from 'xlsx';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './db.js';
import Student from './database.js'; // Assuming the model is defined in student.js
import { fileURLToPath } from 'url'; // Import fileURLToPath function

// Resolve the directory path
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

// Database connection
connectDB();

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies

// Tally Integration - Webhook endpoint for inserting data into the database
app.post('/webhook/tally', async (req, res) => {
  try {
    const { pseudonym, data } = req.body;

    // Find the student by pseudonym and update their data
    const student = await Student.findOneAndUpdate({ pseudonym }, data, {
      new: true,
      upsert: true,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error('Error inserting data from Tally:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Export Functionality - API endpoint to export data as a spreadsheet
app.get('/api/export', async (req, res) => {
  try {
    // Fetch data from the database
    const students = await Student.find();

    // Define headers
    const headers = [
      'pseudonym',
      'percData_question1',
      'percData_question2',
      'spiSpiritData_question1',
      'spiSpiritData_question2',
      'tallyForms',
      'yenzaTest_score',
      'attendanceRecords_date',
      'attendanceRecords_status',
      'oralExamResults_score',
      'projectGrades_score',
      'quizResults_score'
    ];

    // Prepare data for XLSX format
    const xlsxData = students.map(student => ({
      pseudonym: student.pseudonym,
      percData_question1: student.percData?.question1 || '',
      percData_question2: student.percData?.question2 || '',
      spiSpiritData_question1: student.spiSpiritData?.question1 || '',
      spiSpiritData_question2: student.spiSpiritData?.question2 || '',
      tallyForms: student.tallyForms.join(', '), // Convert array to string
      yenzaTest_score: student.yenzaTest?.score || '',
      attendanceRecords_date: student.attendanceRecords?.date || '',
      attendanceRecords_status: student.attendanceRecords?.status || '',
      oralExamResults_score: student.oralExamResults?.score || '',
      projectGrades_score: student.projectGrades?.score || '',
      quizResults_score: student.quizResults?.score || ''
    }));

    // Convert data to XLSX format
    const worksheet = XLSX.utils.json_to_sheet(xlsxData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Write XLSX file
    const filePath = path.resolve(__dirname, 'exported_data.xlsx'); // Get absolute path
    XLSX.writeFile(workbook, filePath);

    // Send the file as response
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).send('Internal Server Error');
  }
});




// RESTful API endpoints for CRUD operations
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
