import { mainReducer, selectMain } from './components/main';
import { toDoReducer } from './models/todos';


export const reducer = (prevState, action) => {
    const state = {
        ...prevState,
        main: mainReducer(selectMain(prevState), action),
        todos: toDoReducer(prevState['todos'], action)
    };
    const { type, payload } = action;
    switch (type) {
        default:
            return state;
    }
};
