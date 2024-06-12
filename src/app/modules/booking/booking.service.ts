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

  // Fetch all bookings for the specified facility on the specified date
  const bookings = await BookingModel.find({
    date: payload.date,
  });

  // Check for overlapping bookings
  const requestedStartTime = moment(payload.startTime, 'HH:mm');
  const requestedEndTime = moment(payload.endTime, 'HH:mm');

  for (const booking of bookings) {
    const existingStartTime = moment(booking.startTime, 'HH:mm');
    const existingEndTime = moment(booking.endTime, 'HH:mm');

    const isOverlap =
      requestedStartTime.isBefore(existingEndTime) &&
      requestedEndTime.isAfter(existingStartTime);

    if (isOverlap) {
      throw new Error('The requested time slot is already booked!');
    }
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

  // Fetch all bookings for the specified date, selecting only startTime and endTime
  const bookings = await BookingModel.find({ date: date }).select(
    'startTime endTime -_id',
  );

  // Define the full range of the day's available time slots
  const fullDayStart = moment('00:00', 'HH:mm');
  const fullDayEnd = moment('24:00', 'HH:mm');

  // Sort the bookings by startTime
  const sortedBookings = bookings.sort((a, b) =>
    moment(a.startTime, 'HH:mm').diff(moment(b.startTime, 'HH:mm')),
  );

  // Initialize available slots array
  const availableSlots = [];

  // Check time before the first booking
  if (
    sortedBookings.length === 0 ||
    fullDayStart.isBefore(moment(sortedBookings[0].startTime, 'HH:mm'))
  ) {
    availableSlots.push({
      startTime: fullDayStart.format('HH:mm'),
      endTime:
        sortedBookings.length > 0
          ? moment(sortedBookings[0].startTime, 'HH:mm').format('HH:mm')
          : fullDayEnd.format('HH:mm'),
    });
  }

  // Check gaps between bookings
  for (let i = 0; i < sortedBookings.length - 1; i++) {
    const endCurrentBooking = moment(sortedBookings[i].endTime, 'HH:mm');
    const startNextBooking = moment(sortedBookings[i + 1].startTime, 'HH:mm');

    if (endCurrentBooking.isBefore(startNextBooking)) {
      availableSlots.push({
        startTime: endCurrentBooking.format('HH:mm'),
        endTime: startNextBooking.format('HH:mm'),
      });
    }
  }

  // Check time after the last booking
  if (
    sortedBookings.length > 0 &&
    moment(sortedBookings[sortedBookings.length - 1].endTime, 'HH:mm').isBefore(
      fullDayEnd,
    )
  ) {
    availableSlots.push({
      startTime: moment(
        sortedBookings[sortedBookings.length - 1].endTime,
        'HH:mm',
      ).format('HH:mm'),
      endTime: fullDayEnd.format('HH:mm'),
    });
  }

  return availableSlots;
};

export const BookingServices = {
  createBooking,
  viewAllBookings,
  viewAllBookingsByUser,
  cancelBooking,
  checkAvailability,
};
