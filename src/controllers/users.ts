import jwt from 'jsonwebtoken';
import _ from 'underscore';
import uuid from 'uuidv4';
import Model from '../models';
import ResponHandler from '../utils/getResponHandler';
const { User } = Model;

class UserController {
  public static async registerUser(req: any, res: any) {
    try {
      const {
        email,
        password,
        username,
      } = req.body;

      const checkUser = await User.findOne({ email });
      if (!_.isNull(checkUser)) {
        return ResponHandler.authResponseHandler(res, 409, 'User is already exists', false);
      }

      const regisUser = await User.create({ userId: uuid(), email, username, password });

      return ResponHandler.authResponseHandler(res, 200, regisUser, true);
    } catch (e) {
      // tslint:disable-next-line:no-console
      res.send(e);
    }
  }

  public static async loginUser(req: any, res: any) {
    try {
      const {
        email,
      } = req.body;

      const loginUser = /\@/i.test(email)
        ? await User.findOne({ email })
        : await User.findOne({ username: email });
      if (loginUser !== null) {
        const getUserData = loginUser.toJSON();

        if (getUserData.active) {
          const createJwt = jwt.sign({
            email: getUserData.email,
            userId: getUserData.userId,
            username: getUserData.username
          }, process.env.USER_JWT_SK);

          return ResponHandler.authResponseHandler(res, 200, loginUser, true, createJwt);
        }

        return ResponHandler.authResponseHandler(res, 200, loginUser, true);

      }

      return ResponHandler.authResponseHandler(res, 404, 'email or password is wrong', false);
    } catch (e) {
      // tslint:disable-next-line:no-console
      res.send(e);
    }
  }

  public static updateUser(req: any, res: any) {
    try {
      const {
        name,
        birthDate,
      } = req.body;

      const {
        authentication
      } = req.headers;

      const decToken: any = jwt.verify(authentication, process.env.USER_JWT_SK);

      User.findOneAndUpdate({
        email: decToken.email,
        userId: decToken.userId,
        username: decToken.username,
      }, { $set: { name, birthDate } }, { new: true }, (err, result) => {
        if (err) {
          return ResponHandler.authResponseHandler(res, 400, err.message, false);
        }

        return ResponHandler.authResponseHandler(res, 200, result, true, authentication);
      });
    } catch (e) {
      // tslint:disable-next-line:no-console
      res.send(e);
    }
  }

  public static updatePassword(req: any, res: any) {
    try {
      const {
        newPassword,
      } = req.body;

      const {
        authentication
      } = req.headers;

      const decToken: any = jwt.verify(authentication, process.env.USER_JWT_SK);

      User.findOne({
        email: decToken.email, userId: decToken.userId,
        username: decToken.username
      }, (err, result: any) => {
        if (err) {
          return ResponHandler.authResponseHandler(res, 400, err.message, false);
        }

        if (_.isNull(result)) {
          return ResponHandler.authResponseHandler(res, 404, 'Data not found', false);
        } else {
          result.password = newPassword;
          result.save();

          return ResponHandler.authResponseHandler(res, 200, result, true, authentication);
        }
      });
    } catch (e) {
      // tslint:disable-next-line:no-console
      res.send(e);
    }
  }
}

export default UserController;
