/**
 * Builds the DLL for development electron renderer process
 */

import * as path from 'path';
import * as webpack from 'webpack';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from './utils/checkNodeEnv';
import { dllPath, srcPath } from './utils/paths';
const { dependencies } = require('../../../package.json');

CheckNodeEnv('development');

export default merge.smart(baseConfig, {
	context: dllPath,

	mode: 'development',

	devtool: 'eval',

	target: 'electron-renderer',

	/**
	 * Use `module` from `webpack.config.renderer.dev.js`
	 */
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
						plugins: [
							// Here, we include babel plugins that are only required for the
							// renderer process. The 'transform-*' plugins must be included
							// before react-hot-loader/babel
							'transform-class-properties',
							'transform-es2015-classes',
							'react-hot-loader/babel'
						],
					}
				}
			},
			{
				test: /\.global\.css$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					}
				]
			},
			{
				test: /^((?!\.global).)*\.css$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',
						options: {
							modules: true,
							sourceMap: true,
							importLoaders: 1,
							localIdentName: '[local]__[hash:base64:5]',
						}
					},
				]
			},
			// WOFF Font
			{
				test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/font-woff',
					}
				},
			},
			// WOFF2 Font
			{
				test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/font-woff',
					}
				}
			},
			// TTF Font
			{
				test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/octet-stream'
					}
				}
			},
			// EOT Font
			{
				test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				use: 'file-loader',
			},
			// SVG Font
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'image/svg+xml',
					}
				}
			},
			// Common Image Formats
			{
				test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
				use: 'url-loader',
			}
		]
	},

	entry: {
		renderer: (
			Object
				.keys(dependencies || {})
		)
	},

	output: {
		library: 'renderer',
		path: dllPath,
		filename: '[name].dev.dll.js',
		libraryTarget: 'var'
	},

	plugins: [
		new webpack.DllPlugin({
			path: path.join(dllPath, '[name].json'),
			name: '[name]',
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
			NODE_ENV: 'development'
		}),

		new webpack.LoaderOptionsPlugin({
			debug: true,
			options: {
				context: srcPath,
				output: {
					path: dllPath,
				},
			},
		})
	],
});
