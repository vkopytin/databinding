import * as React from 'react';
import { TodoListView } from '../views/todoListView';
import { MainView } from '../views/mainView';


const tc = (a, b) => b ? a : '';

export const template = (view: MainView, ref) => <div ref={ref}>
    <section className="todoapp">
        <header className="header">
            <h1>todos</h1>
            <input className="new-todo" placeholder="What needs to be done?"
                value={view.prop('newTodoTitle')}
                onChange={e => view.prop('newTodoTitle', e.target['value'])}
                onKeyPress={e => view.onKeypress(e)}
            />
        </header>
        <section className={[
            "main",
            tc('hidden', view.prop('hasTodos'))
        ].join(' ')}>
            <input className="toggle-all" id="toggle-all" type="checkbox"
                defaultChecked={view.prop('toggleAllActive')}
                onClick={e => view.markAllCompletedCommand.exec()}
            />
            <label htmlFor="toggle-all">Mark all as complete</label>
            <TodoListView ref={v => view.itemsListView = v} className="todo-list" />
        </section>
        <footer className={[
            "footer",
            tc('hidden', view.prop('hasTodos'))
        ].join(' ')}>
            <span className="todo-count">
                <strong>{view.prop('todoCount')}</strong>&nbsp;
                {view.prop('manyTasks')
                    ? <span className="items-word">items</span>
                    : <span className="item-word">item</span>
                }
                &nbsp;left from&nbsp;
                <span className="total">{view.prop('totalText')}</span>
            </span>
            <ul className="filters">
                <li>
                    <a className="selected" href="#/">All</a>
                </li>
                <li>
                    <a href="#/active">Active</a>
                </li>
                <li>
                    <a href="#/completed">Completed</a>
                </li>
            </ul>
            <button className={[
                "clear-completed",
                tc('hidden', view.prop('showClearCompleted'))
            ].join(' ')}
            onClick={e => view.clearCompletedCommand.exec()}
            >Clear completed</button>
        </footer>
    </section>
    <footer className="info">
        <p>Double-click to edit a todo</p>
        <p>Written by <a href="https://github.com/addyosmani">Addy Osmani</a></p>
        <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
    </footer>
</div>;
