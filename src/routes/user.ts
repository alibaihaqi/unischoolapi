import express from 'express';
import UserController from '../controllers/users';
import UserMiddleware from '../middlewares/user';

const router = express.Router();

router.post('/register', UserMiddleware.regisParams, UserController.registerUser);
router.post('/login', UserMiddleware.loginCheckPassword, UserMiddleware.loginParams, UserController.loginUser);
router.put('/updateuser', UserMiddleware.tokenAuth, UserController.updateUser);
router.put('/updatepassword', UserMiddleware.tokenAuth, UserMiddleware.comparePassword, UserController.updatePassword);

export default router;
