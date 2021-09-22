import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "./routes/index";
import authorization from "./middlewares/authorization";

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authorization);

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    errors: err.errors,
  });
});

export default app;
