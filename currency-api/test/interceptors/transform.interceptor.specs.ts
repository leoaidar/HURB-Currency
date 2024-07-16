
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './../../src/core/interceptors/transform.interceptor';

describe('TransformInterceptorTest', () => {
  let interceptor: TransformInterceptor;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should transform response object', async () => {
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
          getResponse: () => ({}),
          getNext: () => ({})
        }),
      } as any;
      const next: CallHandler = {
        handle: () => of({ _id: '1', __v: 0, id: '1', code: 'USD', rate: 1, description: 'US Dollar' })
      };

      const result = await interceptor.intercept(mockExecutionContext, next).toPromise();

      expect(result).toEqual({
        id: '1',
        code: 'USD',
        rate: 1,
        description: 'US Dollar'
      });
    });

    it('should handle array of objects and transform each one', async () => {
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
          getResponse: () => ({}),
          getNext: () => ({})
        }),
      } as any;
      const next: CallHandler = {
        handle: () => of([
          { _id: '1', __v: 0, id: '1', code: 'USD', rate: 1, description: 'US Dollar' },
          { _id: '2', __v: 0, id: '2', code: 'EUR', rate: 1.2, description: 'Euro' }
        ])
      };

      const result = await interceptor.intercept(mockExecutionContext, next).toPromise();

      expect(result).toEqual([
        { id: '1', code: 'USD', rate: 1, description: 'US Dollar' },
        { id: '2', code: 'EUR', rate: 1.2, description: 'Euro' }
      ]);
    });
  });
});