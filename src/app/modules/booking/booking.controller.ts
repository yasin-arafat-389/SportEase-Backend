import { RequestHandler } from 'express';
import sendResponse from '../../utils/sendResponse/sendResponse';
import { BookingServices } from './booking.service';

const createBooking: RequestHandler = async (req, res, next) => {
  try {
    const result = await BookingServices.createBooking(req.body);

    sendResponse(res, result, 'Booking created succesfully');
  } catch (error) {
    next(error);
  }
};

export const BookingControllers = {
  createBooking,
};
