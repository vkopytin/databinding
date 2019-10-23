import template = require('../templates/mainView.mustache');
import { $ } from 'backbone';
import { bindTo, unbindFrom, dispatch, updateLayout } from '../../databinding';
import { MainViewModel } from '../viewModels/mainViewModel';
import { TodoListView } from './todoListView';


const ENTER_KEY = 13;

interface MainView extends ReturnType<typeof initialize$MainView> {

}

function initialize$MainView<T>(inst: T, $el) {
    return Object.assign(inst, {
        $newTodo: $('.new-todo', $el),
        $total: $('.total', $el),
        itemsListView: new TodoListView({
            $el: $('.todo-list', $el)
        }),
        $main: $('.main', $el),
        $footer: $('.footer', $el),
        $toggleAll: $('.toggle-all', $el),
        $todoCount: $('.todo-count strong', $el),
        $todoCompleted: $('.clear-completed', $el),
        $itemWord: $('.item-word', $el),
        $itemsWord: $('.items-word', $el)
    });
}

class MainView {
    options = this.initOptions(this.config);
    $el = this.options.$el;
    createNewItem = null as { exec(); };

    binding = bindTo(this, () => new MainViewModel(), {
        '$total.text': 'items.length',
        '-$main.addClass(hidden)': 'items.length',
        '-$footer.toggleClass(hidden)': 'items.length|not',
        '-$toggleAll.prop(checked)': 'remaining.length|not',
        '-$todoCount.text': 'remaining.length',
        '-$clearCompleted.toggleClass(hidden)': 'completed.length|not',
        '-$itemWord.toggleClass(hidden)': 'remaining.1|bool',
        '-$itemsWord.toggleClass(hidden)': 'remaining.1|not',
        '$newTodo.val': 'newTodoTitle',
        'itemsListView.items': 'items',
        '-$newTodo.keypress': '.bind(onKeypress)',
        '-createNewItem': 'createNewItemCommand'
    });

    constructor(public config = {}) {
        this.initialize();
    }

    initialize() {
        this.$el.html(template());
        initialize$MainView(this, this.options.$el);

        updateLayout(this.binding);
    }

    initOptions(options = {}) {
        const defOptions = {
            $el: $('body')
        }
        return {
            ...defOptions,
            ...options
        };
    }

    onKeypress(evnt) {
        if (evnt.which === ENTER_KEY && ('' + this.$newTodo.val()).trim()) {
            this.createNewItem.exec();
        }
    }
}

export { MainView };
