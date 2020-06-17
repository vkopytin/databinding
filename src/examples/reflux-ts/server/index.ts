import fs = require('fs');
import https = require('https');
import { app } from './main';


// tslint:disable-next-line: no-console
const warn = (...args) => console.log(...args);

const privateKey  = fs.readFileSync('./selfsigned.key', 'utf8');
const certificate = fs.readFileSync('./selfsigned.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate };

let httpsServer = null;
const options = {
    NODE_ENV: process.env.NODE_ENV,
    SPORT: process.env.SERVER_SPORT || 8080
};

try {
    httpsServer = https.createServer(credentials, app);
    httpsServer.listen(options.SPORT, () => {
        warn('The server is running in port localhost: ', options.SPORT);
    });
} catch (ex) {
    setTimeout(() => { throw ex; });
}

if (process.env.NODE_ENV === 'development') {
    let currentApp = app;

    if ((module as any).hot) {
        const newApp = require('./main').app;
        (module as any).hot.accept('./index.ts', () => {
            httpsServer.removeListener('request', currentApp);
            httpsServer.on('request', newApp);
            currentApp = newApp;
        });
        (module as any).hot.accept('./main.ts', () => {
            httpsServer.removeListener('request', currentApp);
            httpsServer.on('request', newApp);
            currentApp = newApp;
        });
    }
}
