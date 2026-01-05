/**
 * 生成应用内唯一标识符
 */
let counter = 0;
export function auid(prefix = '__co_') {
  return prefix + (~~(Math.random() * 10e8)).toString(36) + '-' + (++counter).toString(36);
}
