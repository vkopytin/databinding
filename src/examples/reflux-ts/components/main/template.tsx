/** @jsx el */
import { el } from '../../virtualDom';
import { connect } from '../../connect';
import { className as cn } from '../../utils';
import { TodoListView } from '../../controls/todoListView';
import { TodoListViewItem } from '../todoItem';
import { selectMain } from '.';


const ENTER_KEY = 13;

function mapStateToProps(state, props) {
    const newState = {
        ...props,
        ...selectMain(state),
        onKeypress(evnt) {
            if (evnt.which === ENTER_KEY) {
                newState.createNewItemCommand();
            }
        }
    };
    return {
        ...newState,
        errors: {
            main: newState.error,
            todos: state.todos && state.todos.error
        }
    };
}

function mapDispatchToProps(dispatch, props) {
    return {
        dispatch: dispatch
    };
}

export const MainView = connect(mapStateToProps, mapDispatchToProps)(({ dispatch, ...props } = {} as any) => <main>
    <TodoListView items={props.errors}>
    </TodoListView>
    <section className="todoapp device-content">
        <header className="bar bar-nav">
            <button className={cn('btn pull-left ?active', props.toggleAllActive)}>
                <input className="toggle-all hidden" id="toggle-all" type="checkbox"
                    defaultChecked={!!props.toggleAllActive}
                    onClick={e => props.markAllCompletedCommand.exec()}
                />
                <label htmlFor="toggle-all">Complete All</label>
            </button>
            <button className={cn('clear-completed btn pull-right ?hidden', props.showClearCompleted)}
                onClick={e => props.clearCompletedCommand.exec()}
            >Clear completed</button>
            <div className="filters segmented-control">
                <a className={cn("control-item ?active", !props.activeFilter)} href="#/">All</a>
                <a className={cn("control-item ?active", props.activeFilter === 'active')} href="#/active">Active</a>
                <a className={cn("control-item ?active", props.activeFilter === 'completed')} href="#/completed">Completed</a>
            </div>
        </header>
        <section className="bar bar-standard bar-header-secondary">
            <form onSubmit={e => e.preventDefault()}>
                <input className="new-todo" type="search" placeholder="What needs to be done?"
                    value={props.newTodoTitle}
                    onInput={e => props.updateNewTodoTitleCommand(e.target['value'])}
                    onKeyPress={e => props.onKeypress(e)}
                />
            </form>
        </section>
        <footer className={cn('footer bar bar-standard bar-footer ?hidden', props.hasTodos)}>
            <span className="todo-count title">
                <strong>{props.todoCount}</strong>&nbsp;
            {props.manyTasks
                    ? <span className="items-word">items</span>
                    : <span className="item-word">item</span>
                }
            &nbsp;left from&nbsp;
            <span className="total">{props.totalText}</span>
            </span>
        </footer>
        <section className={cn('content ?hidden', props.hasTodos)}>
            <TodoListView items={props.items}>
                {item => TodoListViewItem(item)}
            </TodoListView>
            <footer className="info content-padded">
                <p>Double-click to edit a todo</p>
            </footer>
        </section>
    </section>
</main>);
