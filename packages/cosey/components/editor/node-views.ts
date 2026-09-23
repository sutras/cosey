import { inject, ref } from 'vue';

import { localeContextKey } from '../../hooks';
import { injectUploadConfig, uploadContextKey } from '../../config/upload';
import ContentImage from './contents/content-image';
import ContentVideo from './contents/content-video';
import ContentFormula from './contents/content-formula';
import ContentCodeBlock from './contents/content-code-block';
import ContentTable from './contents/content-table';
import { editorContextKey } from './pm/context';
import { vueNodeView, type NodeViewProvides } from './pm/node-view';
import type { EditorFacade } from './pm/editor';

/**
 * 组装 ProseMirror 的 nodeView 注册表（节点名 → Vue 组件）。
 *
 * Vue 组件形式的 nodeView 渲染在组件树之外，注入链是断的，所以要把祖先级的
 * context 重新 provide 一遍：编辑器实例（`facade`）、语言、上传配置。
 *
 * **必须在 `setup` 里同步调用**（内部用了 `inject`），且要在 `EditorView` 创建之前
 * —— nodeView 构造函数是 `new EditorView` 的入参。
 */
export function useEditorNodeViews(facade: EditorFacade) {
  const provides: NodeViewProvides = [
    [editorContextKey, facade],
    [localeContextKey, inject(localeContextKey, ref())],
    [uploadContextKey, injectUploadConfig()],
  ];

  return {
    image: vueNodeView(ContentImage, provides),
    video: vueNodeView(ContentVideo, provides),
    formula: vueNodeView(ContentFormula, provides),
    code_block: vueNodeView(ContentCodeBlock, provides),
    table: vueNodeView(ContentTable, provides),
  };
}
