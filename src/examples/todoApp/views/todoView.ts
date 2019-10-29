import * as BB from 'backbone';
import * as _ from 'underscore';
import { ESC_KEY, ENTER_KEY } from '../consts';
import { Todo } from '../models/todo';
import template = require('../templates/todo.mustache');
import { bindTo, unbindFrom, updateLayout } from '../../../databinding';


class TodoView extends BB.View<Todo> {
    binding = bindTo(this, () => this.model, {
        '-$(.view label).text': '.$(.edit).val',
        '$(.edit).val': 'get(title)',
        '$(.toggle).checked': 'get(completed)',
        '-isCompleted': 'get(completed)',
        '-$(.edit).keypress': '.bind(updateOnEnter)',
        '-$(label).dblclick': '.bind(edit)',
        '-$(.destroy).click': '.bind(clear)',
        '-$(.edit).keydown': '.bind(revertOnEscape)',
        '-$(.edit).blur': '.bind(close)'
    });

    getTodoFilter = () => '';
    prevChanges = {};

    constructor(options = {
        ...{} as BB.ViewOptions<Todo>,
        getTodoFilter() { return '' }
    }) {
        super({
            //... is a list tag.
            tagName: 'li',
            ...options
        });
        this.getTodoFilter = options.getTodoFilter;
    }

    isCompleted(value) {
        const oldValue = this.$el.hasClass('completed');
        if (arguments.length && oldValue !== value) {
            this.$el.toggleClass('completed', value);

            this.trigger('propertyChange', {
                propName: 'isCompleted'
            });
        }
        return oldValue;
    }

    // The TodoView listens for changes to its model, re-rendering. Since
    // there's a one-to-one correspondence between a **Todo** and a
    // **TodoView** in this app, we set a direct reference on the model for
    // convenience.
    initialize() {
        this.listenTo(this.model, 'destroy', this.remove);
        this.listenTo(this.model, 'visible', this.toggleVisible);
        this.listenTo(this.model, 'change:completed', this.saveOnCheck);
        //this.listenTo(this.model, 'change', () => console.log(this.model.toJSON()));
    }

    toggleVisible() {
        this.$el.toggleClass('hidden', this.isHidden());
    }

    isHidden() {
        return this.model.get('completed')
            ? this.getTodoFilter() === 'active'
            : this.getTodoFilter() === 'completed';
    }

    // Toggle the `"completed"` state of the model.
    saveOnCheck() {
        this.model.save();
    }

    // Switch this view into `"editing"` mode, displaying the input field.
    edit() {
        this.prevChanges = this.model.toJSON();
        var textLength = ('' + this.$('.edit').val()).length;
        this.$el.addClass('editing');
        this.$('.edit').focus();
        (this.$('.edit').get(0) as any).setSelectionRange(textLength, textLength);
    }

    // Close the `"editing"` mode, saving changes to the todo.
    close() {
        var value = '' + this.$('.edit').val();
        var trimmedValue = value.trim();

        // We don't want to handle blur events from an item that is no
        // longer being edited. Relying on the CSS class here has the
        // benefit of us not having to maintain state in the DOM and the
        // JavaScript logic.
        if (!this.$el.hasClass('editing')) {
            return;
        }

        if (trimmedValue) {
            this.model.save({ title: trimmedValue });
        } else {
            this.clear();
        }

        this.$el.removeClass('editing');
    }

    // If you hit `enter`, we're through editing the item.
    updateOnEnter(e) {
        if (e.which === ENTER_KEY) {
            this.close();
        }
    }

    // If you're pressing `escape` we revert your change by simply leaving
    // the `editing` state.
    revertOnEscape(e) {
        if (e.which === ESC_KEY) {
            this.$el.removeClass('editing');
            // Also reset the hidden input back to the original value.
            this.cancelChanges();
        }
    }

    cancelChanges() {
        this.model.set(this.prevChanges);
    }

    remove() {
        unbindFrom(this.binding);
        return super.remove();
    }

    // Remove the item, destroy the model from *localStorage* and delete its view.
    clear() {
        this.model.destroy();
    }

    // Re-render the titles of the todo item.
    render() {
        this.$el.html(template(this.model.toJSON()));
        updateLayout(this.binding);
        //dispatch(this.binding, { propName: 's' });

        return this;
    }
}

export { TodoView };
