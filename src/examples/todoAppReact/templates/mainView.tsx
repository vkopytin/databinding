import * as React from 'react';
import { TodoListView } from '../views/todoListView';
import { MainView } from '../views/mainView';
import { addBindingTo, utils } from 'databindjs';
import * as $ from 'jquery';


const tc = (a, b) => b ? a : '';

const Bind = (props, config) => {
    const view = props.view;
    const name = props.name;
    const bindInfo = addBindingTo(view.binding, { [name + '.val']: props.val });
    return React.cloneElement(props.children, {
        ref: e => view[name] = $(e),
        value: bindInfo.last.value || '',
        onChange: e => bindInfo.last.onChange($(e.target), 'val')
    });
}

const forEachComponent = (view, component) => {
    const children = React.Children.map(component.props.children, c => React.isValidElement(c) ? forEachComponent(view, c) : c);

    if (component.props['data-bind']) {
        const nameAndBindings = /(.*)\{(.*)\}/g.exec(component.props['data-bind']);
        const name = nameAndBindings[1];
        const bindings = utils.reduce(nameAndBindings[2].split(/\s*,\s*/g), (res, p) => {
            const pair = p.split(/\s*=\s*/g);
            res[`${name}.${pair[0]}`] = pair[1];

            return res;
        }, {});

        return utils.reduce(Object.keys(bindings), (res, key) => {
            const bindInfo = addBindingTo(view.binding, {[key]: bindings[key]});
            const itemTi = bindInfo.root.itemTi;
            const pi = itemTi.getProperty(bindInfo.root.propName);

            return React.cloneElement(res, {
                ...res.props,
                ref: e => pi.setValue(bindInfo.root.item, $(e)),
                value: bindInfo.last.value || '',
                onChange: e => bindInfo.last.onChange($(e.target), bindInfo.last.propName),
                children: children
            });
        }, component);
    }

    return React.cloneElement(component, {
        ...component.props,
        children
    });
}

export const template = (view: MainView, ref) => forEachComponent(view, <main ref={ref}>
    <section className="todoapp device-content">
        <header className="bar bar-nav">
            <button className="btn pull-left">
                <input className="toggle-all hidden" id="toggle-all" type="checkbox"
                    defaultChecked={!!view.prop('toggleAllActive')}
                    onClick={e => view.markAllCompletedCommand.exec()}
                />
                <label htmlFor="toggle-all">Complete All</label>
            </button>
            <button className={[
                "clear-completed",
                "btn", "pull-right",
                tc('hidden', view.prop('showClearCompleted'))
            ].join(' ')}
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
                    data-bind="newTodo{val=newTodoTitle}"
                    onKeyPress={e => view.onKeypress(e)}
                    />
            </form>
        </section>
        <footer className={[
            "footer",
            "bar", "bar-standard bar-footer",
            tc('hidden', view.prop('hasTodos'))
        ].join(' ')}>
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
        <section className={[
            "content",
            tc('hidden', view.prop('hasTodos'))
        ].join(' ')}>
            <TodoListView ref={v => view.itemsListView = v} />
            <footer className="info content-padded">
                <p>Double-click to edit a todo</p>
                <p>Written by <a href="https://github.com/addyosmani">Addy Osmani</a></p>
                <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
            </footer>
        </section>
    </section>
</main>);
