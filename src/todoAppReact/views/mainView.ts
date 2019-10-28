import { Component, createRef } from 'react';
import * as ReactDOM from 'react-dom';
import { template } from '../templates/mainView';
import { bindTo, updateLayout, unbindFrom, subscribeToChange, toStateObject } from '../../databinding';
import * as $ from 'jquery';
import { MainViewModel } from '../viewModels/mainViewModel';
import { ENTER_KEY, ESC_KEY } from '../consts';
import { withEvents } from '../../databinding/events';
import { TodoListView } from '../views/todoListView';


interface MainView extends ReturnType<typeof initialize$MainView> {

}

function initialize$MainView<T>(inst: T, $el) {
    return Object.assign(inst, {
        $newTodo: $('.new-todo', $el),
        $total: $('.total', $el),
        $main: $('.main', $el),
        $footer: $('.footer', $el),
        $toggleAll: $('.toggle-all', $el),
        $todoCount: $('.todo-count strong', $el),
        $itemWord: $('.item-word', $el),
        $itemsWord: $('.items-word', $el),
        $clearCompleted: $('.clear-completed', $el)
    });
}

class MainView extends withEvents(Component)<any, any> {
    ref = createRef();
    createNewItem = null as { exec(); };
    markAllCompletedCommand = null as { exec(); };
    clearCompletedCommand = null as { exec(); };
    todoFilter = '/';
    itemsListView: TodoListView = null;
    state = {
        total: 0,
        todoCount: 0,
        hasTodos: false,
        toggleAllActive: false,
        manyTasks: false,
        newTodoTitle: ''
    };

    binding = bindTo(this, () => new MainViewModel(), {
        'prop(totalText)': 'items.length',
        'prop(hasTodos)': 'items.length|not',
        '-prop(toggleAllActive)': 'remaining.length|not',
        '-prop(todoCount)': 'remaining.length',
        '-prop(showClearCompleted)': 'completed.length|not',
        '-prop(manyTasks)': 'remaining.1|bool',
        'prop(newTodoTitle)': 'newTodoTitle',
        'itemsListView.items': 'items',
        'itemsListView.filter': 'filterItems',
        '-createNewItem': 'createNewItemCommand',
        'activeFilter': 'filterBy',
        '-markAllCompletedCommand': 'markAllCompletedCommand',
        '-clearCompletedCommand': 'clearCompletedCommand'
    });

    constructor(props) {
        super(props);
        subscribeToChange(this.binding, () => {
            this.setState({
                ...this.state,
                ...toStateObject({}, this.binding).state
            });
            console.log(this.state);
        });
    }

    componentDidMount() {
        initialize$MainView(this, this.ref.current);
        updateLayout(this.binding);
    }

    componentWillUnmount() {
        unbindFrom(this.binding);
    }

    prop(propName, val?) {
        if (arguments.length > 1) {
            this.state[propName] = val;
            this.trigger('change:prop(' + propName + ')');
        }
        return this.state[propName];
    }

    activeFilter(val?) {
        if (arguments.length && val !== this.todoFilter) {
            this.todoFilter = val;
            $(this.ref.current).find('.filters li a').toggleClass('selected', false);
            $(this.ref.current).find(`.filters li a[href='#/${val}']`).toggleClass('selected', true);
            this.trigger('change:activeFilter');
        }

        return this.todoFilter;
    }

    onKeypress(evnt) {
        if (evnt.which === ENTER_KEY && ('' + this.$newTodo.val()).trim()) {
            this.createNewItem.exec();
        }
    }

    render() {
        return template(this, this.ref);
    }
}

export { MainView };
