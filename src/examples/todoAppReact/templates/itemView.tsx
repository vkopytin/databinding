import * as React from 'react';
import { TodoListViewItem } from '../views/todoListViewItem';


const tc = (a, b) => b ? a : '';

export const template = (view: TodoListViewItem, ref) => <li ref={ref} className={[
    tc('completed', view.state.completed),
    tc('editing', view.state.editing),
    tc('hidden', view.state.hidden)
].join(' ')}>
    <div className="view">
        <input className="toggle" type="checkbox" checked={view.state.completed} onChange={e => view.prop('completed', e.target['checked'])} />
        <label onDoubleClick={e => view.edit()}>{view.prop('labelTitle')}</label>
        <button className="destroy" onClick={e => view.clear()}></button>
    </div>
    <input ref={el => view.editInput = el} className="edit" value={view.state.editTitle}
        onChange={e => view.prop('editTitle', e.target['value'])}
        onKeyPress={e => view.updateOnEnter(e)}
        onKeyDown={e => view.revertOnEscape(e)}
        onBlur={e => view.close()}
    />
</li>;
