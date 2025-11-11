const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the workspace root (monorepo root)
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro handle TypeScript files
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs', 'cjs'];

// 3. Resolve workspace packages (node_modules in monorepo root and app)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 4. Custom resolver to handle .ts files when .js is specified
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Let the default resolver try first
  try {
    return context.resolveRequest(context, moduleName, platform);
  } catch (error) {
    // If it failed and we're looking for a .js file, try .ts
    if (moduleName.endsWith('.js')) {
      const tsModuleName = moduleName.replace(/\.js$/, '.ts');
      try {
        return context.resolveRequest(context, tsModuleName, platform);
      } catch (tsError) {
        // If that also failed, throw the original error
        throw error;
      }
    }
    throw error;
  }
};

module.exports = config;
