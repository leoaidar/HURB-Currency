import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(data => {
        if (Array.isArray(data)) {
          return data.map(item => this.transformDocument(item));
        }
        return this.transformDocument(data);
      })
    );
  }

  private transformDocument(response) {
    if (response.toObject) {
      response = response.toObject();
    }
    const { _id, __v, ...result } = response;
    // Construir o objeto explicito para garantir a ordem das propriedades
    return {
      id: response.id,
      name: response.name,
      rate: response.rate,
      description: response.description
    };
  }
}
