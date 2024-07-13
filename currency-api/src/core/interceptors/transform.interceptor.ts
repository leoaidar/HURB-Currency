import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(data => {
        const { _id, __v, ...result } = data;
        const viewModel = { 
          id: data._doc.id, 
          name: data._doc.name, 
          rate: data._doc.rate 
        };
        console.log('result',result);
        console.log('viewModel',viewModel);        
        return viewModel;
      })
    );
  }
  
}