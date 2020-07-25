/** @jsx el */
import { el } from '../../virtualDom';
import { connect } from '../../connect';
import { className as cn } from '../../utils';
import { TodoListView } from '../../controls/todoListView';
import { TodoListViewItem } from '../todoItem';
import { selectMain } from '.';
import { Actions } from '../';
import { bindActions } from '../../bindActions';


const ENTER_KEY = 13;

function mapStateToProps(state, props: {
    error;
    showClearCompleted;
    activeFilter;
    hasTodos;
    items;
    completeItems;
    activeItems;
    totalText;
    todoCount;
    manyTasks;
}) {
    const newState = {
        ...props,
        ...selectMain(state)
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
    const actions = bindActions(Actions, dispatch);
    return {
        dispatch: dispatch,
        onKeypress(evnt) {
            if (evnt.which === ENTER_KEY) {
                actions.uiCreateTodo();
            }
        },
        ...actions
    };
}

export const MainView = connect(mapStateToProps, mapDispatchToProps)(({ dispatch, ...props } = {

} as ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>) => <main>
    <section className="todoapp device-content">
        <header className="bar bar-nav">
            <button className={cn('btn pull-left ?active', props.toggleAllComplete)}>
                <input className="toggle-all hidden" id="toggle-all" type="checkbox"
                    defaultChecked={!!props.toggleAllComplete}
                    onClick={e => props.uiToggleAllComplete(e.target['checked'])}
                />
                <label htmlFor="toggle-all">Complete All</label>
            </button>
            <button className={cn('clear-completed btn pull-right ?hidden', props.showClearCompleted)}
                onClick={e => props.uiClearCompleted()}
                >Clear completed</button>
            <hr/>
            <div className="filters segmented-control">
                <a className={cn("control-item ?active", !props.activeFilter)} href="#/"
                    onClick={evnt => props.uiSetActiveFilter('all')}
                    >All</a>
                    &nbsp;•&nbsp;
                <a className={cn("control-item ?active", props.activeFilter === 'active')} href="#/active"
                    onClick={evnt => props.uiSetActiveFilter('active')}
                    >Active</a>
                    &nbsp;•&nbsp;
                <a className={cn("control-item ?active", props.activeFilter === 'completed')} href="#/completed"
                    onClick={evnt => props.uiSetActiveFilter('complete')}    
                    >Completed</a>
            </div>
        </header>
        <hr/>
        <section className="bar bar-standard bar-header-secondary">
            <form onSubmit={e => e.preventDefault()}>
                <input className="new-todo" type="search" placeholder="What needs to be done?"
                    value={props.newTodoTitle}
                    onInput={e => props.uiUpdateNewTodoTitle(e.target['value'])}
                    onKeyPress={e => props.onKeypress(e)}
                />
            </form>
        </section>
        <hr/>
        <footer className={cn('footer bar bar-standard bar-footer ?hidden', props.hasTodos)}>
            <span className="todo-count title">
                <strong>{props.activeItems ? props.activeItems.length : 0}</strong>&nbsp;
            {!(props.activeItems && props.activeItems.length === 1)
                    ? <span className="items-word">items</span>
                    : <span className="item-word">item</span>
                }
            &nbsp;left from&nbsp;
            <span className="total">{props.items ? props.items.length : 0}</span>
            </span>
        </footer>
        <section className={cn('content ?hidden', props.hasTodos)}>
                <TodoListView items={
                    props.activeFilter === 'complete'
                        ? props.completeItems
                        : props.activeFilter === 'active'
                            ? props.activeItems
                            : props.items
                }>
                {item => TodoListViewItem(item)}
            </TodoListView>
            <footer className="info content-padded">
                <p>Click to edit a todo</p>
            </footer>
        </section>
    </section>
</main>);
