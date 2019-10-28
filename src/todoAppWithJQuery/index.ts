import * as $ from 'jquery';
import './css/main.css';
import { MainView } from './views/mainView';


class App {
    mainView: MainView = null;
    constructor() {
        setTimeout(() => this.initialize());
    }
    initialize() {
        this.ensureMainView();
        $(window).on('hashchange', (evnt) => this.switchLocation(evnt));
    }
    switchLocation(evnt) {
        this.ensureMainView();
        this.mainView.activeFilter(window.location.hash.replace(/^#\//, ''));
    }
    ensureMainView() {
        if (this.mainView === null) {
            this.mainView = new MainView({
                $el: $('body')
            });
        };
        this.mainView.activeFilter(window.location.hash.replace(/^#\//, ''));
    }
}

new App();
