import { Types } from 'mongoose';

export type TBooking = {
  date: string;
  startTime: string;
  endTime: string;
  user: Types.ObjectId;
  facility: Types.ObjectId;
  payableAmount: number;
  paymentStatus: 'pending' | 'paid';
  transactionId: string;
  isBooked: 'confirmed' | 'cancelled' | 'pending';
};
