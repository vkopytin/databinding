import * as BB from 'backbone';
import * as $ from 'jquery';
import * as _ from 'underscore';
import { Todo } from '../models/todo';
import { Todos } from '../collections/todos';
import { TodoView } from './todoView';
import { ENTER_KEY } from '../consts';
import template = require('../templates/app.mustache');
import { bindTo, unbindFrom, dispatch, updateLayout } from '../../databinding';


class AppView extends BB.View<Todo> {
    binding = bindTo(this, () => this.collection, {
        '-$(.total).text': 'length',
        '-$(.main).addClass(hidden)': 'length',
        '-$(.footer).toggleClass(hidden)': 'length|not',
        '-$(.toggle-all).prop(checked)': 'remaining.length|not',
        '-$(.todo-count strong).text': 'remaining.length',
        '-$(.clear-completed).toggleClass(hidden)': 'completed.length|not',
        '-$(.item-word).toggleClass(hidden)': 'remaining.1|bool',
        '-$(.items-word).toggleClass(hidden)': 'remaining.1|not',
        '-$(.filters li a:eq(0)).toggleClass(selected)': '.activeFilter.empty',
        '-$(.filters li a:eq(1)).toggleClass(selected)': '.activeFilter.active',
        '-$(.filters li a:eq(2)).toggleClass(selected)': '.activeFilter.completed',
        '-$(.new-todo).keypress': '.bind(createOnEnter)',
        '-$(.clear-completed).click': '.bind(clearCompleted)',
        '-$(.toggle-all).click': '.bind(toggleAllComplete)'
    });

    collection: Todos;
    todoFilter = '';

    constructor(options = {
        todoFilter: ''
    }) {
        super({
            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: '.todoapp',
            ...options
        });
        this.todoFilter = options.todoFilter;
    }

    setTodoFilter(value) {
        if (this.todoFilter !== value) {
            this.todoFilter = value;
            dispatch(this, { propName: 'activeFilter' });
        }
    }

    activeFilter() {
        return {
            active: false,
            completed: false,
            [this.todoFilter || 'empty']: true
        }
    }

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize() {
        this.listenTo(this.collection, 'add', this.addOne);
        this.listenTo(this.collection, 'reset', this.addAll);
        this.listenTo(this.collection, 'change:completed', this.filterOne);
        this.listenTo(this.collection, 'filter', this.filterAll);

        // Suppresses 'add' events with {reset: true} and prevents the app view
        // from being re-rendered for every model. Only renders when the 'reset'
        // event is triggered at the end of the fetch.
        _.delay(() => {
            this.collection.fetch({ reset: true });
            this.render();
        });
    }

    hasItems() {
        return !!this.collection.length;
    }

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne(todo) {
        const view = new TodoView({
            model: todo,
            getTodoFilter: () => this.todoFilter
        });
        this.$('.todo-list').prepend(view.render().el);
    }

    // Add all items in the **Todos** collection at once.
    addAll() {
        this.$('.todo-list').html('');
        this.collection.each(this.addOne, this);
    }

    filterOne(todo) {
        todo.trigger('visible');
    }

    filterAll() {
        this.collection.each(this.filterOne, this);
    }

    // Generate the attributes for a new Todo item.
    newAttributes() {
        return {
            title: ('' + this.$('.new-todo').val()).trim(),
            order: this.collection.nextOrder(),
            completed: false
        };
    }

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter(e) {
        if (e.which === ENTER_KEY && ('' + this.$('.new-todo').val()).trim()) {
            this.collection.create(this.newAttributes());
            this.$('.new-todo').val('');
        }
    }

    // Clear all completed todo items, destroying their models.
    clearCompleted() {
        _.invoke(this.collection.completed(), 'destroy');
        return false;
    }

    toggleAllComplete() {
        const completed = this.$('.toggle-all').is(':checked');

        this.collection.each((todo) => {
            todo.save({
                completed: completed
            });
        });
    }

    remove() {
        unbindFrom(this.binding);
        return super.remove();
    }

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render() {
        this.$('.footer').html(template());
        updateLayout(this.binding);
        //dispatch(this.binding, { propName: 's' });

        return this;
    }
}

export { AppView };
