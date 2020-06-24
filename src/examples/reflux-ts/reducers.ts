import { mainReducer, selectMain } from './components/main';
import { toDoReducer, selectTodos } from './models/todos';
import { itemReducer, selectCurrent } from './components/todoItem';


export const reducer = (prevState, action) => {
    const state = {
        ...prevState,
        main: mainReducer(selectMain(prevState), action),
        todos: toDoReducer(selectTodos(prevState), action),
        current: itemReducer(selectCurrent(prevState), action)
    };
    const { type, payload } = action;
    switch (type) {
        default:
            return state;
    }
};
