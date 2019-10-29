import { Events } from '../../../databinding/events';
import * as  utils from '../../../utils';
import { TodoService } from '../models/todos';


class TodoItem extends Events {
    options = this.initOptions(this.config);

    constructor(public config = {}) {
        super();
    }

    initOptions(options = {}) {
        const defOptions = {
            title: '',
            completed: false
        };
        return {
            ...defOptions,
            ...options as {
                id?: number;
            }
        };
    }

    id() {
        return this.options.id;
    }

    completed(val?) {
        if (arguments.length && this.options.completed !== val) {
            this.options.completed = val;
            this.update({
                completed: val
            });
            this.trigger('change:completed');
        }

        return this.options.completed;
    }

    title(val?) {
        if (arguments.length && this.options.title !== val) {
            this.options.title = val;
            this.trigger('change:title');
        }

        return this.options.title;
    }

    fromData(options = {} as Partial<ReturnType<TodoItem['initOptions']>>) {
        utils.forEach(Object.keys(options), key => {
            if (key in this) {
                this[key](options[key]);
            }
        });
    }

    toJSON() {
        return {
            ...this.options
        };
    }

    destroy() {
        const service = TodoService.inst();
        service.remove(this.options.id, (err, res) => {
            this.trigger('remove');
        });
    }

    update(options = {}) {
        const service = TodoService.inst();
        service.update(this.options.id, {
            ...this.options,
            ...options
        }, (err, res) => {
            this.trigger('update');
        });
    }
}

export { TodoItem };
