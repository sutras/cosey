import { getAvatarBase64 } from '../../utils/crypto';
import { DB } from '../types';
import * as mock from '@gunny/mock';
import CryptoJS from 'crypto-js';
import { schema } from '..';

function fillObject(fields: string[], item: any[]) {
  return fields.reduce(
    (obj, field, index) => {
      obj[field] = item[index];
      return obj;
    },
    {} as Record<(typeof fields)[number], any>,
  );
}

export async function seed(db: DB) {
  const date = new Date();

  // assets
  const assets = Array(200)
    .fill(0)
    .map((_, i) => {
      const id = i + 1;
      const uuid = CryptoJS.MD5(Date.now() + '' + Math.random()).toString();
      const name = `${id}.svg`;
      const url = '/mock/uploads/' + uuid + '.svg';
      const dataURL = getAvatarBase64(id);

      return {
        id,
        dataURL,
        uuid,
        name,
        size: 1306,
        type: 'image/svg+xml',
        url,
        createdAt: date,
        updatedAt: date,
      };
    });

  await db.assets.bulkAdd(assets);

  // permissions
  // prettier-ignore
  const permissions = [
    [1,  null, 'manage', 'rbac',                null, '访问控制', 1,  date, date],
    [2,  1,    'manage', 'rbac_user',           null, '用户管理', 2,  date, date],
    [3,  2,    'create', 'rbac_user',           null, '创建用户', 3,  date, date],
    [4,  2,    'read',   'rbac_user',           null, '查看用户', 4,  date, date],
    [5,  2,    'update', 'rbac_user',           null, '修改用户', 5,  date, date],
    [6,  2,    'delete', 'rbac_user',           null, '删除用户', 6,  date, date],
    [7,  1,    'manage', 'rbac_role',           null, '角色管理', 7,  date, date],
    [8,  7,    'create', 'rbac_role',           null, '创建角色', 8,  date, date],
    [9,  7,    'read',   'rbac_role',           null, '查看角色', 9,  date, date],
    [10, 7,    'update', 'rbac_role',           null, '修改角色', 10, date, date],
    [11, 7,    'delete', 'rbac_role',           null, '删除角色', 11, date, date],
    [12, 1,    'manage', 'rbac_permission',     null, '权限管理', 12, date, date],
    [13, 12,   'create', 'rbac_permission',     null, '创建权限', 13, date, date],
    [14, 12,   'read',   'rbac_permission',     null, '查看权限', 14, date, date],
    [15, 12,   'update', 'rbac_permission',     null, '修改权限', 15, date, date],
    [16, 12,   'delete', 'rbac_permission',     null, '删除权限', 16, date, date],

    [17, null, 'manage', 'blog',                null, '博客管理', 17, date, date],
    [18, 17,   'manage', 'blog_type',           null, '分类管理', 18, date, date],
    [19, 18,   'create', 'blog_type',           null, '创建分类', 19, date, date],
    [20, 18,   'read',   'blog_type',           null, '查看分类', 20, date, date],
    [21, 18,   'update', 'blog_type',           null, '修改分类', 21, date, date],
    [22, 18,   'delete', 'blog_type',           null, '删除分类', 22, date, date],
    [23, 17,   'manage', 'blog_post',           null, '文章管理', 23, date, date],
    [24, 23,   'create', 'blog_post',           null, '创建文章', 24, date, date],
    [25, 23,   'read',   'blog_post',           null, '查看文章', 25, date, date],
    [26, 23,   'update', 'blog_post',           null, '修改文章', 26, date, date],
    [27, 23,   'delete', 'blog_post',           null, '删除文章', 27, date, date],
    [28, 17,   'manage', 'blog_comment',        null, '评论管理', 28, date, date],
    [29, 28,   'create', 'blog_comment',        null, '创建评论', 29, date, date],
    [30, 28,   'read',   'blog_comment',        null, '查看评论', 30, date, date],
    [31, 28,   'update', 'blog_comment',        null, '修改评论', 31, date, date],
    [32, 28,   'delete', 'blog_comment',        null, '删除评论', 32, date, date],

    [33, null, 'manage', 'user',                null, '用户管理', 33, date, date],
    [34, 33,   'create', 'user',                null, '创建用户', 34, date, date],
    [35, 33,   'read',   'user',                null, '查看用户', 35, date, date],
    [36, 33,   'update', 'user',                null, '修改用户', 36, date, date],
    [37, 33,   'delete', 'user',                null, '删除用户', 37, date, date],
 
    [38, null, 'manage', 'dashboard',           null, '仪表板',  38, date, date],
    [39, 38,   'read',   'analysis',            null, '分析页',  39, date, date],
    [40, 38,   'read',   'workspace',           null, '工作台',  40, date, date],

    [41, null, 'manage', 'system',              null, '系统管理',  41, date, date],
    [42, 41,   'manage', 'system_enum',         null, '枚举管理',  42, date, date],
    [43, 42,   'create', 'system_enum',         null, '创建枚举',  43, date, date],
    [44, 42,   'read',   'system_enum',         null, '查看枚举',  44, date, date],
    [45, 42,   'update', 'system_enum',         null, '修改枚举',  45, date, date],
    [46, 42,   'delete', 'system_enum',         null, '删除枚举',  46, date, date],
    [47, 41,   'manage', 'system_enum_item',    null, '枚举项管理', 47, date, date],
    [48, 47,   'create', 'system_enum_item',    null, '创建枚举项', 48, date, date],
    [49, 47,   'read',   'system_enum_item',    null, '查看枚举项', 49, date, date],
    [50, 47,   'update', 'system_enum_item',    null, '修改枚举项', 50, date, date],
    [51, 47,   'delete', 'system_enum_item',    null, '删除枚举项', 51, date, date],
    [52, 41,   'manage', 'system_config',       null, '配置管理',   52, date, date],
    [53, 52,   'create', 'system_config',       null, '创建配置',   53, date, date],
    [54, 52,   'read',   'system_config',       null, '查看配置',   54, date, date],
    [55, 52,   'update', 'system_config',       null, '修改配置',   55, date, date],
    [56, 52,   'delete', 'system_config',       null, '删除配置',   56, date, date],
    [57, 41,   'manage', 'system_config_group', null, '配置组管理', 57, date, date],
    [58, 57,   'create', 'system_config_group', null, '创建配置组', 58, date, date],
    [59, 57,   'read',   'system_config_group', null, '查看配置组', 59, date, date],
    [60, 57,   'update', 'system_config_group', null, '修改配置组', 60, date, date],
    [61, 57,   'delete', 'system_config_group', null, '删除配置组', 61, date, date],
  ]

  await db.permissions.bulkAdd(
    permissions.map<any>((item) => {
      const fields = schema.permissions.slice(2).split(/, */);
      return fillObject(fields, item);
    }),
  );

  // roles
  // prettier-ignore
  const roles = [
    [1, '管理员', date, date],
    [2, '文章编辑', date, date],
  ];

  await db.roles.bulkAdd(
    roles.map<any>((item) => {
      const fields = schema.roles.slice(2).split(/, */);
      return fillObject(fields, item);
    }),
  );

  // admins
  // prettier-ignore
  const admins = [
    [1, 'admin', '123456', '管理员', assets[0].url, true, date, date],
    [2, 'editor', '123456', '文章编辑', assets[1].url, false, date, date],
  ];

  await db.admins.bulkAdd(
    admins.map<any>((item) => {
      const fields = schema.admins.slice(2).split(/, */);
      return fillObject(fields, item);
    }),
  );

  // adminRoles
  // prettier-ignore
  const adminRoles = [
    [1, 1, 1, date, date],
    [2, 2, 2, date, date],
  ];

  await db.adminRoles.bulkAdd(
    adminRoles.map<any>((item) => {
      const fields = schema.adminRoles.slice(2).split(/, */);
      return fillObject(fields, item);
    }),
  );

  // permissionRoles
  // prettier-ignore
  const permissionRoles = [
    [1, 2, 17, date, date],
    [2, 2, 18, date, date],
    [3, 2, 19, date, date],
    [4, 2, 20, date, date],
    [5, 2, 21, date, date],
    [6, 2, 22, date, date],
    [7, 2, 23, date, date],
    [8, 2, 24, date, date],
    [9, 2, 25, date, date],
    [10, 2, 26, date, date],
    [11, 2, 27, date, date],
    [12, 2, 28, date, date],
    [13, 2, 29, date, date],
    [14, 2, 30, date, date],
    [15, 2, 31, date, date],
    [16, 2, 32, date, date],
    [17, 2, 40, date, date],
  ];

  await db.permissionRoles.bulkAdd(
    permissionRoles.map<any>((item) => {
      const fields = schema.permissionRoles.slice(2).split(/, */);
      return fillObject(fields, item);
    }),
  );

  // users
  {
    const userCount = 200;
    const nicknames = mock.bulkNickname(userCount);
    const mobiles = mock.arrayUniqueBulk(userCount, () => mock.mobile());

    await db.users.bulkAdd(
      Array(userCount)
        .fill(0)
        .map((_, i) => {
          const id = i + 1;
          const gender = mock.gender();
          const birthday = new Date(mock.birthday() + ' 00:00:00');

          return {
            id,
            nickname: nicknames[i],
            mobile: mobiles[i],
            gender,
            name: mock.name(gender),
            birthday,
            constellation: mock.zodiacSign(birthday),
            height: gender === '女' ? mock.random(140, 180) : mock.random(155, 200),
            weight: gender === '女' ? mock.random(35, 60, 1) : mock.random(50, 90, 1),
            qualification: mock.qualification(),
            trait: mock.trait(),
            friendshipType: mock.friendshipType(),
            hobbies: mock.arrayUniqueBulk(mock.random(2, 4), () => mock.hobby()),
            signature: mock.signature(),
            avatar: assets[i].url,
            address: mock.address(),
            silent: 0,
            createdAt: new Date(date.getTime() - mock.random(0, 540) * 864e5),
            updatedAt: date,
          };
        }),
    );
  }

  // enum
  {
    // prettier-ignore
    const enums = [
      [1, 'group_size', '群规模', date, date],
      [2, 'marital', '婚姻状况', date, date ],
      [3, 'body_type', '体型', date, date ],
      [4, 'config_type', '配置类型', date, date ],
    ];

    await db.enums.bulkAdd(
      enums.map<any>((item) => {
        const fields = schema.enums.slice(2).split(/, */);
        return fillObject(fields, item);
      }),
    );

    // prettier-ignore
    const enumItems = [
      [1, 1, '50人以下', '1', date, date],
      [2, 1, '50-200人', '2', date, date],
      [3, 1, '200-500人', '3', date, date],
      [4, 1, '500-2000人', '4', date, date],
      [5, 1, '2000-5000人', '5', date, date],
      [6, 1, '5000人以上', '6', date, date],

      [7, 2, '未婚', '1', date, date],
      [8, 2, '已婚', '2', date, date],
      [9, 2, '离异', '3', date, date],
      [10, 2, '丧偶', '4', date, date],

      [11, 3, '匀称', '1', date, date],
      [12, 3, '苗条', '2', date, date],
      [13, 3, '健壮', '3', date, date],
      [14, 3, '略胖', '4', date, date],
      [15, 3, '丰满', '5', date, date],
      [16, 3, '瘦小', '6', date, date],
      [17, 3, '高瘦', '7', date, date],

      [18, 4, '文本', 'text', date, date],
      [19, 4, '多行文本', 'textarea', date, date],
      [20, 4, '数字', 'number', date, date],
      [21, 4, '布尔(Y/N)', 'bool', date, date],
      [22, 4, '图片', 'image', date, date],
      [23, 4, '图册', 'album', date, date],
    ];

    await db.enumItems.bulkAdd(
      enumItems.map<any>((item) => {
        const fields = schema.enumItems.slice(2).split(/, */);
        return fillObject(fields, item);
      }),
    );
  }

  // config
  {
    // prettier-ignore
    const configGroups = [
      [1, '站点设置', date, date],
      [2, '会员设置', date, date ],
      [3, '互动设置', date, date ],
    ];

    await db.configGroups.bulkAdd(
      configGroups.map<any>((item) => {
        const fields = schema.configGroups.slice(2).split(/, */);
        return fillObject(fields, item);
      }),
    );

    // prettier-ignore
    const configs = [
      [1, 1, 'text',      '站点根网址', 'https://cosey.wzt.zone', 'basehost', date, date],
      [2, 1, 'image',     '网站logo', assets[0].url, 'logo', date, date],
      [3, 1, 'text',      '网页主页链接', '/', 'indexurl', date, date],
      [4, 1, 'text',      '主页链接名', '主页', 'indexname', date, date],
      [5, 1, 'text',      '网站名称', 'Cosey 管理后台', 'webname', date, date],
      [6, 1, 'text',      '文档HTML默认保存路径', '/a', 'arcdir', date, date],
      [7, 1, 'text',      '图片/上传文件默认路径', '/uploads', 'medias_dir', date, date],
      [8, 1, 'bool',      '编辑器(是/否)使用XHTML', false, 'fck_xhtml', date, date],
      [9, 1, 'text',      '模板默认风格', 'default', 'df_style', date, date],
      [10, 1, 'textarea', '网站版权信息', 'Copyright 2025 cosey.wzt.zone 版权所有', 'df_style', date, date],
      [11, 1, 'text',     '咨询热线', '400-xxx-xxxx', 'tel', date, date],
      [12, 1, 'text',     '公司传真', '010-12345678', 'cz', date, date],
      [13, 1, 'text',     'Email邮箱', 'cosey@wzt.zone', 'email', date, date],
      [14, 1, 'text',     '公司地址', '北京市朝阳区虚拟大厦 88 号 1001 室', 'address', date, date],

      [15, 2, 'bool',     '是否开启会员功能', false, 'mb_open', date, date],
      [16, 2, 'bool',     '是否开启会员图集功能', false, 'mb_album', date, date],
      [17, 2, 'bool',     '是否允许会员上传非图片附件', false, 'mb_upload', date, date],
      [18, 2, 'number',   '会员上传文件大小(K)', 1024, 'mb_upload_size', date, date],
      [19, 2, 'bool',     '是否开放会员对自定义模型投稿', true, 'mb_sendall', date, date],
      [20, 2, 'bool',     '是否把会员指定的远程文档下载到本地', true, 'mb_rmdown', date, date],

      [21, 3, 'textarea', '禁用词语（系统将直接停止用户动作）用|分开，但不要在结尾加|', '非典|艾滋病|阳痿', 'notallowstr', date, date],
      [22, 3, 'textarea', '替换词语（词语会被替换成***）用|分开，但不要在结尾加|', '她妈|它妈|他妈|你妈|去死|贱人', 'replacestr', date, date],
      [23, 3, 'bool',     '评论及留言(是/否)需审核', false, 'feedbackcheck', date, date],
      [24, 3, 'bool',     '评论加验证码重确认', true, 'feedback_ck', date, date],
    ];

    await db.configs.bulkAdd(
      configs.map<any>((item) => {
        const fields = schema.configs.slice(2).split(/, */);
        return fillObject(fields, item);
      }),
    );
  }

  // post
  {
    const postTypeCount = 3;
    const postTypes = Array(postTypeCount)
      .fill(0)
      .map((_, i) => {
        return [i + 1, null, mock.word(2, 6), mock.paragraph(10, 20), date, date];
      });

    await db.postTypes.bulkAdd(
      postTypes.map<any>((item) => {
        const fields = schema.postTypes.slice(2).split(/, */);
        return fillObject(fields, item);
      }),
    );

    const postCount = postTypeCount * 10;

    const posts = Array(postCount)
      .fill(0)
      .map((_, i) => {
        return [
          i + 1,
          (i % postTypeCount) + 1,
          mock.word(10, 20),
          mock.paragraphs(3, 5),
          mock.paragraph(10, 20),
          '',
          2,
          date,
          2,
          date,
          date,
          2,
          date,
          null,
          null,
        ];
      });

    await db.posts.bulkAdd(
      posts.map<any>((item) => {
        const fields = schema.posts.slice(2).split(/, */);
        return fillObject(fields, item);
      }),
    );

    const postComments = Array(postCount)
      .fill(0)
      .map((_, i) => {
        const id = i + 1;
        const postId = i + 1;
        // prettier-ignore
        return [
          [ id, 1, null, postId, mock.paragraph(10, 20), date, date, null],
          [ id + postCount, 1, id, postId, mock.paragraph(10, 20), date, date, null],
        ];
      })
      .flat(1);

    await db.postComments.bulkAdd(
      postComments.map<any>((item) => {
        const fields = schema.postComments.slice(2).split(/, */);
        return fillObject(fields, item);
      }),
    );
  }
}
