import * as $ from 'jquery';
import { template } from '../templates/main';
import { bindTo, updateLayout } from 'databindjs';
import { MainViewModel } from '../viewModels';
import { Base } from '../base/base';


function initialize$MainView<T>(inst: T, el) {
    return Object.assign(inst, {
        $editor: $('.editor', el),
        $html: $('.html-editor', el),
        $save: $('.save', el)
    });
}

interface MainView extends ReturnType<typeof initialize$MainView> {

}

class MainView {
    options = this.initOptions(this.config);
    $el = $(this.options.el);

    binding = bindTo(this, () => this.getViewModel(), {
        '$editor.html': 'prop(html)',
        '$html.prop(value)': 'prop(html)',
        '-$save.click': 'bind(saveCommand)'
    });

    constructor(public config: ReturnType<MainView['initOptions']>) {
        this.initialize();
    }

    getViewModel(): MainViewModel {
        throw new Error('Not implemented');
    }

    initOptions(options = {}) {
        const defOptions = {
            el: null
        };

        return {
            ...defOptions,
            ...options
        };
    }

    initialize() {
        const html = template({});
        this.$el.html(html);
        initialize$MainView(this, this.$el);
        updateLayout(this.binding);
    }
}

export { MainView };
