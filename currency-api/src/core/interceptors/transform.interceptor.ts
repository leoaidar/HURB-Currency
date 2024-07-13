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
    // Construir o objeto explicitamente para garantir a ordem das propriedades
    return {
      id: response.id,
      name: response.name,
      rate: response.rate
    };
  }
}

// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
// import { map } from 'rxjs/operators';

// @Injectable()
// export class TransformInterceptor implements NestInterceptor {

//   intercept(context: ExecutionContext, next: CallHandler) {
//     return next.handle().pipe(
//       map(data => {
//         // Transforma o documento do Mongoose em um objeto any
//         const result = data.toObject ? data.toObject() : data;
//         // Excluir propriedades do Mongoose que nao quero devolver no response
//         const { _id, __v, ...cleanResult } = result;
//         console.log('data',data);
//         console.log('result',result);
//         console.log('cleanResult',cleanResult);
//         return cleanResult;
//       })
//     );
//   }
  
// }


// data [
//   {
//     _id: new ObjectId('6692d1d3dd358409ab786a83'),
//     id: 'b4e66de2-031a-48a0-8462-eac04e189b19',
//     name: 'ARTH',
//     rate: 10,
//     __v: 0
//   },
//   {
//     _id: new ObjectId('6692d872e44b77eb18c56052'),
//     name: 'LEO',
//     rate: 5,
//     id: '73072b97-bac0-425c-9738-daefd2e2fc8e',
//     name: 'LEO',
//     rate: 5,
//     id: '73072b97-bac0-425c-9738-daefd2e2fc8e',
//     __v: 0
//   }
// ]
// cleanResult {
//   '0': {
//     _id: new ObjectId('6692d1d3dd358409ab786a83'),
//     id: 'b4e66de2-031a-48a0-8462-eac04e189b19',
//     name: 'ARTH',
//     rate: 10,
//     __v: 0
//   },
//   '1': {
//     _id: new ObjectId('6692d872e44b77eb18c56052'),
//     name: 'LEO',
//     rate: 5,
//     id: '73072b97-bac0-425c-9738-daefd2e2fc8e',
//     __v: 0
//   }
// }
