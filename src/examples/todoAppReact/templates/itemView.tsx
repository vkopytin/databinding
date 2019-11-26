import * as React from 'react';
import { TodoListViewItem } from '../views/todoListViewItem';


const tc = (a, b) => b ? a : '';

export const template = (view: TodoListViewItem, ref) => <li ref={ref} className={[
    "table-view-cell", "media",
    tc('completed', view.state.completed),
    tc('editing', view.state.editing),
    tc('hidden', view.state.hidden)
].join(' ')}>
    <span className="media-object pull-left">
        <input id={'view-' + view.prop('id')} className="hidden" type="checkbox" checked={view.state.completed} onChange={e => view.prop('completed', e.target['checked'])} />
        <label htmlFor={'view-' + view.prop('id')} className="toggle view">
            <div className="toggle-handle"></div>
        </label>
    </span>
    <div className="media-body">
        <div className="input-group">
            <label className="view input" onClick={e => view.edit()}>{view.prop('labelTitle')}</label>
            <input type="text" ref={el => view.editInput = el} className="edit" value={view.state.editTitle}
            onChange={e => view.prop('editTitle', e.target['value'])}
            onKeyPress={e => view.updateOnEnter(e)}
            onKeyDown={e => view.revertOnEscape(e)}
            onBlur={e => view.close()}
            />
        </div>
    </div>
    <button className="destroy btn icon icon-trash" onClick={e => view.clear()}></button>
</li>;
