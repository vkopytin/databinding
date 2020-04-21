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

    async updateTitle(title) {
        const todosModel = TodosModel.instance();
        await todosModel.updateTodo({
            ...this.item,
            title: title
        });
        todosModel.fetch();
    }

    async complete(isComplete) {
        const todosModel = TodosModel.instance();
        await todosModel.updateTodo({
            ...this.item,
            complete: isComplete
        });
        todosModel.fetch();
    }

    async remove() {
        const todosModel = TodosModel.instance();
        await todosModel.deleteTodo(this.item);
        todosModel.fetch();
    }

}

export { TodoViewModelItem };
