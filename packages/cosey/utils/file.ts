import { type AxiosResponse } from 'axios';
import { isString } from './is';
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

export function readAsDataURL(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

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
 * 下载附件
 */
export function downloadAttachment(
  response: AxiosResponse,
  options?: {
    filename?: string;
  },
) {
  let { filename } = options || {};

  const type = response.headers['content-type'];

  if (!filename) {
    const contentDisposition = response.headers['content-disposition'];

    if (contentDisposition) {
      filename = contentDisposition.split('filename=')[1].trim().replace(/"/g, '');
      if (filename) {
        filename = decodeURIComponent(filename);
      }
    }
  }

  if (!filename) {
    const ext = mime.getExtension(type);
    filename = `download${ext ? `.${ext}` : ''}`;
  }

  const blob = new Blob([response.data], { type });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(link.href);
  }, 100);
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
