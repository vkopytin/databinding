import { ITodoItem } from '../adapters/todos';
import { TodosModel } from '../models';


class TodoViewModelItem {
    completeCommand = { exec: isComplete => this.complete(isComplete) };
    deleteCommand = { exec: () => this.remove() };
    updateTitleCommand = { exec: title => this.updateTitle(title)};

    constructor(public item: ITodoItem) {
    
    }

    getId() {
        return this.item.id;
    }

    getTitle() {
        return this.item.title;
    }

    getIsComplete() {
        return this.item.complete;
    }

    updateTitle(title) {
        const todosModel = TodosModel.instance();
        todosModel.updateTodo({
            ...this.item,
            title: title
        });
    }

    complete(isComplete) {
        const todosModel = TodosModel.instance();
        todosModel.updateTodo({
            ...this.item,
            complete: isComplete
        });
    }

    remove() {
        const todosModel = TodosModel.instance();
        todosModel.deleteTodo(this.item);
    }

}

export { TodoViewModelItem };
