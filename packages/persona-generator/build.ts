import { build, type BuildOptions } from 'esbuild';

import { parseEnvVarsAsKeyVal } from './src/utils/env';
import { type Defined, defined } from './src/defined';

import pkgJson from './package.json';

const external = [
  ...Object.keys(pkgJson.dependencies),
];

const define = parseEnvVarsAsKeyVal<Defined>({
  defined,
});

const main = async () => {
  const buildOptions: BuildOptions = {
    entryPoints: ['./src/index.ts'],
    define: {
      ...define,
      'process.env.NODE_ENV': '"production"',
    },
    bundle: true,
    platform: 'browser',
    target: 'esnext',
    format: 'esm',
    sourcemap: true,
    minify: true,
    outdir: 'dist',
    external,
  };

  try {
    await build(buildOptions);
  } catch (error) {
    console.error('👹 Oops! Failed to bundle for some reason...');
    console.error(error);
    process.exit(1);
  }
};

main();
