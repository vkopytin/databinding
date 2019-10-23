import { MainView } from './views/mainView';
import * as $ from 'jquery';
import './css/main.css';


class App {
    constructor() {
        setTimeout(() => this.initialize());
    }
    initialize() {
        new MainView({ $el: $('body') });
    }
}

new App();
