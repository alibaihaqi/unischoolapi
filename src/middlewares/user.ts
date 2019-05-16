import jwt from 'jsonwebtoken';
import _ from 'underscore';
import Model from '../models';
import RespondHandler from '../utils/getResponHandler';
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
        return RespondHandler.authResponseHandler(res, 400, 'Bad Request', false);
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
        return RespondHandler.authResponseHandler(res, 400, 'Bad Request', false);
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
        return RespondHandler.authResponseHandler(res, 403, 'User doesn\'t have a permission', false);
      }
    } catch (e) {
      return RespondHandler.authResponseHandler(res, 403, 'User doesn\'t have a permission', false);
    }
  }

  public static loginCheckPassword(req: any, res: any, next: any) {
    const {
      email,
      password,
    } = req.body;

    try {
      const checkData = /\@/i.test(email) ? 'email' : 'username';

      User.findOne({
        [checkData]: email,
      }, function(errFindOne, user: any) {
        if (errFindOne) {
          return RespondHandler.authResponseHandler(res, 500, errFindOne.message, false);
        }

        // test a matching password
        user.comparePassword(password, function(errComparePass: any, isMatch: boolean) {
          if (errComparePass) {
            return RespondHandler.authResponseHandler(res, 500, errComparePass.message, false);
          }

          if (isMatch) {
            next();
          } else {
            return RespondHandler.authResponseHandler(res, 403, 'wrong password', false);
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
        if (errFindOne) {
          return RespondHandler.authResponseHandler(res, 500, errFindOne.message, false);
        }

        // test a matching password
        user.comparePassword(password, function(errComparePass: any, isMatch: boolean) {
          if (errComparePass) {
            return RespondHandler.authResponseHandler(res, 500, errComparePass.message, false);
          }

          if (isMatch) {
            next();
          } else {
            return RespondHandler.authResponseHandler(res, 403, 'Wrong password', false);
          }
        });
      });
    } catch (e) {
      res.send(e);
    }
  }
}

export default UserMiddleware;
