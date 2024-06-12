import { JwtPayload } from 'jsonwebtoken';
import { TBooking } from './booking.interface';
import BookingModel from './booking.model';
import UserModel from '../user/user.model';
import { Types } from 'mongoose';
import FacilityModel from '../facility/facility.model';
import calculatePayable from '../../utils/calculatePayable/calculatePayable';
import moment from 'moment';

const createBooking = async (payload: TBooking, user: JwtPayload) => {
  const userData = await UserModel.findOne({ email: user.email });
  const facilityDetails = await FacilityModel.findById(payload.facility);

  if (!facilityDetails) {
    throw new Error('Facility not found!');
  }

  payload.user = userData?._id as Types.ObjectId;
  payload.payableAmount = calculatePayable(
    payload.endTime,
    payload.startTime,
    facilityDetails?.pricePerHour as number,
  );

  const result = await BookingModel.create(payload);
  return result;
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
    { isBooked: 'cancelled' },
    { new: true, runValidators: true },
  ).populate('facility');

  if (!result) {
    throw new Error('Booking not found!!');
  }

  return result;
};

const checkAvailability = async (dateFromQuery: string) => {
  const dateParam = dateFromQuery as string;
  const date = dateParam
    ? moment(dateParam, 'DD-MM-YYYY').format('YYYY-MM-DD')
    : moment().format('YYYY-MM-DD');

  // Fetch all bookings for the specified date
  const bookings = await BookingModel.find({ date: date }).select(
    'startTime endTime -_id',
  );

  if (bookings.length === 0) {
    throw new Error('No slots found for this date!');
  }

  return bookings;
};

export const BookingServices = {
  createBooking,
  viewAllBookings,
  viewAllBookingsByUser,
  cancelBooking,
  checkAvailability,
};
