<template>
  <co-container :title="t('user.detail')" :loading="isFetching" back sticky>
    <template #actions>
      <el-button v-if="can('update', 'user')" type="primary" @click="onEdit">
        {{ t('common.edit') }}
      </el-button>
    </template>

    <co-async :loading="isFetching" :error="error">
      <div class="detail">
        <co-card>
          <div class="hero">
            <el-avatar :size="64" :src="user?.avatar" class="hero-avatar">
              <co-icon name="bi bi-person" />
            </el-avatar>

            <div class="hero-main">
              <div class="hero-title">
                <span class="hero-name">{{ user?.nickname || '-' }}</span>
                <el-tag v-if="user?.gender" size="small" effect="plain" round>
                  {{ user.gender }}
                </el-tag>
                <el-tag v-if="user?.constellation" size="small" effect="plain" round>
                  {{ user.constellation }}
                </el-tag>
                <el-tag v-if="user?.qualification" size="small" effect="plain" round>
                  {{ user.qualification }}
                </el-tag>
              </div>

              <div class="hero-signature">{{ user?.signature || '-' }}</div>

              <div class="hero-meta">
                <span>ID {{ user?.id }}</span>
                <span>
                  {{ t('common.creationTime') }} {{ fmt(user?.createdAt, 'YYYY-MM-DD HH:mm') }}
                </span>
                <span>
                  {{ t('common.updateTime') }} {{ fmt(user?.updatedAt, 'YYYY-MM-DD HH:mm') }}
                </span>
              </div>
            </div>
          </div>
        </co-card>

        <co-row :gutter="16" class="gap-y-4">
          <co-col v-for="group in groups" :key="group.title" :span="12" :xs="24" :sm="24" :md="12">
            <co-card :title="group.title" class="stretch">
              <co-descriptions :items="group.items" :column="infoColumn" />
            </co-card>
          </co-col>
        </co-row>

        <co-card :title="t('user.social')">
          <co-descriptions :items="socialItems" :column="infoColumn" />
        </co-card>

        <co-card :title="t('user.recentComments')">
          <template #extra>{{ t('user.commentCount', { count: commentTotal }) }}</template>

          <div v-if="comments.length" class="comment-list">
            <div v-for="item in comments" :key="item.id" class="comment">
              <span class="comment-post">{{ item.post?.title || '-' }}</span>
              <span class="comment-content">{{ item.content }}</span>
              <span class="comment-time">{{ fmt(item.createdAt, 'YYYY-MM-DD HH:mm') }}</span>
            </div>
          </div>
          <div v-else class="comment-empty">{{ t('co.common.noData') }}</div>
        </co-card>
      </div>
    </co-async>

    <UserUpsert :ref="upsert.ref" />
  </co-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import type { DescriptionsItemData } from 'cosey/components';
import { useFetch, useOuterUpsert, useWindowResize } from 'cosey/hooks';
import usersApi from '@/api/users';
import postsApi from '@/api/blog';
import UserUpsert from './user-upsert.vue';

defineOptions({
  name: 'UserDetail',
});

const { t } = useI18n();
const route = useRoute();
const { can } = useAbility();

const { getUser } = usersApi;
const { getPostComments } = postsApi;

/**
 * 当前详情页的用户 id；不是整数时视为无效，免得拼出 `/users/NaN`。
 * 页面按 `route.path` 作 key（见 layout-main），换 id 会重新挂载，
 * 用挂载时的 id 拉数据即可——监听参数反而会在离开本页时拿空参数补一轮请求。
 */
const userId = computed(() => {
  const id = Number(route.params.id);

  return Number.isInteger(id) ? id : undefined;
});

const { isFetching, data, error, execute } = useFetch(() =>
  userId.value === undefined ? undefined : getUser(userId.value),
);

const user = computed(() => data.value as any);

// 窄屏一列放不下两个字段（手机号会被折断），断成单列
const viewportWidth = ref(window.innerWidth);
useWindowResize(() => {
  viewportWidth.value = window.innerWidth;
});
const infoColumn = computed(() => (viewportWidth.value < 768 ? 1 : 2));

const fmt = (value: string | undefined, template: string) =>
  value ? dayjs(value).format(template) : '-';

/** 一条信息：数组用顿号连起来，空值显示 - */
const desc = (label: string, raw: unknown): DescriptionsItemData => {
  const value = Array.isArray(raw) ? raw.join('、') : raw;

  return {
    label,
    content:
      value === undefined || value === null || value === '' ? '-' : (value as string | number),
  };
};

const groups = computed(() => {
  const item = user.value || {};

  return [
    {
      title: t('user.profile'),
      items: [
        desc(t('user.name'), item.name),
        desc(t('user.gender'), item.gender),
        desc(t('user.birthday'), fmt(item.birthday, 'YYYY-MM-DD')),
        desc(t('user.zodiac'), item.constellation),
      ],
    },
    {
      title: t('user.other'),
      items: [
        desc(t('user.height'), item.height),
        desc(t('user.weight'), item.weight),
        desc(t('user.phone'), item.mobile),
        desc(t('user.education'), item.qualification),
      ],
    },
  ];
});

const socialItems = computed(() => {
  const item = user.value || {};

  return [
    desc(t('user.traits'), item.trait),
    desc(t('user.datingType'), item.friendshipType),
    desc(t('user.hobbies'), item.hobbies),
    desc(t('user.address'), item.address),
  ];
});

const comments = ref<any[]>([]);
const commentTotal = ref(0);

const loadComments = async (id: number) => {
  try {
    const res = await getPostComments({ userId: id });
    const list = res?.list ?? [];
    commentTotal.value = res?.total ?? list.length;
    comments.value = list.slice(0, 5);
  } catch {
    comments.value = [];
    commentTotal.value = 0;
  }
};

onMounted(() => {
  if (userId.value !== undefined) {
    loadComments(userId.value);
  }
});

const upsert = useOuterUpsert({
  success() {
    execute();
  },
});

const onEdit = () => {
  upsert.edit(user.value);
};
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stretch {
  height: 100%;
}

.hero {
  display: flex;
  gap: 16px;
}

.hero-avatar {
  flex: none;
}

.hero-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.hero-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.hero-signature {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.hero-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-tertiary);
}

.comment-list {
  display: flex;
  flex-direction: column;
}

.comment {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 130px;
  gap: 12px;
  align-items: baseline;
  padding-block: 7px;
  font-size: 13px;
}

.comment + .comment {
  border-block-start: 1px solid var(--el-border-color-lighter);
}

.comment-post {
  overflow: hidden;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-content {
  overflow: hidden;
  color: var(--el-text-color-regular);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-time {
  font-size: 12px;
  color: var(--el-text-color-tertiary);
  text-align: right;
}

.comment-empty {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .comment {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 2px 12px;
    align-items: start;
    padding-block: 8px;
  }

  .comment-post {
    grid-area: 1 / 1 / 2 / 2;
  }

  .comment-time {
    grid-area: 1 / 2 / 2 / 3;
  }

  .comment-content {
    grid-area: 2 / 1 / 3 / 3;
    white-space: normal;
  }
}
</style>
