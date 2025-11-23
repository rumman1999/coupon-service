export default class ApiError extends Error {
  statusCode: number;
  details?: any[];

  constructor(statusCode: number, message: string, details?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(message: string, details?: any[]) {
    return new ApiError(400, message, details);
  }

  static NotFound(message = "Resource Not Found") {
    return new ApiError(404, message);
  }

  static Internal(message = "Internal Server Error") {
    return new ApiError(500, message);
  }
}
