import * as BB from 'backbone';
import { Todo } from '../models/todo';
import { LocalStorage } from '../libs/localStorage';


class Todos extends BB.Collection<Todo> {
    // Reference to this collection's model.
    constructor(attrs?, options = {}) {
        super(attrs, {
            model: Todo,
            // Todos are sorted by their original insertion order.
            comparator: 'order',
            ...options
        });
    }

    // Save all of the todo items under this example's namespace.
    localStorage = new LocalStorage('todos-backbone');

    // Filter down the list of all todo items that are finished.
    completed() {
        return this.where({completed: true});
    }

    // Filter down the list to only todo items that are still not finished.
    remaining() {
        return this.where({completed: false});
    }

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder() {
        return this.length ? this.last().get('order') + 1 : 1;
    }
}

export { Todos };
