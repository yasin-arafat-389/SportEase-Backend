import { JwtPayload } from 'jsonwebtoken';
import { TBooking } from './booking.interface';
import BookingModel from './booking.model';
import UserModel from '../user/user.model';
import { Types } from 'mongoose';

const createBooking = async (payload: TBooking, user: JwtPayload) => {
  try {
    const userData = await UserModel.findOne({ email: user.email });

    payload.user = userData?._id as Types.ObjectId;
    payload.payableAmount = 30;

    const result = await BookingModel.create(payload);
    return result;
  } catch (error) {
    console.log(error);
  }
};

const viewAllBookings = async () => {
  const result = await BookingModel.find()
    .populate('user')
    .populate('facility');
  return result;
};

const viewAllBookingsByUser = async (user: JwtPayload) => {
  const result = await BookingModel.find()
    .populate({
      path: 'user',
      match: { email: user.email },
    })
    .populate('facility');

  // Remove bookings where the user does not match
  const filteredResult = result.filter((booking) => booking.user);

  return filteredResult;
};

const cancelBooking = async (id: string) => {
  const result = await BookingModel.findOneAndUpdate(
    { _id: id },
    { isBooked: false },
    { new: true, runValidators: true },
  ).populate('facility');

  return result;
};

export const BookingServices = {
  createBooking,
  viewAllBookings,
  viewAllBookingsByUser,
  cancelBooking,
};
