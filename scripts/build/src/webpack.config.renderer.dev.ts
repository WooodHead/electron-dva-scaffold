/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { spawn, execSync } from 'child_process';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as webpack from 'webpack';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from './utils/checkNodeEnv';
import { srcPath, dllPath, nodeModulesPath, distPath } from './utils/paths';

CheckNodeEnv('development');

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const manifest = path.resolve(dllPath, 'renderer.json');

/**
 * Warn if the DLL is not built
 */
if (!(fs.existsSync(dllPath) && fs.existsSync(manifest))) {
	console.log(chalk.black.bgYellow.bold('The DLL files are missing. Sit back while we build them for you with "npm run build-dll"'));
	execSync('npm run build-dll');
}

function getCSSLoader(modules: boolean) {
	return {
		loader: 'css-loader',
		options: {
			modules: modules,
			sourceMap: true,
			importLoaders: 1,
			localIdentName: '[local]__[hash:base64:5]',
		}
	};
}

function getLessLoader() {
	return {
		loader: 'less-loader',
		options: {
			javascriptEnabled: true
		}
	};
}

export default merge.smart(baseConfig, {
	devtool: 'inline-source-map',

	mode: 'development',

	target: 'electron-renderer',

	entry: [
		// 'react-hot-loader/patch',
		`webpack-dev-server/client?http://localhost:${port}/`,
		// 'webpack/hot/only-dev-server',
		path.join(srcPath, 'electron-browser/main'),
	],

	output: {
		publicPath: `http://localhost:${port}/dist/`,
		filename: 'main.dev.js'
	},

	module: {
		rules: [
			{
				test: /\.css$/,
				include: srcPath,
				use: [
					{
						loader: 'style-loader'
					},
					getCSSLoader(true)
				]
			},
			{
				test: /\.less$/,
				include: srcPath,
				use: [
					{
						loader: 'style-loader'
					},
					getCSSLoader(true),
					getLessLoader()
				]
			},
			{
				test: /\.css$/,
				include: nodeModulesPath,
				use: [
					{
						loader: 'style-loader'
					},
					getCSSLoader(false)
				]
			},
			{
				test: /\.less$/,
				include: nodeModulesPath,
				use: [
					{
						loader: 'style-loader'
					},
					getCSSLoader(false),
					getLessLoader()
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

	plugins: [
		new webpack.DllReferencePlugin({
			context: srcPath,
			manifest: require(manifest),
			sourceType: 'var',
		}),

		new webpack.HotModuleReplacementPlugin({
			multiStep: true
		}),

		new webpack.NoEmitOnErrorsPlugin(),

		/**
		 * Create global constants which can be configured at compile time.
		 *
		 * Useful for allowing different behaviour between development builds and
		 * release builds
		 *
		 * NODE_ENV should be production so that modules do not perform certain
		 * development checks
		 *
		 * By default, use 'development' as NODE_ENV. This can be overriden with
		 * 'staging', for example, by changing the ENV variables in the npm scripts
		 */
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'development'
		}),

		new webpack.LoaderOptionsPlugin({
			debug: true
		}),

		new ExtractTextPlugin({
			filename: '[name].css'
		}),
	],

	node: {
		__dirname: false,
		__filename: false
	},

	devServer: {
		port,
		publicPath,
		compress: true,
		noInfo: true,
		stats: 'errors-only',
		inline: true,
		lazy: false,
		hot: true,
		headers: { 'Access-Control-Allow-Origin': '*' },
		contentBase: distPath,
		watchOptions: {
			aggregateTimeout: 300,
			ignored: /node_modules/,
			poll: 100
		},
		historyApiFallback: {
			verbose: true,
			disableDotRule: false,
		},
		before() {
			if (process.env.START_HOT) {
				console.log('Starting Main Process...');
				spawn(
					'npm',
					['run', 'start-main-dev'],
					{ shell: true, env: process.env, stdio: 'inherit' }
				)
					.on('close', code => process.exit(code))
					.on('error', spawnError => console.error(spawnError));
			}
		}
	},
});
