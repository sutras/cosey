import { TextSelection } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import { isImageUrl } from '../../../utils';
import type { EditorFacade } from '../pm/editor';

/** 从 FileList 里挑出图片文件 */
function pickImageFiles(files: FileList | null | undefined): File[] {
  return Array.from(files || []).filter((file) => file.type.startsWith('image/'));
}

/**
 * 图片的粘贴与拖拽落点策略，供 `EditorView` 的 `handlePaste` / `handleDrop` 使用。
 *
 * 两处共用同一套判断：**只接管图片**（剪贴板里的图片文件、或纯文本形式的图片地址），
 * 其余一律返回 `false` 交回 ProseMirror 的默认行为。`features` 没开图片功能时也不接管
 * —— 此时图片地址会按普通文本粘进来，与「未启用的功能不该有副作用」保持一致。
 */
export function useImageDrop(facade: EditorFacade) {
  const handlePaste = (_view: EditorView, event: ClipboardEvent): boolean => {
    const data = event.clipboardData;
    if (!data || !facade.hasTool('image')) return false;

    const imageFiles = pickImageFiles(data.files);
    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => facade.insertImage('', file));
      return true;
    }

    const text = data.getData('text/plain');
    if (isImageUrl(text)) {
      facade.insertImage(text);
      return true;
    }

    return false;
  };

  const handleDrop = (view: EditorView, event: DragEvent): boolean => {
    const imageFiles = pickImageFiles(event.dataTransfer?.files);
    if (imageFiles.length === 0 || !facade.hasTool('image')) return false;

    // 先把光标挪到鼠标落点，否则图片会插在拖拽前的选区处
    const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
    if (coords) {
      view.dispatch(
        view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(coords.pos))),
      );
    }

    imageFiles.forEach((file) => facade.insertImage('', file));
    return true;
  };

  return { handlePaste, handleDrop };
}
