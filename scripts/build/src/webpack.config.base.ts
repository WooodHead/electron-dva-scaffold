/**
 * Base webpack config used across other specific configs
 */

import * as webpack from 'webpack';
import { srcPath, outPath } from './utils/paths';

const baseConfig: webpack.Configuration = {
	context: srcPath,

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				include: srcPath,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true
					}
				}
			},
			{
                test: /\.ts(x?)$/,
                include: srcPath,
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: './src/tsconfig.json',
                            transpileOnly: true,
                        },
                    },
                ]
            },
		]
	},

	output: {
		path: outPath,
		// https://github.com/webpack/webpack/issues/1114
		libraryTarget: 'commonjs2'
	},

	/**
	 * Determine the array of extensions that should be used to resolve modules.
	 */
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
		modules: [
			srcPath,
			'node_modules',
		],
	},

	plugins: [
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'production'
		}),

		new webpack.NamedModulesPlugin(),
	],
	resolveLoader: {
        moduleExtensions: ['-loader'],
    }
};

export default baseConfig;

