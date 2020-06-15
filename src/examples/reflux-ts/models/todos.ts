import { declareActions, selectPayload } from '../declareActions';
import { TodosAdapter } from '../adapters/todos';
import { map, ofType } from '../itrx';


export const [ToDoActions, ToDoActionTypes, toDoReducer] = declareActions({
    FETCH_TODOS_ERROR: {
        fetchTodosError: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                error: payload
            };
        }
    },
    FETCH_TODOS_RESULT: {
        fetchTodosResult: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                loading: false,
                items: payload
            };
        }
    },
    FETCH_TODOS: {
        fetchItems: (type, payload) => dispatch => {
            const adapter = new TodosAdapter();
            (async () => {
                try {
                    const items = await adapter.fetchTodos();
                    dispatch(ToDoActions.fetchTodosResult(items));
                } catch (ex) {
                    dispatch(ToDoActions.fetchTodosError(ex));
                }
            })();
            return {
                type,
                payload: true
            }
        },
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                loading: payload
            };
        }
    },
    CREATE_TODO_ERROR: {
        createTodoError: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                error: payload
            };
        }
    },
    CREATE_TODO_RESULT: {
        createTodoResult: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                loading: false,
                items: [payload, ...selectItemsInternal(state)]
            };
        }
    },
    CREATE_TODO: {
        createTodo: (type, title) => dispatch => {
            const adapter = new TodosAdapter();
            (async () => {
                try {
                    const items = await adapter.createTodo(title);
                    dispatch(ToDoActions.createTodoResult(items));
                } catch (ex) {
                    dispatch(ToDoActions.createTodoError(ex));
                }
            })();
            return {
                type,
                payload: true
            }
        },
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                loading: payload
            };
        }
    }
});

export const selectTodos = ({ todos }) => todos;
export const selectItemsInternal = ({ items = [] }) => items;
export const selectItems = ({ items = [] }) => items.reduce((res, item, index) => {
    return [...res, item];
}, []);

export const queryTodos = map(selectTodos);
export const queryItems = map(selectItems);

export const changeItems = ofType(ToDoActionTypes.FETCH_TODOS_RESULT);
export const createItem = ofType(ToDoActionTypes.CREATE_TODO_RESULT);
