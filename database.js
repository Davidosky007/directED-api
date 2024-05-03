// Import mongoose
import mongoose from 'mongoose';

// Define schema for students
const studentSchema = new mongoose.Schema({
  pseudonym: {
    type: String,
    unique: true,
    required: true
  },
  // Qualtrics surveys
  percData: { type: Object }, // PERC data
  spiSpiritData: { type: Object }, // SPIGRIT data
  // Tally forms
  tallyForms: [{
    type: String,
    enum: ['Expression of Interest', 'Confirmation of Interest'] // Tally form types
  }],
  // Yenza test
  yenzaTest: { type: Object },
  // Attendance records
  attendanceRecords: { type: Object },
  // Oral exam results
  oralExamResults: { type: Object },
  // Project grades
  projectGrades: { type: Object },
  // Quiz results
  quizResults: { type: Object }
});

// Create model for students
const Student = mongoose.model('Student', studentSchema);

export default Student;
