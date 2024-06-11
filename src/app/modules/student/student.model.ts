import { Schema, model } from 'mongoose';
import { Student } from './student.interface';

const studentSchema = new Schema<Student>({
  name: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  contactNo: { type: String, required: true, unique: true },
  dateOfBirth: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emergencyContactNo: { type: String, required: true },
  gender: { type: String, required: true },
  guardian: { type: String, required: true },
  permanentAddres: { type: String, required: true },
  presentAddress: { type: String, required: true },
});

export const StudentModel = model<Student>('student', studentSchema);
