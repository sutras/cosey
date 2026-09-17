import { MaybeRefOrGetter, toValue, watch } from 'vue';
import { TinyColor } from '@ctrl/tinycolor';

// ============================================================
// Types — matching packages/cosey/style/base/element-plus-token.scss
// ============================================================

export interface ThemeToken {
  /** Brand seed colors — all palettes are auto-derived from these */
  colorPrimary?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorDanger?: string;
  colorError?: string;
  colorInfo?: string;
}

export interface ThemeConfig {
  token?: ThemeToken;
}

// ============================================================
// CSS-in-JS Utilities
// ============================================================

type CSSDeclarations = Record<string, string | number | undefined>;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function getRGB(color: TinyColor): string {
  return `${color.r},${color.g},${color.b}`;
}

// ============================================================
// Color Palette Derivation
// ============================================================

/**
 * Derive color palette from a seed color using the same mix-light / mix-dark
 * approach as SCSS element-plus-token.scss:
 *
 *   mix-light($base, $n) → mix white at n/10 ratio
 *   mix-dark($base, $n)  → mix black at n/10 ratio
 *
 * Levels used (matching SCSS): light-3, light-5, light-7, light-8, light-9, dark-2
 */
function derivePalette(seed: string): Record<string, string> {
  const color = new TinyColor(seed);

  const mixWhite = (ratio: number) => color.clone().mix('#ffffff', ratio).toHexString();
  const mixBlack = (ratio: number) => color.clone().mix('#000000', ratio).toHexString();

  return {
    light3: mixWhite(30), // 30% white + 70% seed
    light5: mixWhite(50), // 50% white + 50% seed
    light7: mixWhite(70), // 70% white + 30% seed
    light8: mixWhite(80), // 80% white + 20% seed
    light9: mixWhite(90), // 90% white + 10% seed
    dark2: mixBlack(20), // 20% black + 80% seed
  };
}

/**
 * Always derive all color palettes from seed colors.
 * Returns a flat key-value map of palette CSS values.
 * These are NOT user-settable — purely derived from seed colors.
 */
function deriveAllPalettes(token: ThemeToken): Record<string, string> {
  const types = ['Primary', 'Success', 'Warning', 'Danger', 'Error', 'Info'] as const;
  const levels = [
    { suffix: 'Light3', palKey: 'light3' as const },
    { suffix: 'Light5', palKey: 'light5' as const },
    { suffix: 'Light7', palKey: 'light7' as const },
    { suffix: 'Light8', palKey: 'light8' as const },
    { suffix: 'Light9', palKey: 'light9' as const },
    { suffix: 'Dark2', palKey: 'dark2' as const },
  ];

  const result: Record<string, string> = {};

  for (const type of types) {
    const seedKey = `color${type}` as keyof ThemeToken;
    const seed = token[seedKey] as string | undefined;
    if (!seed) continue;

    const pal = derivePalette(seed);
    for (const { suffix, palKey } of levels) {
      result[`color${type}${suffix}`] = pal[palKey];
    }
  }

  return result;
}

// ============================================================
// Token helpers
// ============================================================

function resolveToken(userToken?: ThemeToken): ThemeToken {
  return userToken ?? {};
}

// ============================================================
// Generate --el-* Element Plus palette overrides
// ============================================================

const TYPES = ['primary', 'success', 'warning', 'danger', 'error', 'info'] as const;

function generatePalettes(token: ThemeToken, palettes: Record<string, string>): CSSDeclarations {
  const decls: CSSDeclarations = {};
  const set = (k: string, v: string | number) => void (decls[`--el-${k}`] = v);

  for (const type of TYPES) {
    const seed = token[`color${cap(type)}` as keyof ThemeToken] as string | undefined;
    if (!seed) continue;

    const p = (suffix: string) => `color-${type}${suffix ? '-' + suffix : ''}`;
    const base = p('');
    set(base, seed);
    set(p('light-3'), palettes[`color${cap(type)}Light3`]);
    set(p('light-5'), palettes[`color${cap(type)}Light5`]);
    set(p('light-7'), palettes[`color${cap(type)}Light7`]);
    set(p('light-8'), palettes[`color${cap(type)}Light8`]);
    set(p('light-9'), palettes[`color${cap(type)}Light9`]);
    set(p('dark-2'), palettes[`color${cap(type)}Dark2`]);
    set(`${base}-rgb`, getRGB(new TinyColor(seed)));
  }

  return decls;
}

// ============================================================
// Build CSS string
// ============================================================

function declarationsToCSS(decls: CSSDeclarations): string {
  let css = '';
  for (const [prop, value] of Object.entries(decls)) {
    if (value != null && value !== '') {
      css += `  ${prop}: ${value};\n`;
    }
  }
  return css;
}

function buildThemeCSS(token: ThemeToken, palettes: Record<string, string>): string {
  const cssBody = declarationsToCSS(generatePalettes(token, palettes));
  return cssBody ? `:root {\n${cssBody}}\n` : '';
}

// ============================================================
// useTheme composable
// ============================================================

const STYLE_ELEMENT_ID = 'cosey-theme-overrides';

export function useTheme(config: MaybeRefOrGetter<ThemeConfig | undefined>) {
  let styleElement: HTMLStyleElement | null = null;

  function applyTheme(cfg: ThemeConfig) {
    // Resolve token: only user-provided overrides (no defaults)
    const resolved = resolveToken(cfg.token);

    // If nothing was overridden, remove any previously injected style and bail
    if (Object.keys(resolved).length === 0) {
      if (styleElement) {
        styleElement.textContent = '';
      }
      return;
    }

    // Derive color palettes from seed colors (purely internal, not user-settable)
    const palettes = deriveAllPalettes(resolved);

    // Build CSS from palette overrides
    const css = buildThemeCSS(resolved, palettes);

    // Apply via a dedicated <style> element
    if (!styleElement) {
      const existing = document.getElementById(STYLE_ELEMENT_ID);
      if (existing) {
        styleElement = existing as HTMLStyleElement;
      } else {
        styleElement = document.createElement('style');
        styleElement.id = STYLE_ELEMENT_ID;
        styleElement.setAttribute('data-theme', 'cosey');
        document.head.appendChild(styleElement);
      }
    }
    styleElement.textContent = css;
  }

  watch(
    () => toValue(config),
    (cfg) => {
      if (cfg) {
        applyTheme(cfg);
      }
    },
    { immediate: true, deep: true },
  );
}
