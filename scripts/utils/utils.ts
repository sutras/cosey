import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';

export async function writeFileWithDirs(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    await fsp.mkdir(dir, { recursive: true });
  }
  await fsp.writeFile(filePath, content);
}

export async function copyFileWithDirs(src: string, dest: string) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    await fsp.mkdir(dir, { recursive: true });
  }
  await fsp.copyFile(src, dest);
}

export async function replaceFileContent(
  filePath: string,
  replacement: (content: string) => string,
) {
  let content = await fsp.readFile(filePath, 'utf8');
  content = replacement(content);
  await writeFileWithDirs(filePath, content);
}

/**
 * 生成 `exports` 映射。
 *
 * 显式列出 dist 里带 `index.js` 的入口目录（`cosey/components` 这类），
 * 深路径（`cosey/locale/lang/zh-cn`、`cosey/utils/number`）交给通配：
 * 通配会补上 `.js` / `.d.ts`，而目录形式（`cosey/components/table`）不再解析 ——
 * 这也是加 `exports` 唯一的代价，官方入口清单见 README 与 llms.txt。
 */
async function resolveExports(outDir: string) {
  const entries: Record<string, unknown> = {
    '.': { types: './index.d.ts', import: './index.js', default: './index.js' },
    './package.json': './package.json',
  };

  const dirents = await fsp.readdir(outDir, { withFileTypes: true });

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) {
      continue;
    }

    if (!fs.existsSync(path.resolve(outDir, dirent.name, 'index.js'))) {
      continue;
    }

    entries[`./${dirent.name}`] = {
      types: `./${dirent.name}/index.d.ts`,
      import: `./${dirent.name}/index.js`,
      default: `./${dirent.name}/index.js`,
    };
  }

  entries['./*.js'] = './*.js';
  entries['./*.css'] = './*.css';
  entries['./*'] = { types: './*.d.ts', import: './*.js', default: './*.js' };

  return entries;
}

export async function resolvePackageJson(pkgJsonFile: string, packagesDir: string, outDir: string) {
  const sourcePkg = JSON.parse(await fsp.readFile(pkgJsonFile, 'utf-8'));

  // 收集所有工作区包（packages/*）的名称和版本号
  const workspaceVersions: Record<string, string> = {};
  const packageDirs = await fsp.readdir(packagesDir, { withFileTypes: true });

  for (const dirent of packageDirs) {
    if (!dirent.isDirectory()) continue;
    const pkgPath = path.resolve(packagesDir, dirent.name, 'package.json');
    try {
      const pkg = JSON.parse(await fsp.readFile(pkgPath, 'utf-8'));
      if (pkg.name && pkg.version && pkg.private !== true) {
        workspaceVersions[pkg.name] = pkg.version;
      }
    } catch {
      // 跳过没有 package.json 的目录
    }
  }

  // 将 workspace:* / workspace:^ 等协议替换为实际版本号
  function resolveWorkspaceDeps(deps: Record<string, string> | undefined) {
    if (!deps) return undefined;
    const resolved: Record<string, string> = {};
    for (const [name, version] of Object.entries(deps)) {
      if (
        typeof version === 'string' &&
        version.startsWith('workspace:') &&
        workspaceVersions[name]
      ) {
        resolved[name] = `^${workspaceVersions[name]}`;
      } else {
        resolved[name] = version as string;
      }
    }
    return resolved;
  }

  const distPkg = {
    ...sourcePkg,
    types: './index.d.ts',
    exports: await resolveExports(outDir),
    main: sourcePkg.main ? sourcePkg.main.replace(/\.tsx?$/, '.js') : undefined,
    module: sourcePkg.module ? sourcePkg.module.replace(/\.tsx?$/, '.js') : undefined,
    dependencies: resolveWorkspaceDeps(sourcePkg.dependencies),
    devDependencies: resolveWorkspaceDeps(sourcePkg.devDependencies),
    peerDependencies: resolveWorkspaceDeps(sourcePkg.peerDependencies),
    optionalDependencies: resolveWorkspaceDeps(sourcePkg.optionalDependencies),
  };

  return JSON.stringify(distPkg, null, 2);
}
