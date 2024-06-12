import mongoose, { Schema } from 'mongoose';
import { TBooking } from './booking.interface';

const BookingSchema: Schema = new Schema<TBooking>({
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  facility: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
  payableAmount: { type: Number, required: true },
  isBooked: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed',
  },
});

const BookingModel = mongoose.model<TBooking>('Booking', BookingSchema);

export default BookingModel;
