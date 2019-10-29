const { spawn } = require('child_process');

const path = require('path');

spawn("tsc", ["-p", "src", "--emitDeclarationOnly", "--declaration", "--declarationDir", "lib/index.d.ts", "--skipLibCheck"]);

module.exports = {
    mode: 'production',
    entry: './src/databinding/index.ts',
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
    }
};
