import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
//import * as assets from './assets';
//var assetPath = assets.getAssetPATH();
export const config: Config = {
  namespace: 'stencil-calendar',
  plugins: [sass({
    includePaths: ["./node_modules/"],
  })],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
    ]
    },
  ],
  devServer: {
    startupTimeout: 20000
  }
};
