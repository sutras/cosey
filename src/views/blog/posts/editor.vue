<template>
  <co-container
    full-page
    scrollable
    :title="t('post.editArticle')"
    :description="description"
    :loading="isFetching"
    back="/blog/posts"
  >
    <template #actions>
      <el-button @click="onCancel">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="onSubmit">
        {{ t('common.save') }}
      </el-button>
    </template>

    <co-async :loading="isFetching" :error="error">
      <co-card>
        <co-form
          ref="formRef"
          :model="model"
          :rules="rules"
          label-width="auto"
          hide-buttons
          :submit="onSave"
        >
          <co-form-item
            v-model="model.postTypeId"
            prop="postTypeId"
            :label="t('post.category')"
            field-type="select"
            :field-props="{
              options: postTypes,
              props: { label: 'name', value: 'id' },
            }"
          />
          <co-form-item v-model="model.title" prop="title" :label="t('post.title')" />
          <co-form-item
            v-model="model.digest"
            prop="digest"
            :label="t('post.summary')"
            field-type="textarea"
            :field-props="{ rows: 2 }"
          />
          <co-form-item
            v-model="model.content"
            prop="content"
            :label="t('post.content')"
            field-type="editor"
            :field-props="{ height: '520px' }"
          />
        </co-form>
      </co-card>
    </co-async>
  </co-container>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { pick } from 'lodash-es';
import { useFetch } from 'cosey/hooks';
import postsApi from '@/api/blog';

defineOptions({
  name: 'BlogPostEditor',
});

interface Model {
  postTypeId?: number;
  title?: string;
  digest?: string;
  content?: string;
}

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const { getPost, getPosttypes, updatePost } = postsApi;

const postTypes = ref<{ id: number; name: string }[]>([]);
const saving = ref(false);
const formRef = useTemplateRef('formRef');

const model = reactive<Model>({
  postTypeId: undefined,
  title: undefined,
  digest: undefined,
  content: undefined,
});

const rules = {
  postTypeId: [{ required: true, message: t('post.category'), trigger: 'change' }],
  title: [{ required: true, message: t('post.title'), trigger: 'blur' }],
  digest: [{ required: true, message: t('post.summary'), trigger: 'blur' }],
  content: [{ required: true, message: t('post.content'), trigger: 'change' }],
};

const { isFetching, data, error } = useFetch(() => getPost(Number(route.params.id)), {
  onSuccess(post) {
    Object.assign(model, pick(post, ['postTypeId', 'title', 'digest', 'content']));
  },
});

const description = computed(() => {
  const post = data.value as any;

  return post?.updatedAt ? `${t('common.updateTime')} ${post.updatedAt}` : undefined;
});

getPosttypes().then((res) => {
  postTypes.value = res.list;
});

const onSave = async () => {
  saving.value = true;

  try {
    await updatePost(Number(route.params.id), model);
    ElMessage.success(t('common.operationSuccess'));
  } finally {
    saving.value = false;
  }
};

const onSubmit = () => {
  formRef.value?.submit?.();
};

const onCancel = () => {
  router.push('/blog/posts');
};
</script>
