/** @jsx el */
import { el } from '../../virtualDom';
import { connect } from '../../connect';
import { className as cn } from '../../utils';
import { selectLabelTitle, selectCurrentItem, selectEditTitle } from './';


const ENTER_KEY = 13;
export const ESC_KEY = 27;

function mapStateToProps(state, props) {
    const newState = {
        ...props,
        labelTitle: selectLabelTitle(props),
        editTitle: selectEditTitle(props),
        ...selectCurrentItem(state),
        updateOnEnter(evnt) {
            if (evnt.which === ENTER_KEY) {
                newState.updateTodoTitleCommand(newState.currentItemId, evnt.target['innerText']);
                newState.setCurrentItemCommand(null);
            }
        },
        revertOnEscape(e) {
            if (e.which === ESC_KEY) {
                newState.setCurrentItemCommand(null);
                //this.cancelChanges();
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
    currentItemId,
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
}) => <div className={cn(
    'table-view-cell', 'media', 'completed?', 'editing?', 'hidden?',
    completed, currentItemId, hidden
)}>
        <span className="media-object pull-left" style={"display: inline-block;" as any}>
            <input id={`view-${id}`} className="hidden" type="checkbox" checked={completed} onChange={e => setCompletedCommand(id, e.target['checked'])} />
        </span>
        <span className="input-group" style={"display: inline-block; width: 70%;" as any}>
            {currentItemId === id || <label className="view input" style={"padding: 1px 1px 1px 1px;" as any}
                onClick={e => setCurrentItemCommand(id)}
            >{labelTitle}</label>}
            {currentItemId === id && <div className="edit" style={"border: 1px solid grey;outline: none;" as any}
                contentEditable={true}
                onInput={e => updateTodoTitleCommand(id, e.target['innerText'])}
                onKeyPress={e => updateOnEnter(e)}
                onKeyUp={e => revertOnEscape(e)}
                onBlur={e => setCurrentItemCommand(null)}
            >{editTitle}</div>}
        </span>
        <button className="destroy btn icon icon-trash" onClick={e => clear()}  style={"display: inline-block;" as any}>Delete</button>
    </div>
);
