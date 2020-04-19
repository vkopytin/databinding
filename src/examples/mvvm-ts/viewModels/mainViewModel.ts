import { Base } from '../base/base';
import { TodosModel } from '../models';
import { TodoViewModelItem } from './';
import utils = require('../utils');


class MainViewModel extends Base<MainViewModel['state']> {
    state = {
        title: '',
        items: [] as TodoViewModelItem[]
    }
    createNewItemCommand = { exec: () => this.createNewItem() };
    toggleAllCompleteCommand = {
        canExecute: () => !this.areAllComplete(),
        exec: () => this.toggleAllCompleteCommand.canExecute() && this.markAllComplete()
    };
    offChangeItems;

    constructor() {
        super(
            'change:title',
            'change:items'
        );
        this.initialize();
    }

    initialize() {
        const todos = TodosModel.instance();
        this.offChangeItems = todos.on('change:items', () => {
            this.populateItems();
        });
    }

    populateItems() {
        const todos = TodosModel.instance();
        this.prop('items', utils.map(todos.getItems(), item => new TodoViewModelItem(item)));
    }

    createNewItem() {
        const model = TodosModel.instance();
        model.createTodo(this.prop('title'));
        this.prop('title', '');
    }

    markAllComplete() {
        utils.map(this.prop('items'), m => m.complete(true));
    }
    
    areAllComplete() {
        if (!this.prop('items').length) {
            return false;
        }
        return !utils.find(this.prop('items'), i => !i.getIsComplete());
    }
}

export { MainViewModel };
