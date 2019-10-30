import { Component, createRef } from 'react';
import { template } from '../templates/mainView';
import { bindTo, updateLayout, unbindFrom, subscribeToChange, toStateObject, withEvents } from 'databindjs';
import * as $ from 'jquery';
import { MainViewModel } from '../viewModels/mainViewModel';
import { ENTER_KEY } from '../consts';
import { TodoListView } from '../views/todoListView';


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
        });
    }

    componentDidMount() {
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
        if (evnt.which === ENTER_KEY && ('' + this.prop('newTodoTitle')).trim()) {
            this.createNewItem.exec();
        }
    }

    render() {
        return template(this, this.ref);
    }
}

export { MainView };
