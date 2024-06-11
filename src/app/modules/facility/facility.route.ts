import express from 'express';
import { FacilityControllers } from './facility.controller';
import validateRequest from '../../middlewares/validateRequest/validateRequest';
import { validateFacility } from './facility.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(validateFacility.validateCreateFacility),
  FacilityControllers.createFacility,
);

router.put(
  '/:id',
  validateRequest(validateFacility.validateUpdateFacility),
  FacilityControllers.updateFacility,
);

router.delete('/:id', FacilityControllers.deleteFacility);

router.get('/', FacilityControllers.getAllFacility);

export const FacilityRoutes = router;
