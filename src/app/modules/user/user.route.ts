import express from 'express';
import { UserControllers } from './user.controller';
import validateRequest from '../../middlewares/validateRequest/validateRequest';
import { validateUser } from './user.validation';

const router = express.Router();

router.post(
  '/signup',
  validateRequest(validateUser.createUserValidation),
  UserControllers.createUser,
);

export const UserRoutes = router;
