/** @jsx el */
import { el } from '../virtualDom';
import { connect } from '../connect';


export const TodoListView = ({ items = [] }) => <ul>
    {items.map(item => el('li', {}, '' + item))}
</ul>;
