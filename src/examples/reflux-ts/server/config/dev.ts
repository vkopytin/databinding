import express = require('express');
import * as fs from 'fs';
import * as path from 'path';
import webpack = require('webpack');
import webpackConfig = require('../../../../../webpack.dev.config');
import webpackDevMiddleware = require('webpack-dev-middleware');
import webpackHotMiddleware = require('webpack-hot-middleware');
import webpackHot = require('webpack/hot/dev-server');


// tslint:disable-next-line: no-console
const warn = (...args) => console.log(...args);

const devConfig = (app: express.Application) => {
    warn('...starting development mode...');

        const compiler = webpack({
            ...webpackConfig,
            entry: {
                ...webpackConfig.entry,
                main: [
                    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&overlay=false&reload=true',
                    ...webpackConfig.entry.main
                ]
            }
        });
        let devMiddleware;
        app.use(devMiddleware = webpackDevMiddleware(
            compiler, {
            noInfo: true,
            stats: { colors: true },
            watchOptions: {
                aggregateTimeout: 300,
                poll: true
            }
        }));
        const wphmw = webpackHotMiddleware(compiler);
        app.use(wphmw);
        compiler.plugin('done', stats => {
            const versionInfo = JSON.stringify({
                channel: process.env.NODE_ENV,
                css: `app.${stats.hash}.css`,
                vendor: `vendor.${stats.hash}.js`,
                app: `app.${stats.hash}.js`,
                hash: stats.hash,
                publicDir: process.env.PUBLIC_DIR,
                time: stats.time
            }, null, 4);
            fs.writeFile(path.join(__dirname, webpackConfig.output.publicPath, 'version.json'), versionInfo, (err) => {
                if (err) {
                // tslint:disable-next-line: no-console
                console.log(err);
                }
                // tslint:disable-next-line: no-console
                console.log('Successfully Written to version.json');
            });
        });

        app.use(require('webpack-hot-middleware')(compiler));

    return app;
};

export { devConfig };
