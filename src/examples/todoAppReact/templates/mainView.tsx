import * as React from 'react';
import { TodoListView } from '../views/todoListView';
import { MainView } from '../views/mainView';
import { addBindingTo, utils } from 'databindjs';


const cn = utils.className;

const dataBind = (binding, declaration: string) => {
    const nameAndBindings = /(.*)\{(.*)\}/g.exec(declaration);
    const name = nameAndBindings[1];
    const bindings = utils.reduce(nameAndBindings[2].split(/\s*,\s*/g), (res, p) => {
        const pair = p.split(/\s*=\s*/g);
        res[`${name}.${pair[0]}`] = pair[1];

        return res;
    }, {});
    const key = utils.first(Object.keys(bindings));
    const bindInfo = addBindingTo(binding, { [key]: bindings[key] });
    const itemTi = bindInfo.root.itemTi;
    const pi = itemTi.getProperty(bindInfo.root.propName);

    return {
        ref: e => pi.setValue(bindInfo.root.item, e),
        value: bindInfo.last.value || '',
        onChange: e => bindInfo.last.onChange(e.target, bindInfo.last.propName)
    };
}

export const template = (view: MainView, ref) => <main ref={ref}>
    <section className="todoapp device-content">
        <header className="bar bar-nav">
            <button className={cn('btn pull-left ?active', view.prop('toggleAllActive'))}>
                <input className="toggle-all hidden" id="toggle-all" type="checkbox"
                    defaultChecked={!!view.prop('toggleAllActive')}
                    onClick={e => view.markAllCompletedCommand.exec()}
                />
                <label htmlFor="toggle-all">Complete All</label>
            </button>
            <button className={cn('clear-completed btn pull-right ?hidden', view.prop('showClearCompleted'))}
                onClick={e => view.clearCompletedCommand.exec()}
            >Clear completed</button>
            <div className="filters segmented-control">
                <a className="control-item active" href="#/">All</a>
                <a className="control-item" href="#/active">Active</a>
                <a className="control-item" href="#/completed">Completed</a>
            </div>
        </header>
        <section className="bar bar-standard bar-header-secondary">
            <form onSubmit={e => e.preventDefault()}>
                <input className="new-todo" type="search" placeholder="What needs to be done?"
                    //value={view.prop('newTodoTitle')}
                    //onChange={e => view.prop('newTodoTitle', e.target['value'])}
                    {...dataBind(view.binding, "newTodo{val=newTodoTitle}")}
                    onKeyPress={e => view.onKeypress(e)}
                />
            </form>
        </section>
        <footer className={cn('footer bar bar-standard bar-footer ?hidden', view.prop('hasTodos'))}>
            <span className="todo-count title">
                <strong>{view.prop('todoCount')}</strong>&nbsp;
                {view.prop('manyTasks')
                    ? <span className="items-word">items</span>
                    : <span className="item-word">item</span>
                }
                &nbsp;left from&nbsp;
                <span className="total">{view.prop('totalText')}</span>
            </span>
        </footer>
        <section className={cn('content ?hidden', view.prop('hasTodos'))}>
            <TodoListView ref={v => view.itemsListView = v} />
            <footer className="info content-padded">
                <p>Double-click to edit a todo</p>
                <p>Written by <a href="https://github.com/addyosmani">Addy Osmani</a></p>
                <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
            </footer>
        </section>
    </section>
</main>;
