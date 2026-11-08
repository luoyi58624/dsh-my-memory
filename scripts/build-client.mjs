/**
 * build-client.mjs —— 把 lib/client/src/ 打成 DSH 浏览器侧单文件 bundle
 *
 * DSH 的客户端模块加载器只认已打包产物：
 *   window.__ModuleLoader__.load({ id, factory: (require) => module.exports })
 * 浏览器里没有裸模块解析，所以 src 下的相对 import 必须在构建期合进来。
 *
 * react / react-dom 保持 external：运行时的 require 由外壳提供共享实例，
 * 打进来会出现两份 React，hooks 直接失效（这是这个项目唯一必须踩准的构建约束）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ENTRY = path.join(ROOT, 'lib', 'client', 'src', 'index.jsx');
const OUTFILE = path.join(ROOT, 'lib', 'client', 'index.js');
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const banner = `window.__ModuleLoader__.load({
	id: ${JSON.stringify(PKG.name)},
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });`;

const footer = `		return module.exports;
	}
});`;

await build({
  entryPoints: [ENTRY],
  outfile: OUTFILE,
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  // charset 保持 esbuild 默认的 ascii：中文文案会被写成 \uXXXX 转义。
  // why：DSH 用 <script> 加载这个 bundle，不带 charset 时浏览器可能按页面编码（非 UTF-8）解释，
  // 纯 ASCII 产物在任何编码下都不会乱码；代价是 grep 中文搜不到，要搜 "\u89D2\u8272\u5361"。
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  plugins: [
    {
      name: 'dsh-module-loader-wrapper',
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length) return;
          const code = fs.readFileSync(OUTFILE, 'utf8');
          fs.writeFileSync(OUTFILE, `${banner}\n${code}\n${footer}\n`, 'utf8');
        });
      },
    },
  ],
  logLevel: 'info',
});

const size = fs.statSync(OUTFILE).size;
console.log(`[build-client] 写出 ${path.relative(ROOT, OUTFILE)}  ${(size / 1024).toFixed(1)} KB`);
