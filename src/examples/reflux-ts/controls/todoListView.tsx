/** @jsx el */
import { el } from '../virtualDom';

const map = (items, fn) => {
    const res = [];
    for (let key in items) {
        if (items.hasOwnProperty(key)) {
            res.push(fn(items[key], key));
        }
    }
    return res;
}

export const TodoListView = ({ items = [], children = item => '' + item }: {items: [], children?}) => <ul>
    {map(items, item => el('li', {}, children(item)))}
</ul>;
