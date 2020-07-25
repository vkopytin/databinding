const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');


module.exports = {
    mode: 'development',
    entry: {
        main: ['./src/index.ts']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'],
        aliasFields: [ 'browser' ],
        alias: {
            // databindjs: path.resolve(__dirname, 'lib/index')
            databindjs: path.resolve(__dirname, 'src/databindjs/')
        }
    },
    module: {
        rules: [{
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            test: /\.tsx?$/, loader: 'ts-loader', options: {
                configFile: 'tsconfig.json'
            }
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
        }, {
            test: /\.s[ac]ss$/i,
            use: [
                // Creates `style` nodes from JS strings
                'style-loader',
                // Translates CSS into CommonJS
                'css-loader',
                // Compiles Sass to CSS
                'sass-loader'
            ]
        }, {
            test: /\.svg$/,
            loader: 'file-loader'
        }, {
            test: /\.woff$/,
            loader: 'file-loader'
        }, {
            test: /\.ttf$/,
            loader: 'file-loader'
        }, {
            test: /\.eot$/,
            loader: 'file-loader'
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
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ]
};
