import utils = require('./utils');
import { MainView } from './views';
import { MainViewModel } from './viewModels';


MainView.prototype.getViewModel = function () {
    return utils.current(MainViewModel);
};


const template = data => `<div class="application">Loading...</div>`;

class App {
    static run() {
        utils.html(document.body, template({}));
        const main = new MainView({
            el: utils.el('.application')
        });
        main.initialize();
    }
}

setTimeout(() => {
    App.run();
});
