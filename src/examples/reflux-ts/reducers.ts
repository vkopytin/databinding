import { mainReducer, selectMain } from './components/main';
import { toDoReducer, selectTodos } from './models/todos';
import { itemReducer, selectCurrentItem } from './components/todoItem';


export const reducer = (prevState, action) => {
    const state = {
        ...prevState,
        main: mainReducer(selectMain(prevState), action),
        todos: toDoReducer(selectTodos(prevState), action),
        currentItem: itemReducer(selectCurrentItem(prevState), action)
    };
    const { type, payload } = action;
    switch (type) {
        default:
            return state;
    }
};
