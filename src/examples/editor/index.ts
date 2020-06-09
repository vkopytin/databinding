import * as _ from 'underscore';
import { MainView } from './views/mainView';
import { MainViewModel } from './viewModels';
import { current } from '../mvvm-ts/utils';
require('./css/index.css');


MainView.prototype.getViewModel = function () {
    return current(MainViewModel);
}

class App {
    static run() {
        new MainView({
            el: document.body
        });
    }
}

_.delay(() => App.run());
