import Dexie from 'dexie';

import type { Admin } from './models/admin';
import type { Role } from './models/role';
import type { Permission } from './models/permission';
import type { PermissionRole } from './models/permission-role';
import type { AdminRole } from './models/admin-role';
import type { User } from './models/user';
import type { Asset } from './models/asset';
import type { Enum } from './models/enum';
import type { EnumItem } from './models/enum-item';
import type { Post } from './models/post';
import type { Posttype } from './models/post-type';
import type { PostComment } from './models/post-comment';
import type { ConfigGroup } from './models/config-group';
import type { Config } from './models/config';
import type { ProductCategory } from './models/product-category';
import type { Product } from './models/product';

export type DB = Dexie & {
  admins: Admin;
  roles: Role;
  permissions: Permission;
  permissionRoles: PermissionRole;
  adminRoles: AdminRole;
  users: User;
  assets: Asset;
  enums: Enum;
  enumItems: EnumItem;
  posts: Post;
  postTypes: Posttype;
  postComments: PostComment;
  configGroups: ConfigGroup;
  configs: Config;
  productCategories: ProductCategory;
  products: Product;
};
