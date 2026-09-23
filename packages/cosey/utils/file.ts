import { type AxiosResponse } from 'axios';
import { isFunction, isString } from './is';
import mime from 'mime';

let input: HTMLInputElement;

export interface ChooseFilesOptions {
  multiple?: boolean;
  accept?: string;
}

/**
 * 选择文件
 */
export function chooseFiles(options: ChooseFilesOptions = {}) {
  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.style.cssText = 'position: fixed; z-index: -10; opacity: 0; pointer-events: none';
  }

  input.multiple = !!options.multiple;
  input.setAttribute('accept', options.accept || '');

  return new Promise<File[]>((resolve) => {
    input.onchange = () => {
      const files = [...(input.files as unknown as File[])];
      resolve(files);
      input.value = '';
    };

    input.click();
  });
}

/**
 * 从 url 或 File 对象中推测文件 mime 主类型或特殊子类型，
 * 例如：image, video, audio, zip等
 */
export function getFileType(urlOrFile: string | File) {
  let url = '';

  if (isString(urlOrFile)) {
    url = urlOrFile;
  } else if (urlOrFile instanceof File) {
    if (urlOrFile.type) {
      const [cate, subCate] = urlOrFile.type.split('/');
      if (['zip'].includes(subCate)) {
        return subCate;
      }
      return cate;
    }
    url = urlOrFile.name;
  }

  const execArray = /^data:([^/]+)\/[^;]+;base64,/.exec(url);
  if (execArray) {
    return execArray[1];
  }

  const suffix = url.replace(/\?.*$/, '').match(/\.([a-zA-Z0-9]+)$/)?.[1] || '';
  if (/^(?:jpe?g|png|gif|webp|bmp|svg)$/i.test(suffix)) {
    return 'image';
  }
  if (/^(?:avi|wmv|mpg|mpeg|mov|rm|ram|swf|flv|mp4|webm|ogm)$/i.test(suffix)) {
    return 'video';
  }
  if (/^(?:mp3|wav|mid|aif|aiff|wma|ra|vqf|m4a|aac|midi|ogg|au|voc)$/i.test(suffix)) {
    return 'audio';
  }
  return suffix;
}

/**
 * 把文件读取为 dataURL
 */
export function readAsDataURL(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 把文件读取为 ArrayBuffer
 */
export function readAsArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 根据提供的 url 下载文件
 */
export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 下载 Blob 文件
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}

/**
 * 根据内容和mime类型生成 Blob
 */
export function createBlob(content: string, mimeType: string) {
  const blob = new Blob([content], {
    type: mimeType,
  });
  return blob;
}

/**
 * 从 content-disposition 响应头中解析文件名，
 * 兼容 filename*=UTF-8''xxx（RFC 5987）与 filename="xxx" 两种写法，
 * 解析不到时返回空字符串
 */
export function getDispositionFilename(contentDisposition?: string | null) {
  if (!contentDisposition) {
    return '';
  }

  // 形如 attachment; filename*=UTF-8''%E4%B8%AD%E6%96%87.pdf
  const extended = /filename\*=\s*(?:[^']*'[^']*')?([^;]*)/i.exec(contentDisposition)?.[1]?.trim();
  // 形如 attachment; filename="中文.pdf"（等号两侧允许有空格）
  const basic = /filename\s*=\s*"?([^";]*)"?/i.exec(contentDisposition)?.[1]?.trim();

  const value = extended || basic;

  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch {
    // 文件名里含有非法转义序列（如 100%.pdf）时按原文返回
    return value;
  }
}

/**
 * 附件响应：axios 的 AxiosResponse 或 fetch 的 Response
 */
type AttachmentResponse = AxiosResponse | Response;

/**
 * 判断是否为 fetch 的 Response
 */
function isFetchResponse(response: AttachmentResponse): response is Response {
  return typeof Response !== 'undefined' && response instanceof Response;
}

/**
 * 读取响应头，兼容 axios 的普通对象响应头与 Headers / AxiosHeaders 实例
 * （后两者都提供了不区分大小写的 get 方法，普通对象则按 key 直接取）
 */
function getHeader(response: AttachmentResponse, name: string) {
  const headers = response.headers as unknown as Record<string, any> & {
    get?: (name: string) => unknown;
  };

  const value = isFunction(headers?.get) ? headers.get(name) : headers?.[name];

  return isString(value) ? value : '';
}

/**
 * 下载附件，支持 axios 的 AxiosResponse 与 fetch 的 Response。
 *
 * 传入 Response 时需要读取响应体，请务必 await
 */
export async function downloadAttachment(
  response: AttachmentResponse,
  options?: {
    filename?: string;
  },
) {
  let { filename } = options || {};

  const type = getHeader(response, 'content-type');

  if (!filename) {
    filename = getDispositionFilename(getHeader(response, 'content-disposition'));
  }

  if (!filename) {
    const ext = mime.getExtension(type);
    filename = `download${ext ? `.${ext}` : ''}`;
  }

  if (isFetchResponse(response)) {
    downloadBlob(await response.blob(), filename);
    return;
  }

  downloadBlob(createBlob(response.data, type), filename);
}

export const imageExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'heic',
  'heif',
  'tiff',
  'tif',
  'svg',
  'eps',
  'ico',
];

/**
 * 判断是否为图片地址
 */
export function isImageUrl(url: string) {
  try {
    const ext = new URL(url).pathname.split('.').pop();
    return !!ext && imageExtensions.includes(ext);
  } catch {
    return false;
  }
}
