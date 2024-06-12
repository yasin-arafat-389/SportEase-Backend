import { RequestHandler } from 'express';
import sendResponse from '../../utils/sendResponse/sendResponse';
import { BookingServices } from './booking.service';

const createBooking: RequestHandler = async (req, res, next) => {
  try {
    const result = await BookingServices.createBooking(req.body, req.user);

    sendResponse(res, result, 'Booking created succesfully');
  } catch (error) {
    next(error);
  }
};

const viewAllBookings: RequestHandler = async (req, res, next) => {
  try {
    const result = await BookingServices.viewAllBookings();

    sendResponse(res, result, 'Bookings retrieved succesfully');
  } catch (error) {
    next(error);
  }
};

const viewAllBookingsByUser: RequestHandler = async (req, res, next) => {
  try {
    const result = await BookingServices.viewAllBookingsByUser(req.user);

    sendResponse(res, result, 'Bookings retrieved succesfully');
  } catch (error) {
    next(error);
  }
};

const cancelBooking: RequestHandler = async (req, res, next) => {
  try {
    const result = await BookingServices.cancelBooking(req.params.id);

    sendResponse(res, result, 'Booking cancelled succesfully');
  } catch (error) {
    next(error);
  }
};

export const BookingControllers = {
  createBooking,
  viewAllBookings,
  viewAllBookingsByUser,
  cancelBooking,
};
