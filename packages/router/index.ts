import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import type { RsbuildPlugin } from '@rsbuild/core';

export interface ReactRouterPluginOptions {
  root: string;
  output: string;
  srcAlias?: string;
  layoutFilename?: string;
}

export function reactRouterPlugin({
  root,
  output,
  srcAlias = '',
  layoutFilename = '_layout.tsx',
}: ReactRouterPluginOptions): RsbuildPlugin {
  return {
    name: 'react-router-plugin',
    async setup(api) {
      api.onBeforeCreateCompiler(async () => {
        const watcher = chokidar.watch(root, {
          ignored: [/(^|[\/\\])\.\./, '**/node_modules/**'],
          persistent: true,
          ignoreInitial: true,
          awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 500,
          },
        });

        function change() {
          const routes = buildRouteDefinitions(root, {
            layoutFilename,
            root,
            alias: srcAlias,
          });
          const content = generateRouteFile(routes);
          fs.mkdirSync(path.dirname(output), { recursive: true });
          fs.writeFileSync(output, content, 'utf-8');
          console.info(`[reactRouterPlugin] Routes generated at: ${output}`);
        }

        change();

        const logChange = (type: string, filePath: string) => {
          console.log(`[react-router-plugin] ${type}: ${filePath}`);
          change();
        };

        watcher
          .on('add', (filePath) => logChange('File added', filePath))
          .on('unlink', (filePath) => logChange('File removed', filePath))
          .on('addDir', (dirPath) => logChange('Directory added', dirPath))
          .on('unlinkDir', (dirPath) => logChange('Directory removed', dirPath))
          .on('error', (error) => console.error('[react-router-plugin] Watcher error:', error));
      });
    },
  };
}

const validExtensions = ['.tsx', '.jsx', '.ts', '.js'];

interface RouteDefinition {
  index?: boolean;
  path?: string;
  element?: string;
  children?: RouteDefinition[];
}

interface BuildOptions {
  layoutFilename: string;
  root: string;
  alias: string;
}

// New helper function to extract dynamic segments from a file name
function getDynamicPath(name: string): string {
  // Handle catch-all routes (e.g., [...404].tsx)
  const catchAllMatch = name.match(/\[\.\.\.([^\]]+)\]/);
  if (catchAllMatch) {
    return '*';
  }
  
  // Handle dynamic segments (e.g., [id].tsx)
  const dynamicMatch = name.match(/\[([^\]]+)\]/);
  return dynamicMatch ? `:${dynamicMatch[1]}` : name;
}

function buildRouteDefinitions(
  dir: string,
  options: BuildOptions,
  parentPath = ''
): RouteDefinition[] {
  const entries = fs.readdirSync(dir);
  const children: RouteDefinition[] = [];
  let layoutFile: string | undefined;
  let hasIndex = false;

  // First pass: identify layout and index files
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    const ext = path.extname(entry);
    const name = path.basename(entry, ext);

    if (stat.isFile()) {
      if (entry === options.layoutFilename) {
        layoutFile = entry;
      }
      if (name === 'index') {
        hasIndex = true;
      }
    }
  }

  // Sort entries so that index files are processed first
  const sortedEntries = entries.sort((a, b) => {
    const aName = path.basename(a, path.extname(a));
    const bName = path.basename(b, path.extname(b));
    if (aName === 'index') return -1;
    if (bName === 'index') return 1;
    return a.localeCompare(b);
  });

  // Second pass: process all files and directories
  for (const entry of sortedEntries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const nestedRoutes = buildRouteDefinitions(
        fullPath,
        options,
        path.posix.join(parentPath, entry)
      );
      
      if (nestedRoutes.length > 0) {
        // For nested routes, we need to handle the path properly
        const nestedPath = getDynamicPath(entry);
        if (nestedRoutes.length === 1 && nestedRoutes[0].path !== undefined) {
          // If there's a layout in the nested directory, use it as is
          children.push(...nestedRoutes);
        } else {
          // Otherwise, create a route for this directory
          children.push({
            path: nestedPath,
            children: nestedRoutes
          });
        }
      }
    } else if (stat.isFile()) {
      const ext = path.extname(entry);
      if (!validExtensions.includes(ext)) continue;
      if (entry === options.layoutFilename) continue;

      const name = path.basename(entry, ext);
      let routePath = '';

      if (name === 'index') {
        routePath = '';
      } else {
        routePath = getDynamicPath(name);
      }

      const importPath = formatImportPath(fullPath, options.root, options.alias);

      children.push({
        index: name === 'index',
        path: routePath,
        element: importPath,
      });
    }
  }

  // If we have a layout file, wrap children
  if (layoutFile) {
    console.log('layoutFile', layoutFile);
    const layoutPath = formatImportPath(path.join(dir, layoutFile), options.root, options.alias);
    return [
      {
        path: parentPath || '/',
        element: layoutPath,
        children,
      },
    ];
  }

  return children;
}

function formatImportPath(filePath: string, root: string, alias: string): string {
  const rel = path
    .relative(path.resolve(root, '..'), filePath)
    .replace(/\\/g, '/');
  const noExt = rel.replace(/\.(tsx|ts|js|jsx)$/, '');
  return alias ? alias + noExt.replace(/^src\//, '') : './' + noExt;
}

// Helper function to print route paths
function printRoutePaths(routes: RouteDefinition[], prefix = '') {
  routes.forEach(route => {
    const path = route.path || (route.index ? 'index' : '');
    console.log(`${prefix}${path}`);
    if (route.children) {
      printRoutePaths(route.children, prefix + '  ');
    }
  });
}

function generateRouteFile(routes: RouteDefinition[]): string {
  const imports: string[] = [];
  let counter = 0;

  // Print route paths before generating the file
  console.log('Route paths:');
  printRoutePaths(routes);

  const replaceElements = (nodes: RouteDefinition[]): any[] =>
    nodes.map((node) => {
      const newNode: any = { ...node };
      
      if (node.element) {
        const varName = `RouteComp${counter++}`;
        imports.push(`import ${varName} from '${node.element}';`);
        newNode.element = varName;
      }
      
      if (node.children) {
        newNode.children = replaceElements(node.children);
      }
      
      // Ensure path is always set on the route object
      newNode.path = node.path || '';
      
      if (!node.path) {
        delete newNode.path;
      }
      
      return newNode;
    });

  const routeTree = replaceElements(routes);

  return `${imports.join('\n')}
import React from 'react';
import { type RouteObject } from 'react-router';

const routes: RouteObject[] = ${JSON.stringify(routeTree, null, 2).replace(
    /"element": "RouteComp(\d+)"/g,
    '"element": React.createElement(RouteComp$1)',
  )};

export default routes;
`;
} 