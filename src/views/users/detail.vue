<template>
  <co-container title="用户详情" :loading="isFetching" back sticky>
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

        <co-row :gutter="16">
          <co-col v-for="group in groups" :key="group.title" :span="12" :xs="24" :sm="24" :md="12">
            <co-card :title="group.title" class="stretch">
              <div v-for="(row, i) in group.rows" :key="i" class="row">
                <template v-for="(field, j) in row" :key="j">
                  <span class="label">{{ field.label }}</span>
                  <span class="value">{{ field.value ?? '-' }}</span>
                </template>
              </div>
            </co-card>
          </co-col>
        </co-row>

        <co-card :title="t('user.social')">
          <div v-for="(row, i) in socialRows" :key="i" class="row">
            <template v-for="(field, j) in row" :key="j">
              <span class="label">{{ field.label }}</span>
              <span class="value">{{ field.value ?? '-' }}</span>
            </template>
          </div>
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
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAbility } from '@casl/vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { chunk } from 'lodash-es';
import { useFetch, useOuterUpsert } from 'cosey/hooks';
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

const { isFetching, data, error, execute } = useFetch(() => getUser(Number(route.params.id)));

watch(
  () => route.params.id,
  () => {
    execute();
  },
);

const user = computed(() => data.value as any);

const fmt = (value: string | undefined, template: string) =>
  value ? dayjs(value).format(template) : '-';

const field = (label: string, value: unknown) => ({
  label,
  value: Array.isArray(value) ? value.join('、') : value,
});

const groups = computed(() => {
  const item = user.value || {};

  return [
    {
      title: t('user.profile'),
      rows: chunk(
        [
          field(t('user.name'), item.name),
          field(t('user.gender'), item.gender),
          field(t('user.birthday'), fmt(item.birthday, 'YYYY-MM-DD')),
          field(t('user.zodiac'), item.constellation),
        ],
        2,
      ),
    },
    {
      title: t('user.other'),
      rows: chunk(
        [
          field(t('user.height'), item.height),
          field(t('user.weight'), item.weight),
          field(t('user.phone'), item.mobile),
          field(t('user.education'), item.qualification),
        ],
        2,
      ),
    },
  ];
});

const socialRows = computed(() => {
  const item = user.value || {};

  return chunk(
    [
      field(t('user.traits'), item.trait),
      field(t('user.datingType'), item.friendshipType),
      field(t('user.hobbies'), item.hobbies),
      field(t('user.address'), item.address),
    ],
    2,
  );
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

watch(
  () => route.params.id,
  (id) => {
    if (id) {
      loadComments(Number(id));
    }
  },
  { immediate: true },
);

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

.row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 64px minmax(0, 1fr);
  gap: 10px 12px;
  padding-block: 4px;
}

@media (max-width: 768px) {
  .row {
    grid-template-columns: 64px minmax(0, 1fr);
  }
}

.label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.value {
  min-width: 0;
  font-size: 13px;
  color: var(--el-text-color-primary);
  overflow-wrap: break-word;
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
