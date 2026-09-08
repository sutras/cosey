<template>
  <div v-if="httpMessageManager">
    <el-button link size="large" @click="open = !open">
      <Icon name="bi bi-wifi" size="xl" />
    </el-button>

    <el-drawer
      v-model="open"
      size="720px"
      :title="t('httpMessage.message')"
      append-to-body
      :header-class="bem.e('header')"
      :class="bem.b()"
    >
      <template #header>
        <el-button-group>
          <el-button text bg @click="httpMessageManager.clearHttpMessage()">
            {{ t('httpMessage.clear') }}
          </el-button>
        </el-button-group>
      </template>

      <el-empty v-if="httpMessageList.length === 0" :description="t('httpMessage.noRequest')" />
      <el-tabs v-else tab-position="left" :class="bem.e('tabs')">
        <el-tab-pane v-for="(message, i) in httpMessageList" :key="i" :class="bem.e('tab-pane')">
          <template #label>
            <div :class="bem.e('tab-label')">
              {{ message.name }}
            </div>
          </template>
          <el-tabs :class="bem.e('right-tabs')">
            <div :class="bem.e('right-tabs-wrapper')">
              <el-tab-pane :label="t('httpMessage.headers')">
                <el-descriptions
                  :column="1"
                  label-width="160px"
                  border
                  :title="t('httpMessage.general')"
                  size="small"
                  :style="{ marginBlockEnd: getCssVar('margin-lg') }"
                >
                  <el-descriptions-item :label="t('httpMessage.requestUrl')">
                    <div style="word-break: break-all">
                      {{ message.normal?.url }}
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item :label="t('httpMessage.requestMethod')">
                    {{ message.normal?.method }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="message.normal?.status"
                    :label="t('httpMessage.statusCode')"
                  >
                    <span>{{ message.normal?.status.code }}</span>
                    <span>{{ message.normal?.status.text }}</span>
                  </el-descriptions-item>
                </el-descriptions>
                <el-descriptions
                  v-if="message.res"
                  :column="1"
                  label-width="160px"
                  border
                  :title="t('httpMessage.responseHeaders')"
                  size="small"
                  :style="{ marginBlockEnd: getCssVar('margin-lg') }"
                >
                  <el-descriptions-item
                    v-for="item in message.res.headers"
                    :key="item[0]"
                    :label="item[0]"
                  >
                    <div style="word-break: break-all">
                      {{ item[1] }}
                    </div>
                  </el-descriptions-item>
                </el-descriptions>
                <el-descriptions
                  :column="1"
                  label-width="160px"
                  border
                  :title="t('httpMessage.requestHeaders')"
                  size="small"
                >
                  <el-descriptions-item
                    v-for="item in message.req?.headers"
                    :key="item[0]"
                    :label="item[0]"
                  >
                    <div style="word-break: break-all">
                      {{ item[1] }}
                    </div>
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
              <el-tab-pane
                v-if="message.payload.searchParams?.length || message.payload.body"
                :label="t('httpMessage.payload')"
              >
                <el-descriptions
                  v-if="message.payload.searchParams?.length"
                  :column="1"
                  label-width="160px"
                  border
                  :title="t('httpMessage.queryStringParameters')"
                  size="small"
                >
                  <el-descriptions-item
                    v-for="item in message.payload.searchParams"
                    :key="item[0]"
                    :label="item[0]"
                  >
                    <div style="word-break: break-all">
                      {{ item[1] }}
                    </div>
                  </el-descriptions-item>
                </el-descriptions>
                <div v-if="message.payload.body">
                  <div
                    :style="{
                      marginBlockEnd: getCssVar('margin-sm'),
                      fontWeight: 'bold',
                    }"
                  >
                    {{ t('httpMessage.requestPayload') }}
                  </div>
                  <HttpBodyPreview :type="message.payload.type" :body="message.payload.body" />
                </div>
              </el-tab-pane>
              <el-tab-pane :label="t('httpMessage.preview')">
                <HttpBodyPreview
                  v-if="message.res"
                  :type="message.res.type"
                  :body="message.res.body"
                />
              </el-tab-pane>
              <!-- <el-tab-pane :label="t('httpMessage.response')">
                {{ message.res?.body }}
              </el-tab-pane> -->
            </div>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script lang="tsx" setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { ElButton } from 'element-plus';
import { Icon } from 'cosey/components';
import { getCssVar } from 'cosey/utils';
import { createBem } from 'cosey/utils';
import HttpBodyPreview from './http-body-preview.vue';

import { type HttpMessage, HttpMessageManager } from '@cosey/mock';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineOptions({
  name: 'LayoutHttpMessage',
});

const bem = createBem('layout-http-message');

const httpMessageManager = inject<HttpMessageManager | null>('mockContext', null);

const httpMessageList = ref<HttpMessage[]>([]);

const onChange = (event: any) => {
  httpMessageList.value = event.detail;
};

onMounted(() => {
  if (httpMessageManager) {
    httpMessageManager.addEventListener('change', onChange);
  }
});

onUnmounted(() => {
  if (httpMessageManager) {
    httpMessageManager.removeEventListener('change', onChange);
  }
});

const open = ref(false);
</script>
