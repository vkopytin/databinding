import { Events, utils } from 'databindjs';
import { TodoItem } from '../viewModels/todoItem';
import { TodoService } from '../models/todos';


class MainViewModel extends Events {
    todoTitle = '';
    iItems = [] as TodoItem[];
    varFilterBy = window.location.hash.replace(/^#\//, '');
    varFilterItems = this.newFilterFn(this.varFilterBy);
    createNewItemCommand = {
        exec: () => this.createNewItem()
    };
    markAllCompletedCommand = {
        exec: () => this.markAllCompleted()
    };
    clearCompletedCommand = {
        exec: () => this.clearCompleted()
    }

    init = this.fetchData();

    fetchData() {
        const service = TodoService.inst();
        service.list((err, res: Array<{ id; }>) => {
            this.items([...utils.map(res, i => {
                const exists = utils.find(this.iItems, item => item.id() === i.id);
                if (exists) {
                    exists.fromData(i);
                    return exists;
                }
                return new TodoItem(i);
            })]);
        });
    }

    newTodoTitle(value?) {
        if (arguments.length > 0) {
            this.todoTitle = value;
            this.trigger('change:newTodoTitle');
        }
        return this.todoTitle;
    }

    newFilterFn(val: string) {
        switch (val) {
            case 'active':
                return (i: TodoItem) => !i.completed();
            case 'completed':
                return (i: TodoItem) => i.completed();
            default:
                return (i: TodoItem) => true;
        }
    }

    items(value?: any[]) {
        if (arguments.length && value !== this.iItems) {
            this.iItems = value;
            this.trigger('change:items');
            this.trigger('change:completed');
            this.trigger('change:remaining');
        }
        return this.iItems;
    }

    completed() {
        return utils.filter(this.iItems, i => i.completed());
    }

    remaining() {
        return utils.filter(this.iItems, i => !i.completed());
    }

    createNewItem() {
        if (this.newTodoTitle()) {
            this.addItem(new TodoItem({
                completed: false,
                title: this.todoTitle
            }));
            this.newTodoTitle('');
        }
    }

    addItem(item) {
        const service = TodoService.inst();
        service.create(item.toJSON(), (err, res) => {
            this.fetchData();
        });
    }

    filterBy(val?) {
        if (arguments.length && val !== this.varFilterBy) {
            this.varFilterBy = val;
            this.trigger('change:filterBy');

            const filterFn = this.newFilterFn(val);
            this.filterItems(filterFn);
        }

        return this.varFilterBy;
    }

    filterItems(val?: (i: TodoItem) => boolean) {
        if (arguments.length && val !== this.varFilterItems) {
            this.varFilterItems = val;
            this.trigger('change:filterItems');
        }
        return this.varFilterItems;
    }

    markAllCompleted() {
        const val = !!this.remaining().length;
        utils.forEach(this.iItems, i => i.update({ completed: val }));
        this.fetchData();
    }

    clearCompleted() {
        utils.forEach(this.completed(), i => i.destroy());
        this.fetchData();
    }
}

export { MainViewModel };
