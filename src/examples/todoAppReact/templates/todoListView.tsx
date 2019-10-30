import * as React from 'react';
import { TodoListView } from '../views/todoListView';
import { utils } from 'databindjs';
import { TodoListViewItem } from '../views/todoListViewItem';


export const template = (view: TodoListView, ref) => <ul className="todo-list" ref={ref}>
    {utils.reduce(view.state.items, (res, item: { id; }) => view.filter()(item)
        ? [...res, <TodoListViewItem
            key={item.id()}
            item={item}
            update={() => view.updateItem(item)}
            remove={() => view.removeItem(item)}
        />]
        : res,
        [])
    }
</ul>;
