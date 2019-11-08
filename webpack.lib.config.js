const path = require('path');
const DeclarationBundlerPlugin = require('./webpack-plugins/declarations');

module.exports = {
    mode: 'production',
    entry: './src/databindjs/index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'lib'),
        libraryTarget: 'umd'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [{
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            test: /\.tsx?$/, loader: 'ts-loader'
        }, {
            test: /\.mustache$/, loader: 'mustache-loader'
        }, {
            test: /\.css$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    importLoaders: 1
                }
            }, {
                loader: 'resolve-url-loader'
            }, {
                loader: 'postcss-loader'
            }]
        }]
    },
    plugins: [
        new DeclarationBundlerPlugin({
            moduleName: 'databindjs',
            out: 'index.d.ts',
        })
    ]
};
