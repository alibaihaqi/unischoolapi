import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import logger from 'morgan';
import indexRouter from './routes';
import userRouter from './routes/user';

// attach dotenv to whole file
dotenv.config();
const app = express();

app.use(cors());
// connect mongoose
const userDB = process.env.USER_DB_DEV;
const passDB = process.env.PASS_DB_DEV;
const mongoURL = `mongodb://${userDB}:${passDB}@ds155086.mlab.com:55086/unischool-user`;
mongoose.connect(mongoURL, {useNewUrlParser: true}, (err) => {
  if (err) { throw err; }
  // tslint:disable-next-line:no-console
  console.log('Successfully connected to MongoDB');
});
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// define a route handler for the default home page
app.use('/', indexRouter);
app.use('/users', userRouter);

// catch 404 and forward to error handler
app.use((req: any, res: any, next: any) => {
  next(createError(404));
});

// error handler
app.use((err: any, req: any, res: any, next: any) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
