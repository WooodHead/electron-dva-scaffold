import * as path from 'path';
import * as webpack from 'webpack';
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CleanWebpackPlugin = require('clean-webpack-plugin');

const outPath = path.join(__dirname, 'out');
const publicPath = outPath.replace(/\\/g, '/') + '/';

const extractStyle = new ExtractTextPlugin('./electron-browser/media/main.css');

const config: webpack.Configuration = {
    devtool: 'source-map',
    target: 'electron-renderer',
    stats: "errors-only",
    context: path.join(__dirname, 'src'),
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        modules: [
            'node_modules',
            path.join(__dirname, './src')
        ],
        alias: {
            interfaces: `${__dirname}/src/interfaces`,
            routes: `${__dirname}/src/routes`,
        }
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: './src/tsconfig.json'
                }
            },
            {
                test: /\.css$/,
                loader: extractStyle.extract('css-loader')
            },
            {
                test: /\.less$/,
                loader: extractStyle.extract('css-loader!less-loader')
            },
            {
                test: /\.(eot|woff|ttf|png|gif|svg)([\?]?.*)$/,
                loader: 'file-loader?name=[path][name].[ext]'
            }
        ]
    },
    entry: {
        'app': [
            './app'
        ],
        'electron-main/main': [
            './electron-main/main'
        ]
    },
    output: {
        path: outPath,
        filename: '[name].js',
        publicPath: publicPath
    },
    plugins: [
        new CleanWebpackPlugin(['out']),
        new CopyWebpackPlugin([
            { from: '**/*.html' },
            { from: 'main.js' }
        ]),
        extractStyle
    ]
};

module.exports = config;