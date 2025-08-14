import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { OptimisticLockVersionMismatchError } from "typeorm";

@Catch(OptimisticLockVersionMismatchError)
export class OptimisticLockFilter<T> implements ExceptionFilter {
  catch(exception: OptimisticLockVersionMismatchError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    response.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      message: 'Resource was modified by another request. Please reload and try again.',
    });
  }
}
