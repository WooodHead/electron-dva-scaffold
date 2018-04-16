import * as path from 'path';
import * as webpack from 'webpack';
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CleanWebpackPlugin = require('clean-webpack-plugin');

const outPath = path.join(__dirname, 'out');
const publicPath = outPath.replace(/\\/g, '/') + '/';

const extractStyle = new ExtractTextPlugin({
    filename: './electron-browser/media/main.css',
    allChunks: true
});

const css_loader = {
    loader: 'css-loader',
    options: {
        modules: true,
        importLoaders: 1,
        localIdentName: '[local]___[hash:base64:5]'
    }
};

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
                use: extractStyle.extract({
                    use: css_loader
                })
            },
            {
                test: /\.less$/,
                use: extractStyle.extract({
                    use: [css_loader, 'less-loader']
                })
            },
            {
                test: /\.(eot|woff|ttf|png|gif|svg)([\?]?.*)$/,
                loader: 'file-loader?name=[path][name].[ext]'
            }
        ]
    },
    entry: {
        'electron-browser/main': [
            './electron-browser/main'
        ],
        'electron-main/main': [
            './electron-main/main'
        ]
    },
    output: {
        path: outPath,
        filename: '[name].js',
        chunkFilename: '[name].[chunkhash].js',
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