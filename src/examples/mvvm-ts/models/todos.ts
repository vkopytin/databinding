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

    async createTodo(title) {
        const result = await this.adapter.createTodo(title);
        await this.fetch();
    }

    async updateTodo(item: ITodoItem) {
        const { id, ...attrs } = item;
        const result = await this.adapter.updateTodo(id, attrs);
        await this.fetch();
    }

    async deleteTodo(item: ITodoItem) {
        const { id } = item;
        const result = await this.adapter.deleteTodo(id);
        await this.fetch();
    }
}

export { TodosModel };