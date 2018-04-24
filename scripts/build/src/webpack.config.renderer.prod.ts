/**
 * Build config for electron renderer process
 */

import * as webpack from 'webpack';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as merge from 'webpack-merge';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from './utils/checkNodeEnv';
import { distPath, srcPath, nodeModulesPath } from './utils/paths';

CheckNodeEnv('production');

function getCSSLoader(modules: boolean) {
	return {
		loader: 'css-loader',
		options: {
			modules: modules,
			minimize: true,
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

const config: webpack.Configuration = merge.smart(baseConfig, {
	mode: 'production',

	devtool: 'source-map',

	target: 'electron-renderer',

	entry: {
		'electron-browser/main': [
			'./electron-browser/main'
		]
	},

	output: {
		path: distPath,
		publicPath: '../',
		chunkFilename: '[name].[chunkhash].js',
		filename: '[name].js'
	},

	module: {
		rules: [
			{
				test: /\.css$/,
				include: srcPath,
				use: ExtractTextPlugin.extract({
					use: getCSSLoader(true)
				})
			},
			{
				test: /\.less$/,
				include: srcPath,
				use: ExtractTextPlugin.extract({
					use: [
						getCSSLoader(true),
						getLessLoader()
					]
				})
			},
			{
				test: /\.css$/,
				include: nodeModulesPath,
				use: ExtractTextPlugin.extract({
					use: getCSSLoader(false)
				})
			},
			{
				test: /\.less$/,
				include: nodeModulesPath,
				use: ExtractTextPlugin.extract({
					use: [
						getCSSLoader(false),
						getLessLoader()
					]
				})
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
		/**
		 * Create global constants which can be configured at compile time.
		 *
		 * Useful for allowing different behaviour between development builds and
		 * release builds
		 *
		 * NODE_ENV should be production so that modules do not perform certain
		 * development checks
		 */
		new CopyWebpackPlugin([
			{ from: 'main.js' },
			{ from: 'main.prod.js' },
			{ from: '**/*.html' }
		]),

		new webpack.EnvironmentPlugin({
			NODE_ENV: 'production'
		}),

		new ExtractTextPlugin({
			filename: `[name].css`,
			allChunks: true,
		}),

		new BundleAnalyzerPlugin({
			analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
			openAnalyzer: process.env.OPEN_ANALYZER === 'true'
		}),
	],
});

export default config;