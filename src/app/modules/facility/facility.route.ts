import express from 'express';
import { FacilityControllers } from './facility.controller';
import validateRequest from '../../middlewares/validateRequest/validateRequest';
import { validateFacility } from './facility.validation';
import auth from '../../middlewares/auth/auth';

const router = express.Router();

router.post(
  '/',
  auth('admin'),
  validateRequest(validateFacility.validateCreateFacility),
  FacilityControllers.createFacility,
);

router.put(
  '/:id',
  auth('admin'),
  validateRequest(validateFacility.validateUpdateFacility),
  FacilityControllers.updateFacility,
);

router.delete('/:id', auth('admin'), FacilityControllers.deleteFacility);

router.get('/', FacilityControllers.getAllFacility);

router.get('/details/:id', FacilityControllers.getSingleFacilityDetails);

export const FacilityRoutes = router;
