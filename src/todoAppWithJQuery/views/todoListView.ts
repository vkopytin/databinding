import * as $ from 'jquery';
import { bindTo, unbindFrom, updateLayout } from '../../databinding';
import { Events } from '../../databinding/events';
import { TodoListViewItem } from './todoListViewItem';
import * as utils from '../../utils';


class TodoListView extends Events {
    options = this.initOptions(this.config);
    $el = this.options.$el;
    children = [] as TodoListViewItem[];
    filterFn = (i) => true;
    binding = bindTo(this, () => { }, {
        '-event(change:items)': '.bind(updateChildren)',
        '-event(change:filter)': '.bind(drawItems)'
    });

    constructor(public config = {}) {
        super();

        this.initialize();
    }

    initialize() {
        updateLayout(this.binding);
    }

    initOptions(options = {}) {
        const defOptions = {
            $el: $('<ul>'),
            items: [],
            update: () => { }
        };
        return {
            ...defOptions,
            ...options
        };
    }

    filter(fn?) {
        if (arguments.length && fn !== this.filterFn) {
            this.filterFn = fn;
            this.trigger('change:filter');
        }
        return this.filterFn;
    }

    items(value?: any[]) {
        if (arguments.length && value !== this.options.items) {
            this.options.items = value;
            this.trigger('change:items');
        }
        return this.options.items;
    }

    updateChildren() {
        const items = this.items();
        const toRemove = utils.filter(this.children, itemView => !~items.indexOf(itemView.options.item));
        utils.forEach(toRemove, oldItemView => oldItemView.remove());

        this.children = items.map(item => {
            const exists = utils.find(this.children, iv => iv.options.item === item);
            if (exists) {
                return exists;
            }
            return new TodoListViewItem({
                item: item,
                remove: () => {
                    this.options.items = utils.difference(this.options.items, [item]);
                    item.destroy();
                    this.trigger('change:items');
                },
                update: () => {
                    this.options.items = [...this.options.items];
                    this.trigger('change:items');
                }
            });
        });

        this.drawItems();
    }

    drawItems() {
        const children = this.$el.children();
        utils.forEach(this.children, (itemView, index) => {
            const elIndex = children.index(itemView.$el);
            if (elIndex !== index) {
                this.$el.append(itemView.$el);
            }
            itemView.hide(this.filter()(itemView.options.item));
        });
    }
}

export { TodoListView };