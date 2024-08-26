import { JwtPayload } from 'jsonwebtoken';
import { TBooking } from './booking.interface';
import BookingModel from './booking.model';
import UserModel from '../user/user.model';
import { Types } from 'mongoose';
import FacilityModel from '../facility/facility.model';
import calculatePayable from '../../utils/calculatePayable/calculatePayable';
import moment from 'moment';
import {
  initiatePayment,
  verifyPayment,
} from '../../utils/Payment.Gateway/PaymentGateway';
import { readFileSync } from 'fs';
import { join } from 'path';

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

  const transactionId = `TXN-${Date.now()}`;

  payload.user = userData?._id as Types.ObjectId;
  payload.transactionId = transactionId;
  payload.payableAmount = calculatePayable(
    payload.endTime,
    payload.startTime,
    facilityDetails?.pricePerHour as number,
  );

  const paymentInfo = {
    transactionId,
    totalPrice: parseFloat(payload.payableAmount.toFixed(2)),
    custormerName: userData?.name,
    customerEmail: userData?.email,
    customerAddress: userData?.address,
    customerPhone: userData?.phone,
  };

  const booking = await BookingModel.create({
    ...payload,
    payableAmount: parseFloat(payload.payableAmount.toFixed(2)),
  });

  const initializePayment = await initiatePayment(paymentInfo);

  return { booking, initializePayment };
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
  const dateParam = dateFromQuery || moment().format('YYYY-MM-DD');
  const date = dateParam;

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

  // If no bookings for the day, show the full day availability
  if (sortedBookings.length === 0) {
    availableSlots.push({
      startTime: '00:00',
      endTime: '23:59',
    });
    return availableSlots;
  }

  // Check time before the first booking
  if (fullDayStart.isBefore(moment(sortedBookings[0].startTime, 'HH:mm'))) {
    availableSlots.push({
      startTime: fullDayStart.format('HH:mm'),
      endTime: moment(sortedBookings[0].startTime, 'HH:mm').format('HH:mm'),
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
    moment(sortedBookings[sortedBookings.length - 1].endTime, 'HH:mm').isBefore(
      fullDayEnd,
    )
  ) {
    availableSlots.push({
      startTime: moment(
        sortedBookings[sortedBookings.length - 1].endTime,
        'HH:mm',
      ).format('HH:mm'),
      endTime: '23:59',
    });
  }

  return availableSlots;
};

const paymentConfirmation = async (transactionId: string, status: string) => {
  const verifyResponse = await verifyPayment(transactionId);

  let result;
  let message = '';

  if (verifyResponse && verifyResponse.pay_status === 'Successful') {
    result = await BookingModel.findOneAndUpdate(
      { transactionId },
      {
        paymentStatus: 'paid',
        isBooked: 'confirmed',
      },
    );
    message = 'Successfully Paid!';
  } else {
    message = 'Payment Failed!';
  }

  const filePathForSuccessfulPaymentTemplate = join(
    // eslint-disable-next-line no-undef
    __dirname,
    '../../../views/paymentSuccess.html',
  );

  // eslint-disable-next-line no-undef
  const filePathForFailedPaymentTemplate = join(
    // eslint-disable-next-line no-undef
    __dirname,
    '../../../views/paymentFailed.html',
  );

  let templateForSuccessfulPayment = readFileSync(
    filePathForSuccessfulPaymentTemplate,
    'utf-8',
  );

  const templateForFailedPayment = readFileSync(
    filePathForFailedPaymentTemplate,
    'utf-8',
  );

  if (message === 'Successfully Paid!') {
    return (templateForSuccessfulPayment = templateForSuccessfulPayment.replace(
      '{{message}}',
      message,
    ));
  }

  if (message === 'Payment Failed!') {
    return templateForFailedPayment.replace('{{message}}', message);
  }

  // return templateForSuccessfulPayment;
};

export const BookingServices = {
  createBooking,
  viewAllBookings,
  viewAllBookingsByUser,
  cancelBooking,
  checkAvailability,
  paymentConfirmation,
};
