import { Base } from '../base/base';
import utils = require('../utils');

interface IListItemView<T> {
    el;
    setViewModel(viewModel: T);
    remove();
}

type ExtractViewModel<P> = P extends IListItemView<infer T> ? T : never;

class ListView<T extends IListItemView<VM>, VM = ExtractViewModel<T>> extends Base<ListView<T, VM>['state']> {
    options = this.initOptions(this.config);
    el = utils.el(this.options.el);
    state = {
        items: [] as ExtractViewModel<T>[],
        children: [] as T[]
    };
    filter = null;
    offChangeItems;
    offChangeFilter;

    constructor(public config: ReturnType<ListView<T, VM>['initOptions']>) {
        super(
            'change:items',
            'change:children',
            'change:filter'
        );
        this.initialize();
    }

    getFilter() {
        return this.filter;
    }

    setFilter(fn: (i: ExtractViewModel<T>) => boolean) {
        if (this.filter !== fn) {
            this.filter = fn;
            this.trigger('change:filter');
        }
    }

    initOptions(options = {}) {
        const defOpts = {
            el: '',
            createItem(props?): T {
                return null;
            }
        };
    
        return {
            ...defOpts,
            ...options
        };
    }

    initialize() {
        this.offChangeItems = this.on('change:items', () => this.drawItems());
        this.offChangeFilter = this.on('change:filter', () => this.drawItems());
    }

    drawItem(viewModel: ExtractViewModel<T>, index: number) {
        const itemViews = this.prop('children');
        const currentView = itemViews[index];
        const itemView = currentView || this.options.createItem();
        if (!currentView) {
            this.prop('children', [...this.prop('children'), itemView]);
            this.el.append(itemView.el);
        }
        itemView.setViewModel(viewModel);
    }

    drawItems() {
        const items = this.filter ? utils.filter(this.prop('items'), this.filter) : this.prop('items'),
            length = items.length,
            firstChildren = utils.first(this.prop('children'), length),
            restChildren = utils.last(this.prop('children'), length);

        this.prop('children', firstChildren);
        for (const itemView of restChildren) {
            itemView.remove();
        }

        for (let i = 0; i < length; i++) {
            const model = items[i];
            this.drawItem(model, i);
        }
    }

    remove() {
        utils.getResult(this, () => this.offChangeItems);
        utils.getResult(this, () => this.offChangeFilter);
        utils.remove(this.el);
    }
}

export { ListView };
