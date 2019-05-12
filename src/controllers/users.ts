import jwt from 'jsonwebtoken';
import _ from 'underscore';
import uuid from 'uuidv4';
import Model from '../models';
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
      if (checkUser !== null) {
        return res
          .status(409)
          .json({
            message: {
              code: 409,
              message: 'User is already exists',
            },
            success: false,
          });
      }

      const regisUser = await User.create({ userId: uuid(), email, username, password });
      const getUserData = regisUser.toJSON();

      const createJwt = jwt.sign({
        email: getUserData.email,
        userId: getUserData.userId,
        username: getUserData.username
      }, process.env.USER_JWT_SK);

      return res
        .status(200)
        .json({
          message: {
            auth: createJwt,
            code: 200,
            message: regisUser,
          },
          success: true,
        });
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

        const createJwt = jwt.sign({
          email: getUserData.email,
          userId: getUserData.userId,
          username: getUserData.username
        }, process.env.USER_JWT_SK);

        return res
          .status(200)
          .json({
            message: {
              auth: createJwt,
              code: 200,
              message: loginUser,
            },
            success: true,
          });
      }

      return res
        .status(404)
        .json({
          message: {
            code: 404,
            message: 'email or password is wrong',
          },
          success: false,
        });
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
          return res
            .status(400)
            .json({
              message: {
                code: 400,
                message: err.message,
              },
              success: false,
            });
        }

        return res
          .status(200)
          .json({
            message: {
              code: 200,
              message: result,
            },
            success: true,
          });
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

      User.findOneAndUpdate({
        email: decToken.email,
        userId: decToken.userId,
        username: decToken.username,
      }, { $set: { password: newPassword } }, { new: true }, (err, result: any) => {
        if (err) {
          return res
            .status(400)
            .json({
              message: {
                code: 400,
                message: err.message,
              },
              success: false,
            });
        }

        if (_.isNull(result)) {
          return res
            .status(404)
            .json({
              message: {
                code: 404,
                message: 'Data not found',
              },
              success: true,
            });
        } else {
          result.encryptPassword(newPassword, function(errEncrypt: any, hash: boolean) {
            if (errEncrypt) { throw errEncrypt; }

            if (_.isEmpty(hash)) {
              res
                .status(400)
                .json({
                  message: {
                    code: 400,
                    message: 'Bad Request',
                  },
                  success: false,
                });
            } else {
              result.password = hash;
              result.save();

              return res
                .status(200)
                .json({
                  message: {
                    code: 200,
                    message: result,
                  },
                  success: true,
                });
            }
          });
        }
      });
    } catch (e) {
      // tslint:disable-next-line:no-console
      res.send(e);
    }
  }
}

export default UserController;
