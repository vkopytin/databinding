/** @jsx el */
import { el } from '../../virtualDom';
import { connect } from '../../connect';
import { className as cn } from '../../utils';
import { selectLabelTitle, selectCurrentItem } from './';


const ENTER_KEY = 13;

function mapStateToProps(state, props) {
    const newState = {
        ...props,
        labelTitle: selectLabelTitle(props),
        ...selectCurrentItem(state),
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

export const TodoListViewItem = connect(mapStateToProps, mapDispatchToProps)(({
    completed,
    editing,
    hidden,
    id,
    setCompletedCommand,
    setCurrentItemCommand,
    labelTitle,
    editTitle,
    updateTodoTitleCommand,
    updateOnEnter,
    revertOnEscape,
    close,
    clear
}) => <li className={cn(
    'table-view-cell', 'media', 'completed?', 'editing?', 'hidden?',
    completed, editing, hidden
)}>
    <span className="media-object pull-left">
        <input id={`view-${id}`} className="hidden" type="checkbox" checked={completed} onChange={e => setCompletedCommand(id, e.target['checked'])} />
        <label htmlFor={`view-${id}`} className="toggle view">
            <div className="toggle-handle"></div>
        </label>
    </span>
    <div className="media-body">
        <div className="input-group">
            <label className="view input" onClick={e => setCurrentItemCommand(id)}>{labelTitle}</label>
            <input type="text" className="edit" value={editTitle}
                onChange={e => updateTodoTitleCommand(id, e.target['value'])}
                onKeyPress={e => updateOnEnter(e)}
                onKeyDown={e => revertOnEscape(e)}
                onBlur={e => close()}
            />
        </div>
    </div>
    <button className="destroy btn icon icon-trash" onClick={e => clear()}></button>
    </li>);
