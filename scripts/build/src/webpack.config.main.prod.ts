/**
 * Webpack config for production electron main process
 */

import * as webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from './utils/checkNodeEnv';
import { srcPath } from './utils/paths';

CheckNodeEnv('production');

const config: webpack.Configuration = merge.smart(baseConfig, {
	mode: 'production',

	devtool: 'source-map',

	target: 'electron-main',

	entry: './electron-main/main',

	output: {
		path: srcPath,
		filename: './main.prod.js'
	},

	module: {
		// fix: Critical dependency: require function is used in a way in which dependencies cannot be statically extracted
		unknownContextCritical: false,
		rules: baseConfig.module.rules
	},

	plugins: [
		new BundleAnalyzerPlugin({
			analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
			openAnalyzer: process.env.OPEN_ANALYZER === 'true'
		}),

		/**
		 * Create global constants which can be configured at compile time.
		 *
		 * Useful for allowing different behaviour between development builds and
		 * release builds
		 *
		 * NODE_ENV should be production so that modules do not perform certain
		 * development checks
		 */
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'production',
			DEBUG_PROD: 'false'
		})
	],

	/**
	 * Disables webpack processing of __dirname and __filename.
	 * If you run the bundle in node.js it falls back to these values of node.js.
	 * https://github.com/webpack/webpack/issues/2010
	 */
	node: {
		__dirname: false,
		__filename: false
	},
});

export default config;