import { dispatch } from '../../databinding';
import { Events } from '../../databinding/events';
import { TodoItem } from '../viewModels/todoItem';
import { TodoService } from '../models/todos';
import * as utils from '../../utils';


class MainViewModel extends Events {
    todoTitle = '';
    iItems = [] as TodoItem[];
    varFilterBy = '/';
    varFilterItems = (i) => true;
    createNewItemCommand = {
        exec: () => this.createNewItem()
    };

    init = this.fetchData();

    fetchData() {
        const service = TodoService.inst();
        service.list((err, res: Array<{ id; }>) => {
            this.items(utils.map(res, i => {
                const exists = utils.find(this.iItems, item => item.id() === i.id);
                if (exists) {
                    return exists;
                }
                return new TodoItem(i);
            }));
        });
    }

    newTodoTitle(value) {
        if (arguments.length > 0) {
            this.todoTitle = value;
            this.trigger('change:newTodoTitle');
        }
        return this.todoTitle;
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
        this.addItem(new TodoItem({
            completed: false,
            title: this.todoTitle
        }));
        this.newTodoTitle('');
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
            switch (val) {
                case 'active':
                    this.filterItems(i => !i.completed());
                    break;
                case 'completed':
                    this.filterItems(i => i.completed());
                    break;
                default:
                    this.filterItems(i => true);
            }
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
}

export { MainViewModel };
