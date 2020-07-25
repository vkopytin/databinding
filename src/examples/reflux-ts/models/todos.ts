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
                items: selectItemsById(payload),
                order: selectItemsOrder(payload)
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
        reducer: ({ loading, ...state}: any = {}, { type, payload }) => {
            return {
                ...state,
                items: {
                    ...selectItems(state),
                    [payload.id]: payload
                },
                order: [payload.id, ...selectOrder(state)]
            };
        }
    },
    CREATE_TODO: {
        createTodo: (type, title) => dispatch => {
            const adapter = new TodosAdapter();
            (async () => {
                try {
                    const item = await adapter.createTodo(title);
                    dispatch(ToDoActions.createTodoResult(item));
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
    },
    UPDATE_TODO_ERROR: {
        updateTodoError: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                error: payload
            };
        }
    },
    UPDATE_TODO_RESULT: {
        updateTodoResult: (type, payload) => ({ type, payload }),
        reducer: ({ loading, ...state}: any = {}, { type, payload }) => {
            return {
                ...state,
                items: {
                    ...selectItems(state),
                    [payload.id]: payload
                }
            };
        }
    },
    UPDATE_TODO: {
        updateTodo: (type, id, attrs) => dispatch => {
            const adapter = new TodosAdapter();
            (async () => {
                try {
                    const item = await adapter.updateTodo(id, attrs);
                    dispatch(ToDoActions.updateTodoResult(item));
                } catch (ex) {
                    dispatch(ToDoActions.updateTodoError(ex));
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
    DELETE_TODO_ERROR: {
        deleteTodoError: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                error: payload
            };
        }
    },
    DELETE_TODO_RESULT: {
        deleteTodoResult: (type, payload) => ({ type, payload }),
        reducer: ({ loading, ...state }: any = {}, { type, payload: id }) => {
            const { [id]: removed, ...items } = selectItemsInternal(state) as any;
            return {
                ...state,
                items,
                order: selectOrder(state).filter(pos => pos !== id)
            };
        }
    },
    DELETE_TODO: {
        deleteTodo: (type, id) => dispatch => {
            const adapter = new TodosAdapter();
            (async () => {
                try {
                    const item = await adapter.deleteTodo(id);
                    dispatch(ToDoActions.deleteTodoResult(id));
                } catch (ex) {
                    dispatch(ToDoActions.deleteTodoError(ex));
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

const selectItemsById = (items = []) => items.reduce((res, item) => ({
    ...res,
    [item.id]: item
}), {});
const selectItemsOrder = (items = []) => items.map(({ id }) => id);
const selectOrder = ({ order }) => order;
export const selectTodos = ({ todos }) => todos;
export const selectItemsInternal = ({ items = {} }) => items;
export const selectItems = ({ items = {}, order = [] }) => order.map(id => items[id]);

export const queryTodos = map(selectTodos);
export const queryItems = map(selectItems);

export const whenChangeItems = ofType(ToDoActionTypes.FETCH_TODOS_RESULT);
export const whenCreateItem = ofType(ToDoActionTypes.CREATE_TODO_RESULT);
export const whenDeleteItem = ofType(ToDoActionTypes.DELETE_TODO_RESULT);

export const whenCreateTodoResult = ofType(ToDoActionTypes.CREATE_TODO_RESULT);
export const whenUpdateTodoResult = ofType(ToDoActionTypes.UPDATE_TODO_RESULT);
