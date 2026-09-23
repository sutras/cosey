/**
 * 上传文件的临时缓存。
 *
 * 「插入图片/视频」走两条路：已经有 URL 的直接用 URL；本地文件先给一个 `file:` 开头的
 * 临时 id 写进节点属性，同时把 `File` 存进这张表。node view 渲染时按 id 取回 `File`，
 * 交给上传组件做本地预览与上传，上传完成后即可释放。
 */
const uploadFiles = new Map<string, File>();

export function setUploadFile(id: string, file: File) {
  uploadFiles.set(id, file);
}

export function getUploadFile(id: string): File | undefined {
  return uploadFiles.get(id);
}

export function clearUploadFile(id: string) {
  uploadFiles.delete(id);
}
