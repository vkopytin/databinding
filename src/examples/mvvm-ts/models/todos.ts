import { TodosAdapter, ITodoItem } from "../adapters/todos";
import { Base } from "../base/base";


class TodosModel extends Base {
    static inst = null as TodosModel;
    static instance() {
        if (TodosModel.inst === null) {
            TodosModel.inst = new TodosModel();
            TodosModel.inst.fetch();
        }

        return TodosModel.inst;
    }
    adapter = new TodosAdapter();
    items = [] as ITodoItem[];

    constructor() {
        super('change:items');
    }

    getItems() {
        return this.items;
    }

    setItems(val) {
        if (this.items !== val) {
            this.items = val;
            this.trigger('change:items');
        }
    }

    async fetch() {
        const items = await this.adapter.fetchTodos();
        this.setItems(items);
    }

    createTodo(title) {
        return this.adapter.createTodo(title);
    }

    updateTodo(item: ITodoItem) {
        const { id, ...attrs } = item;
        return this.adapter.updateTodo(id, attrs);
    }

    deleteTodo(item: ITodoItem) {
        const { id } = item;
        return this.adapter.deleteTodo(id);
    }
}

export { TodosModel };