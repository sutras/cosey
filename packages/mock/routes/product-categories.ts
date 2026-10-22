import { RequestInterceptor } from '@cosey/request-interceptor';
import { db } from '../db';
import { Resource } from '../utils/Resource';

export default function register(interceptor: RequestInterceptor) {
  const prefix = '/product-categories';

  new Resource(prefix, db.productCategories).intercept(interceptor);
}
