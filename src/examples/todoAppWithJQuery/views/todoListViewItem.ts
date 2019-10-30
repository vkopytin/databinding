import * as $ from 'jquery';
import * as _ from 'underscore';
import { bindTo, Events, unbindFrom, updateLayout } from 'databindjs';
import { ENTER_KEY, ESC_KEY } from '../consts';
import template = require('../templates/itemView.mustache');
import { TodoItem } from '../viewModels/todoItem';


interface TodoListViewItem extends ReturnType<typeof initialize$TodoListViewItem> {

}

function initialize$TodoListViewItem<T>(inst: T, $el) {
    return Object.assign(inst, {
        $label: $('label', $el),
        $edit: $('.edit', $el),
        $toggle: $('.toggle', $el),
        $destroy: $('.destroy', $el)
    });
}

class TodoListViewItem extends Events {
    options = this.initOptions(this.config);
    $el = this.options.$el;
    prevChanges = {};

    binding = bindTo(this, () => this.options.item, {
        '-$label.text': '.$edit.val',
        '$edit.val': 'title',
        '$toggle.checked': 'completed',
        '-$el.toggleClass(completed)': 'completed',
        '-$edit.keypress': '.bind(updateOnEnter)',
        '-$label.dblclick': '.bind(edit)',
        '-$destroy.click': '.bind(clear)',
        '-$edit.keydown': '.bind(revertOnEscape)',
        '-$edit.blur': '.bind(close)',
        '+options.bind(update)': 'event(change:completed)'
    });

    constructor(public config = {}) {
        super();

        this.initialize();
    }

    initialize() {
        this.$el.html(template());
        initialize$TodoListViewItem(this, this.$el);

        updateLayout(this.binding);
    }

    initOptions(options = {}) {
        const defOptions = {
            $el: $('<li/>'),
            item: null as TodoItem,
            remove: () => { 'empty'; },
            update: () => { 'empty'; }
        };
        return {
            ...defOptions,
            ...options
        };
    }

    updateOnEnter(e) {
        if (e.which === ENTER_KEY) {
            this.close();
        }
    }

    edit() {
        this.prevChanges = this.options.item.toJSON();
        const textLength = ('' + this.$edit.val()).length;
        this.$el.addClass('editing');
        this.$edit.focus();
        (this.$edit.get(0) as any).setSelectionRange(textLength, textLength);
    }

    revertOnEscape(e) {
        if (e.which === ESC_KEY) {
            this.$el.removeClass('editing');
            this.cancelChanges();
        }
    }

    cancelChanges() {
        this.options.item.fromData(this.prevChanges);
    }

    close() {
        const value = '' + this.$edit.val();
        const trimmedValue = value.trim();

        if (!this.$el.hasClass('editing')) {
            return;
        }

        if (trimmedValue) {
            this.options.item.update({ title: trimmedValue });
        } else {
            this.clear();
        }

        this.$el.removeClass('editing');
    }

    clear() {
        this.options.remove();
    }

    remove() {
        this.$el.remove();
        unbindFrom(this.binding);
    }

    hide(on) {
        this.$el.toggleClass('hidden', !on);
    }
}

export { TodoListViewItem };
