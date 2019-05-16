
class ResponHandler {
  public static authResponseHandler(res: any, statusCode: number, message: any, success: boolean, jwt: string = '') {
    if (typeof message === 'string') {
      return res
        .status(statusCode)
        .json({
          message: {
            code: statusCode,
            message,
          },
          success,
        });
    } else if (typeof message === 'object') {
      const newResult: any = {};

      for (const key in message._doc) {
        if (key !== '_id'
        && key !== '__v'
        && key !== 'password') {
          newResult[key] = message[key];
        }
      }

      return res
        .status(statusCode)
        .json({
          message: {
            auth: jwt,
            code: statusCode,
            message: newResult,
          },
          success,
        });
    }
  }
}

export default ResponHandler;
