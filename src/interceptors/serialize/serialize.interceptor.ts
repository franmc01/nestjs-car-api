import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export const Serialize = <T>(dto: ClassConstructor<T>) => {
  return applyDecorators(UseInterceptors(new SerializeInterceptor(dto)));
};

@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private readonly Dto: ClassConstructor<T>) {}

  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        if (data == null) return data;

        if (typeof data?.pipe === 'function' || Buffer.isBuffer(data)) {
          return data;
        }

        const transform = (item: any) =>
          plainToInstance(this.Dto, item, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
          });

        if (Array.isArray(data)) return data.map(transform);

        if (data && Array.isArray(data.items) && 'meta' in data) {
          return {
            items: data.items.map(transform),
            meta: data.meta,
          };
        }
        return transform(data);
      }),
    );
  }
}
