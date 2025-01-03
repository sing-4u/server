import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status;
    let responseBody;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      responseBody = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        statusCode: status,
        message: 'Internal Server Error',
      };

      if (process.env.NODE_ENV !== 'test') {
        this.logger.error(
          {
            method: request.method,
            url: request.url,
            params: request.params,
            query: request.query,
            body: request.body,
          },
          exception.stack,
        );
      }
    }

    response.status(status).json(responseBody);
  }
}
