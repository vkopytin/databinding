import * as BB from 'backbone';
import * as _ from 'underscore';


class Todo extends BB.Model {
    // Default attributes for the todo
    // and ensure that each todo created has `title` and `completed` keys.
    defaults() {
        return {
            title: '',
            completed: false
        };
    }

    // Toggle the `completed` state of this todo item.
    toggle() {
        this.save({
            completed: !this.get('completed')
        });
    }
}

export { Todo };
