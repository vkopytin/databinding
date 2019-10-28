import { MainView } from './views/mainView';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './css/main.css';


class App {
    mainView = null;

    constructor() {
        setTimeout(() => this.initialize());
    }
    initialize() {
        const div = document.createElement('div');
        document.body.append(div);
        ReactDOM.render(React.createElement(MainView, {
            ref: (v => this.mainView = v),
            activeFilter: window.location.hash.replace(/^#\//, '')
        }), div);
        window.addEventListener('hashchange', (evnt) => this.switchLocation(evnt));
    }
    switchLocation(evnt) {
        this.mainView.activeFilter(window.location.hash.replace(/^#\//, ''));
    }
}

new App();
