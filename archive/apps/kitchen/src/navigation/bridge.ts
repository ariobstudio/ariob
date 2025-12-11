/**
 * Explorer bridge for schema-based navigation.
 *
 * Uses simple single-word helpers per unix-parctice guidelines.
 */

const PREFIX = 'file://lynx?local://kitchen/';
const SUFFIX = '.lynx.bundle';

export type Options = {
  params?: Record<string, string | number | boolean>;
  fullscreen?: boolean;
};

const build = (name: string, options: Options = {}): string => {
  const { params: pairs = {}, fullscreen = false } = options;
  const query = new URLSearchParams();

  if (fullscreen) {
    query.append('fullscreen', 'true');
  }

  Object.entries(pairs).forEach(([key, value]) => {
    query.append(key, String(value));
  });

  const suffix = query.toString();
  const base = `${PREFIX}${name}${SUFFIX}`;

  return suffix ? `${base}?${suffix}` : base;
};

export const open = (name: string, options: Options = {}) => {
  if (typeof NativeModules === 'undefined' || !NativeModules.ExplorerModule) {
    console.warn('ExplorerModule unavailable.');
    return;
  }

  NativeModules.ExplorerModule.openSchema(build(name, options));
};

export const back = () => {
  if (typeof NativeModules === 'undefined' || !NativeModules.ExplorerModule) {
    return;
  }

  NativeModules.ExplorerModule.navigateBack();
};

export const scan = () => {
  if (typeof NativeModules === 'undefined' || !NativeModules.ExplorerModule) {
    return;
  }

  NativeModules.ExplorerModule.openScan();
};

export const params = (urlString: string): Record<string, string> => {
  try {
    const data = new URL(urlString);
    const next: Record<string, string> = {};

    data.searchParams.forEach((value, key) => {
      next[key] = value;
    });

    return next;
  } catch (error) {
    console.error('Failed to parse params', error);
    return {};
  }
};

export const screen = (urlString: string): string | null => {
  if (!urlString.includes(PREFIX)) {
    return null;
  }

  const start = urlString.indexOf(PREFIX) + PREFIX.length;
  const end = urlString.indexOf(SUFFIX, start);

  if (end === -1) {
    return null;
  }

  return urlString.slice(start, end) || null;
};
