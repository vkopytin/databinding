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

export const TodoListView = ({ items = [], children = item => '' + item }: {items: [], children?}) => <ul style={"padding: 0px;" as any}>
    {map(items, item => <li style={"list-style: none;" as any}>{children(item)}</li>)}
</ul>;
