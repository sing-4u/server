import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { JsonException } from '../exception';

@Catch(JsonException)
export class JsonExceptionFilter implements ExceptionFilter {
  catch(exception: JsonException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.status;
    const json = exception.json;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      detail: json,
    });
  }
}
