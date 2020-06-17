const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.dev.config')

const ip = process.env.APP_IP || '0.0.0.0'
const port = (+process.env.SERVER_PORT) || 8080

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    watchOptions: {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/
    },
    overlay: false,
    host: ip,
    stats: 'normal',
    historyApiFallback: true,
    https: true,
    contentBase: 'public',
    compress: true,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    before: function (app, server, compiler) {
        app.get('/some/path', function (req, res) {
            res.json({ custom: 'response' });
        });
    }
}).listen(port, ip, function (err) {
    if (err) {
        return console.log(err)
    }

    console.log(`Listening at https://${ip}:${port}`)
});
