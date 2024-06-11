import { RequestHandler } from 'express';
import sendResponse from '../../utils/sendResponse/sendResponse';
import { FacilityServices } from './facility.service';

const createFacility: RequestHandler = async (req, res, next) => {
  try {
    const result = await FacilityServices.createFacility(req.body);

    sendResponse(res, result, 'Facility added succesfully');
  } catch (error) {
    next(error);
  }
};

const updateFacility: RequestHandler = async (req, res, next) => {
  try {
    const result = await FacilityServices.updateFacility(
      req.params.id,
      req.body,
    );

    sendResponse(res, result, 'Facility updated succesfully');
  } catch (error) {
    next(error);
  }
};

const deleteFacility: RequestHandler = async (req, res, next) => {
  try {
    const result = await FacilityServices.deleteFacility(req.params.id);

    sendResponse(res, result, 'Facility deleted succesfully');
  } catch (error) {
    next(error);
  }
};

const getAllFacility: RequestHandler = async (req, res, next) => {
  try {
    const result = await FacilityServices.getAllFacility();

    sendResponse(res, result, 'Facilities retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const FacilityControllers = {
  createFacility,
  updateFacility,
  deleteFacility,
  getAllFacility,
};
