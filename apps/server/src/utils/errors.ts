import { Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  errors: Record<string, string[]>;
  
  constructor(errors: Record<string, string[]>, message = 'Validation Error') {
    super(message, 422);
    this.errors = errors;
  }
}

export const errorHandler = (
  err: any,
  req: any,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      status: err.status,
      message: err.message,
      stack: err.stack,
      ...(err.errors && { errors: err.errors })
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const errors: Record<string, string[]> = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = [err.errors[key].message];
    });
    return res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again!',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Your token has expired! Please log in again.',
    });
  }

  // Handle custom AppError instances
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Handle unexpected errors
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
};

export const catchAsync = (fn: Function) => {
  return (req: any, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
