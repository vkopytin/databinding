const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    mode: 'production',
    entry: './src/databinding/index.ts',
    output: {
        filename: 'databinding.js',
        path: path.resolve(__dirname, 'lib'),
        library: 'libpack',
        libraryTarget: 'umd',
        umdNamedDefine: true
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
    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            automaticNameMaxLength: 30,
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
};
