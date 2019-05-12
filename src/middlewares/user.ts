import jwt from 'jsonwebtoken';
import _ from 'underscore';
import Model from '../models';
const { User } = Model;

class UserMiddleware {
  public static regisParams(req: any, res: any, next: any) {
    try {
      const {
        email,
        password,
        username,
      } = req.body;

      if (_.isEmpty(email) || _.isEmpty(username) || _.isEmpty(password)) {
        return res
          .status(400)
          .json({
            message: {
              code: 400,
              message: 'Bad Request',
            },
            success: false,
          });
      } else {
        next();
      }
    } catch (e) {
      res.send(e);
    }
  }

  public static loginParams(req: any, res: any, next: any) {
    try {
      const {
        email,
        password,
      } = req.body;

      if (_.isEmpty(email) || _.isEmpty(password)) {
        return res
          .status(400)
          .json({
            message: {
              code: 400,
              message: 'Bad Request',
            },
            success: false,
          });
      } else {
        next();
      }
    } catch (e) {
      res.send(e);
    }
  }

  public static tokenAuth(req: any, res: any, next: any) {
    const {
      authentication
    } = req.headers;

    try {
      const decToken: string | object = jwt.verify(authentication, process.env.USER_JWT_SK);

      if (decToken) {
        next();
      } else {
        res
          .status(403)
          .json({
            message: {
              code: 403,
              message: 'User doesn\'t have a permission',
            },
            success: false,
          });
      }
    } catch (e) {
      res
        .status(403)
        .json({
          message: {
            code: 403,
            message: e.message,
          },
          success: false,
        });
    }
  }

  public static loginCheckPassword(req: any, res: any, next: any) {
    const {
      email,
      password,
    } = req.body;

    // tslint:disable-next-line:no-console
    console.log('masuk check pass');
    try {
      const checkData = /\@/i.test(email) ? 'email' : 'username';

      User.findOne({
        [checkData]: email,
      }, function(errFindOne, user: any) {
        if (errFindOne) {
          res
            .status(500)
            .json({
              message: {
                code: 500,
                message: 'Error Find One',
              },
              success: false,
            });
        }
        // tslint:disable-next-line:no-console
        console.log('masuk findOne', user);
        // test a matching password
        user.comparePassword(password, function(errComparePass: any, isMatch: boolean) {
          if (errComparePass) {
            res
              .status(500)
              .json({
                message: {
                  code: 500,
                  message: 'wrong password',
                },
                success: false,
              });
          }
          // tslint:disable-next-line:no-console
          console.log(isMatch);
          if (isMatch) {
            next();
          } else {
            res
              .status(403)
              .json({
                message: {
                  code: 403,
                  message: 'wrong password',
                },
                success: false,
              });
          }
        });
      });
    } catch (e) {
      res.send(e);
    }
  }

  public static comparePassword(req: any, res: any, next: any) {
    const {
      authentication
    } = req.headers;

    const {
      password,
    } = req.body;

    try {
      const decToken: any = jwt.verify(authentication, process.env.USER_JWT_SK);
      User.findOne({
        email: decToken.email,
        userId: decToken.userId,
        username: decToken.username
      }, function(errFindOne, user: any) {
        if (errFindOne) { throw errFindOne; }

        // test a matching password
        user.comparePassword(password, function(errComparePass: any, isMatch: boolean) {
          if (errComparePass) { throw errComparePass; }

          if (isMatch) {
            next();
          } else {
            res
              .status(403)
              .json({
                message: {
                  code: 403,
                  message: 'Wrong password',
                },
                success: false,
              });
          }
        });
      });
    } catch (e) {
      res.send(e);
    }
  }
}

export default UserMiddleware;
