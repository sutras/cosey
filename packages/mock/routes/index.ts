import { RequestInterceptor } from '@cosey/request-interceptor';

import { default as admins } from './admins';
import { default as auth } from './auth';
import { default as common } from './common';
import { default as configGroups } from './config-groups';
import { default as configs } from './configs';
import { default as enums } from './enums';
import { default as permissions } from './permissions';
import { default as postComment } from './post-comment';
import { default as postType } from './post-type';
import { default as posts } from './posts';
import { default as productCategories } from './product-categories';
import { default as products } from './products';
import { default as roles } from './roles';
import { default as social } from './social';
import { default as statistics } from './statistics';
import { default as users } from './users';

const modules = [
  admins,
  auth,
  common,
  configGroups,
  configs,
  enums,
  permissions,
  postComment,
  postType,
  posts,
  productCategories,
  products,
  roles,
  social,
  statistics,
  users,
];

export default function register(interceptor: RequestInterceptor) {
  modules.forEach((register) => {
    register(interceptor);
  });
}
