import { getAvatarBase64 } from '../../utils/crypto';
import { DB } from '../types';
import * as mock from '@gunny/mock';
import CryptoJS from 'crypto-js';
import { schema } from '..';
import {
  momentCorpus,
  momentFallback,
  postComments as articleComments,
  postParagraphs,
  postTypeCorpus,
} from './corpus';

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

    [62, null, 'manage', 'product',              null, '商品管理',  62, date, date],
    [63, 62,   'create', 'product',              null, '创建商品',  63, date, date],
    [64, 62,   'read',   'product',              null, '查看商品',  64, date, date],
    [65, 62,   'update', 'product',              null, '修改商品',  65, date, date],
    [66, 62,   'delete', 'product',              null, '删除商品',  66, date, date],
    [67, 62,   'manage', 'product_category',     null, '商品分类',  67, date, date],
    [68, 67,   'create', 'product_category',     null, '创建商品分类', 68, date, date],
    [69, 67,   'read',   'product_category',     null, '查看商品分类', 69, date, date],
    [70, 67,   'update', 'product_category',     null, '修改商品分类', 70, date, date],
    [71, 67,   'delete', 'product_category',     null, '删除商品分类', 71, date, date],
  ]

  await db.permissions.bulkAdd(
    permissions.map<any>((item) => {
      const fields = schema.permissions.slice(2).split(/, */);
      return fillObject(fields, item);
    }),
  );

  await seedSocialPermissions(db);

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
    const postTypes = postTypeCorpus.map((item, i) => {
      return [i + 1, null, item.name, item.description, date, date];
    });

    await db.postTypes.bulkAdd(
      postTypes.map<any>((item) => {
        const fields = schema.postTypes.slice(2).split(/, */);
        return fillObject(fields, item);
      }),
    );

    const postCount = postTypeCorpus.length * 10;

    const posts = Array(postCount)
      .fill(0)
      .map((_, i) => {
        const typeIndex = i % postTypeCorpus.length;
        const corpus = postTypeCorpus[typeIndex];
        const titleIndex = Math.floor(i / postTypeCorpus.length) % corpus.titles.length;
        const title = corpus.titles[titleIndex];

        const content = Array.from(
          { length: 4 },
          (_, k) => postParagraphs[(i * 4 + k) % postParagraphs.length],
        ).join('\n\n');

        return [
          i + 1,
          typeIndex + 1,
          title,
          content,
          corpus.digests[titleIndex % corpus.digests.length],
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
        const content = articleComments[i % articleComments.length];
        const reply = articleComments[(i * 3 + 5) % articleComments.length];
        // prettier-ignore
        return [
          [ id, 1, null, postId, content, date, date, null],
          [ id + postCount, 1, id, postId, reply, date, date, null],
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

  await seedProducts(db);
  await seedSocial(db);
}

interface CatalogGroup {
  name: string;
  description: string;
  brands: string[];
  items: string[];
  specs: string[];
  unit: string;
  basePrice: number;
}

// prettier-ignore
const productCatalog: CatalogGroup[] = [
  {
    name: '饮用水',
    description: '瓶装水、气泡水与矿泉水',
    brands: ['农夫山泉', '怡宝'],
    items: ['天然饮用水', '苏打气泡水', '饮用矿泉水'],
    specs: ['350ml×24', '550ml×24', '1.5L×12'],
    unit: '箱',
    basePrice: 36,
  },
  {
    name: '乳制品',
    description: '常温奶、低温奶与酸奶',
    brands: ['伊利', '蒙牛'],
    items: ['纯牛奶', '低脂酸奶', '儿童成长奶'],
    specs: ['200ml×12', '250ml×16', '1L×6'],
    unit: '箱',
    basePrice: 59,
  },
  {
    name: '休闲零食',
    description: '坚果、烘焙与膨化食品',
    brands: ['三只松鼠', '良品铺子'],
    items: ['每日坚果', '手撕面包', '原味薯片'],
    specs: ['500g', '750g', '1kg'],
    unit: '袋',
    basePrice: 29,
  },
  {
    name: '粮油调味',
    description: '食用油、酱油与米面',
    brands: ['金龙鱼', '海天'],
    items: ['一级压榨花生油', '特级金标生抽', '五常长粒香米'],
    specs: ['1.8L', '500ml', '5kg'],
    unit: '件',
    basePrice: 45,
  },
  {
    name: '个护清洁',
    description: '洗护、纸品与家清用品',
    brands: ['立白', '舒肤佳'],
    items: ['深层洁净洗衣液', '纯白清香沐浴露', '原木抽纸'],
    specs: ['3kg', '750ml', '24包'],
    unit: '件',
    basePrice: 39,
  },
  {
    name: '家用电器',
    description: '厨房小家电与生活电器',
    brands: ['美的', '苏泊尔'],
    items: ['电热水壶', '超薄电磁炉', '高速破壁机'],
    specs: ['1.7L', '2200W', '1.5L'],
    unit: '台',
    basePrice: 199,
  },
];

/**
 * 商品分类与商品
 */
export async function seedProducts(db: DB) {
  const date = new Date();
  const assets = await db.assets.toArray();

  const categories = productCatalog.map((group, index) => {
    const id = index + 1;

    return {
      id,
      name: group.name,
      description: group.description,
      sort: id,
      createdAt: date,
      updatedAt: date,
    };
  });

  await db.productCategories.bulkPut(categories);

  const products = productCatalog
    .flatMap((group, groupIndex) => {
      const categoryId = groupIndex + 1;

      return group.brands.flatMap((brand) =>
        group.items.flatMap((item) =>
          group.specs.map((spec, specIndex) => ({
            categoryId,
            name: `${brand} ${item} ${spec}`,
            spec,
            price: Number((group.basePrice * (1 + specIndex * 0.4)).toFixed(2)),
            unit: group.unit,
            description: `${brand}${item}，${group.name}类商品，规格 ${spec}。`,
          })),
        ),
      );
    })
    .map((row, index) => {
      const id = index + 1;

      return {
        ...row,
        id,
        code: `SKU-${String(10000 + id)}`,
        stock: (id * 37) % 260,
        status: id % 11 === 0 ? 0 : 1,
        cover: assets[(id - 1) % assets.length]?.url ?? '',
        createdAt: new Date(date.getTime() - (id % 180) * 864e5),
        updatedAt: date,
      };
    });

  await db.products.bulkPut(products);
}

// prettier-ignore
const socialTopicCatalog: Array<[string, string]> = [
  ['日常碎片', '记录生活里的小确幸'],
  ['深夜emo', '情绪总需要一个出口'],
  ['开黑组队', '一起上分的都在这儿'],
  ['美食探店', '今天又吃了什么好东西'],
  ['旅行日记', '在路上才叫度假'],
  ['健身打卡', '今日份自律'],
  ['萌宠来袭', '猫猫狗狗的日常'],
  ['职场吐槽', '打工人的树洞'],
  ['影视安利', '最近在追什么'],
  ['情感树洞', '说出来就轻松了'],
  ['游戏攻略', '通关技巧与版本解读'],
  ['音乐现场', '分享最近循环的歌'],
];

// prettier-ignore
const socialMedalCatalog: Array<[string, string, string]> = [
  ['初来乍到', '首次登录', '完成首次登录即可获得'],
  ['社交新星', '发布 10 条动态', '累计发布 10 条动态解锁'],
  ['人气之星', '单条动态获赞 500', '任意一条动态点赞数达到 500'],
  ['一掷千金', '累计消费 10000 元', '平台累计消费满 10000 元'],
  ['公会栋梁', '担任公会会长', '创建或接管一个公会后获得'],
  ['守护天使', '送出 999 个礼物', '累计赠送礼物 999 个'],
  ['长情陪伴', '连续在线 30 天', '连续 30 天登录平台'],
  ['年度 MVP', '年度贡献榜前十', '年度贡献值进入前十名'],
];

// prettier-ignore
const socialPropCatalog: Array<[string, string, number, number]> = [
  ['星河头像框',   'avatar_frame', 680,  1000],
  ['樱花头像框',   'avatar_frame', 480,  1000],
  ['鎏金头像框',   'avatar_frame', 1280, 500],
  ['萌宠爪印',     'avatar_frame', 520,  800],
  ['气泡·云朵',    'chat_bubble',  380,  2000],
  ['气泡·霓虹',    'chat_bubble',  560,  1500],
  ['气泡·薄荷',    'chat_bubble',  420,  1200],
  ['入场·流星雨',  'entrance',     1880, 300],
  ['入场·星河战舰', 'entrance',    3880, 120],
  ['入场·彩虹桥',  'entrance',     980,  400],
  ['名片·极简白',  'card',         260,  5000],
  ['名片·暗夜黑',  'card',         320,  5000],
];

// prettier-ignore
const socialGiftCatalog: Array<[string, number, number]> = [
  ['小心心', 1, 1],
  ['棒棒糖', 6, 6],
  ['玫瑰', 18, 20],
  ['幸运星', 66, 80],
  ['独角兽', 520, 680],
  ['跑车', 1888, 2600],
  ['火箭', 5200, 8000],
  ['城堡', 13140, 20000],
];

const socialGuildNames = [
  '星河战队',
  '深夜食堂',
  '云端旅人',
  '零食补给站',
  '猫猫教',
  '早八人联盟',
  '荒野俱乐部',
  '次元裂缝',
  '日落电台',
  '凌晨四点',
];

// prettier-ignore
const socialVipCatalog: Array<[number, string, number, string]> = [
  [1, '青铜会员', 30,   '专属标识,每日签到翻倍,可创建 1 个公会'],
  [2, '白银会员', 88,   '专属标识,每日签到翻倍,聊天室置顶,可创建 2 个公会'],
  [3, '黄金会员', 168,  '专属头像框,每日签到 3 倍,聊天室置顶,可创建 3 个公会,赠送礼物 9 折'],
  [4, '铂金会员', 288,  '专属头像框,每日签到 3 倍,进入房间免排队,可创建 5 个公会,赠送礼物 85 折'],
  [5, '钻石会员', 588,  '专属座驾,每日签到 5 倍,进入房间免排队,可创建 8 个公会,赠送礼物 8 折'],
  [6, '星耀会员', 1288, '专属座驾与入场特效,每日签到 8 倍,专属客服,公会数量不限,赠送礼物 7 折'],
];

const financeTypes = ['recharge', 'consume', 'withdraw', 'reward'];

const financeRemarks: Record<string, string> = {
  recharge: '微信充值',
  consume: '购买礼物',
  withdraw: '提现到支付宝',
  reward: '收到打赏',
};

/**
 * 社交模块权限：父级「社交管理」+ 每个资源的 manage/create/read/update/delete
 *
 * 幂等：按父级 `social` 判断，已存在则跳过；老库升级时也只补一次。
 */
export async function seedSocialPermissions(db: DB) {
  const exist = await db.permissions.where('subject').equals('social').count();
  if (exist) {
    return;
  }

  const date = new Date();
  const fields = schema.permissions.slice(2).split(/, */);
  const all = await db.permissions.toArray();

  let id = all.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  let order = all.reduce((max, row) => Math.max(max, row.order ?? 0), 0) + 1;

  const rows: any[] = [];

  const rootId = id++;
  rows.push(
    fillObject(fields, [rootId, null, 'manage', 'social', null, '社交管理', order++, date, date]),
  );

  // prettier-ignore
  const groups: Array<[string, string]> = [
    ['social_topic',   '话题'],
    ['social_moment',  '动态'],
    ['social_medal',   '勋章'],
    ['social_prop',    '道具'],
    ['social_gift',    '礼物'],
    ['social_guild',   '公会'],
    ['social_finance', '财务'],
    ['social_vip',     '会员'],
  ];
  const actions: Array<[string, string]> = [
    ['create', '创建'],
    ['read', '查看'],
    ['update', '修改'],
    ['delete', '删除'],
  ];

  groups.forEach(([subject, label]) => {
    const manageId = id++;
    rows.push(
      fillObject(fields, [
        manageId,
        rootId,
        'manage',
        subject,
        null,
        `${label}管理`,
        order++,
        date,
        date,
      ]),
    );

    actions.forEach(([action, actionLabel]) => {
      rows.push(
        fillObject(fields, [
          id++,
          manageId,
          action,
          subject,
          null,
          `${actionLabel}${label}`,
          order++,
          date,
          date,
        ]),
      );
    });
  });

  await db.permissions.bulkAdd(rows);
}

/**
 * 社交：话题、动态、勋章、道具、礼物、公会、财务、会员
 */
export async function seedSocial(db: DB) {
  const date = new Date();
  const assets = await db.assets.toArray();
  const users = await db.users.toArray();

  const assetUrl = (index: number) => assets[index % assets.length]?.url ?? '';
  const userIds = users.map((row) => row.id);
  const pickUserId = (index: number) => userIds[index % userIds.length] ?? 1;
  const daysAgo = (days: number) => new Date(date.getTime() - days * 864e5);

  // 话题
  const topics = socialTopicCatalog.map(([name, description], index) => ({
    id: index + 1,
    name,
    description,
    cover: assetUrl(index),
    momentCount: 0,
    sort: index + 1,
    status: index === socialTopicCatalog.length - 1 ? 0 : 1,
    createdAt: daysAgo(mock.random(30, 360)),
    updatedAt: date,
  }));

  // 动态
  const momentTotal = 260;
  const activeTopicIds = topics.filter((row) => row.status === 1).map((row) => row.id);
  const topicNameById = new Map(topics.map((row) => [row.id, row.name]));

  const momentText = (topicId: number, index: number) => {
    const pool = momentCorpus[topicNameById.get(topicId) ?? ''] || momentFallback;
    return pool[index % pool.length];
  };

  const moments = Array(momentTotal)
    .fill(0)
    .map((_, index) => {
      const id = index + 1;
      const topicId = activeTopicIds[index % activeTopicIds.length];
      const imageCount = index % 6 === 0 ? 0 : (index % 4) + 1;

      return {
        id,
        userId: pickUserId(index * 7),
        topicId,
        content: momentText(topicId, index),
        images: Array.from({ length: imageCount }, (_, offset) => assetUrl(index * 3 + offset)),
        likeCount: mock.random(0, 1200),
        commentCount: mock.random(0, 180),
        status: index % 17 === 0 ? 0 : 1,
        createdAt: daysAgo(mock.random(0, 90)),
        updatedAt: date,
      };
    });

  const momentCounts = moments.reduce<Record<number, number>>((acc, row) => {
    acc[row.topicId] = (acc[row.topicId] ?? 0) + 1;
    return acc;
  }, {});

  await db.socialTopics.bulkPut(
    topics.map((row) => ({ ...row, momentCount: momentCounts[row.id] ?? 0 })),
  );
  await db.socialMoments.bulkPut(moments);

  // 勋章
  await db.socialMedals.bulkPut(
    socialMedalCatalog.map(([name, condition, description], index) => ({
      id: index + 1,
      name,
      icon: assetUrl(index + 20),
      description,
      condition,
      sort: index + 1,
      status: index === socialMedalCatalog.length - 1 ? 0 : 1,
      createdAt: daysAgo(mock.random(30, 200)),
      updatedAt: date,
    })),
  );

  // 道具
  await db.socialProps.bulkPut(
    socialPropCatalog.map(([name, category, price, stock], index) => ({
      id: index + 1,
      name,
      icon: assetUrl(index + 30),
      category,
      price,
      stock,
      description: `${name}，可用于个人主页装扮。`,
      status: index % 7 === 6 ? 0 : 1,
      createdAt: daysAgo(mock.random(10, 180)),
      updatedAt: date,
    })),
  );

  // 礼物
  await db.socialGifts.bulkPut(
    socialGiftCatalog.map(([name, price, charm], index) => ({
      id: index + 1,
      name,
      icon: assetUrl(index + 50),
      price,
      charm,
      description: `赠送「${name}」可增加 ${charm} 点好感值。`,
      status: index === socialGiftCatalog.length - 1 ? 0 : 1,
      createdAt: daysAgo(mock.random(10, 180)),
      updatedAt: date,
    })),
  );

  // 公会
  await db.socialGuilds.bulkPut(
    socialGuildNames.map((name, index) => ({
      id: index + 1,
      name,
      avatar: assetUrl(index + 60),
      ownerId: pickUserId(index * 11),
      memberCount: mock.random(8, 486),
      level: mock.random(1, 12),
      notice: `${name}：进群先看公告，禁止广告与人身攻击。`,
      status: index === socialGuildNames.length - 1 ? 0 : 1,
      createdAt: daysAgo(mock.random(20, 300)),
      updatedAt: date,
    })),
  );

  // 财务流水
  const financeTotal = 320;
  await db.socialFinances.bulkPut(
    Array(financeTotal)
      .fill(0)
      .map((_, index) => {
        const id = index + 1;
        const type = financeTypes[index % financeTypes.length];
        const positive = type === 'recharge' || type === 'reward';
        const gross = mock.random(1, type === 'reward' ? 520 : 3000);

        return {
          id,
          userId: pickUserId(index * 13),
          type,
          amount: positive ? gross : -gross,
          balance: mock.random(0, 20000),
          status: index % 13 === 0 ? 'pending' : index % 29 === 0 ? 'failed' : 'success',
          remark: financeRemarks[type],
          createdAt: daysAgo(mock.random(0, 60)),
          updatedAt: date,
        };
      }),
  );

  // 会员等级
  await db.socialVips.bulkPut(
    socialVipCatalog.map(([level, name, price, benefits], index) => ({
      id: index + 1,
      level,
      name,
      icon: assetUrl(index + 70),
      price,
      duration: 30,
      benefits,
      status: index === socialVipCatalog.length - 1 ? 0 : 1,
      createdAt: date,
      updatedAt: date,
    })),
  );
}
