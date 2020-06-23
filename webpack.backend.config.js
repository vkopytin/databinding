const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const StartServerPlugin = require('./restart-server-plugin');

  
module.exports = {
    mode: 'development',
    target: 'node',
    devtool: "inline-source-map",
    entry: {
        app: [
            'webpack/hot/poll?1000',
            path.join(__dirname, './src/examples/reflux-ts/server/index.ts')
        ],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'server.js',
        hotUpdateChunkFilename: '.hot/[id].[hash].hot-update.js',
        hotUpdateMainFilename: '.hot/[hash].hot-update.json'
    },
    optimization: {
        minimize: false
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json', '.mustache']
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
                configFile: 'tsconfig.backend.json'
            }
        }, {
            test: /\.mustache$/, loader: 'mustache-loader'
        }, {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: [/node_modules/]
        }]
    },
    externals: [nodeExternals({
        whitelist: ['webpack/hot/poll?1000'],
    })],
    plugins: [
        new StartServerPlugin({
            name: 'server.js',
            nodeArgs: ['--inspect=9233'], // allow debugging
            keyboard: true,
            restartable: true,
            signal: false
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    node: {
        __dirname: false
    }
};
