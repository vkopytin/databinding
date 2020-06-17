import utils = require('../../../utils');

export interface ITodoItem {
    id: number;
    title: string;
    complete: boolean;
}

const data = [{
    id: 1,
    title: 'Gather requirements for the ToDo project',
    complete: false
}, {
    id: 2,
    title: 'Clarify tech stack of the ToDo solution',
    complete: true
}, {
    id: 3,
    title: 'Create main ToDo project structure',
    complete: false
}, {
    id: 4,
    title: 'Determine common tasks to implement in the solution',
    complete: true
}, {
    id: 5,
    title: "Introduce MVVM layers: View, ViewModel, Model",
    complete: true
}, {
    id: 6,
    title: 'Introduce regular tasks implementation: utils, events, adapters (essentials)',
    complete: false
}, {
    id: 7,
    title: 'List and adjust event flow communication',
    complete: false
}, {
    id: 8,
    title: 'List components boundaries and internal communications over methods/properties',
    complete: true
}, {
    id: 9,
    title: 'Produce a draft implementation',
    complete: false
}, {
    id: 10,
    title: 'Make conclusions',
    complete: false
}];
let index = data.length + 2;

class TodosAdapter {

    fetchTodos() {
        return new Promise<ITodoItem[]>((resolve) => {
            setTimeout(() => {
                const result = [...data.sort((l, r) => l.id > r.id ? -1 : l.id < r.id ? 1 : 0)];
                resolve(result);
            }, 200);
        });
    }

    createTodo(title) {
        return new Promise<{}>((resolve) => {
            setTimeout(() => {
                const newItem = {
                    id: index++,
                    title: title,
                    complete: false
                };
                data.push(newItem);
                resolve(newItem);
            }, 200);
        });
    }

    updateTodo(id, attrs) {
        return new Promise<{}>((resolve, reject) => {
            setTimeout(() => {
                const item = utils.find(data, i => i.id === id);
                if (item) {
                    Object.assign(item, attrs);
                    resolve(item);
                } else {
                    reject(new Error(`Can't update. Todo item with id: ${id} was not found`));
                }
            });
        });
    }

    deleteTodo(id) {
        return new Promise<boolean>((resolve, reject) => {
            setTimeout(() => {
                const item = utils.find(data, i => i.id === id);
                const index = data.indexOf(item);
                if (item) {
                    data.splice(index, 1);
                    resolve(true);
                } else {
                    reject(new Error(`Can't delete. Todo item with id: ${id} was not found`))
                }
            });
        });
    }
}

export { TodosAdapter };
