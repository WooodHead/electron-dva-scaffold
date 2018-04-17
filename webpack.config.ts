import * as path from 'path';
import * as webpack from 'webpack';
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CleanWebpackPlugin = require('clean-webpack-plugin');

const outPath = path.join(__dirname, 'out');
const publicPath = outPath.replace(/\\/g, '/') + '/';

const css_modules_loader = {
    loader: 'css-loader',
    options: {
        modules: true,
        importLoaders: 1,
        localIdentName: '[local]___[hash:base64:5]',
        sourceMap: true
    }
};

const babel_options = {
    babelrc: false,
    presets: [
        require.resolve('babel-preset-es2015'),
        require.resolve('babel-preset-react'),
        require.resolve('babel-preset-stage-0'),
    ],
    plugins: [
        require.resolve('babel-plugin-add-module-exports'),
        require.resolve('babel-plugin-react-require'),
        require.resolve('babel-plugin-syntax-dynamic-import'),
        "transform-runtime",
        [
            "import", {
                "libraryName": "antd",
                "style": true
            }
        ]
    ],
    cacheDirectory: true,
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
            themes: `${__dirname}/src/themes`,
            interfaces: `${__dirname}/src/interfaces`,
            services: `${__dirname}/src/services`,
            constants: `${__dirname}/src/constants`,
            routes: `${__dirname}/src/routes`,
            components: `${__dirname}/src/components`,
            utils: `${__dirname}/src/utils`,
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.join(__dirname, 'src'),
                use: {
                    loader: 'babel-loader',
                    options: babel_options
                }
            },
            {
                test: /\.css$/,
                include: path.join(__dirname, 'src'),
                use: ExtractTextPlugin.extract({
                    use: [
                        css_modules_loader
                    ]
                })
            },
            {
                test: /\.less$/,
                include: path.join(__dirname, 'src'),
                use: ExtractTextPlugin.extract({
                    use: [
                        css_modules_loader,
                        { loader: 'less-loader', options: { javascriptEnabled: true } }
                    ]
                })
            },
            {
                test: /\.css$/,
                include: path.join(__dirname, 'node_modules'),
                use: ExtractTextPlugin.extract({
                    use: [
                        { loader: "css-loader", options: { sourceMap: true } }
                    ]
                })
            },
            {
                test: /\.less$/,
                include: path.join(__dirname, 'node_modules'),
                use: ExtractTextPlugin.extract({
                    use: [
                        { loader: "css-loader", options: { sourceMap: true } },
                        { loader: 'less-loader', options: { javascriptEnabled: true } }
                    ]
                })
            },
            {
                test: /\.(eot|woff|ttf|png|gif|svg)([\?]?.*)$/,
                loader: 'file-loader?name=[path][name].[ext]'
            },
            {
                test: /\.ts(x?)$/,
                include: path.join(__dirname, 'src'),
                use: [
                    {
                        loader: 'babel-loader',
                        options: babel_options,
                    },
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: './src/tsconfig.json',
                            transpileOnly: true,
                        },
                    },
                ],
            },
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
        new ExtractTextPlugin({
            filename: `[name].css`,
            allChunks: true,
        })
    ],
    resolveLoader: {
        moduleExtensions: ['-loader'],
    }
};

module.exports = config;