import { declareActions } from '../../declareActions';
import { map, ofType, pipe, merge, filter, withArg, onAction, onState, onDispatch } from '../../itrx';
import { ToDoActions, changeItems, queryItems, queryTodos, selectTodos, createItem, ToDoActionTypes } from '../../models/todos';


export const selectMain = ({ main = { newTodoTitle: '', toggleAllComplete: false } }) => main;
export const selectItems = ({ items = [] }) => items;
export const selectItemIsComplete = ({ complete }) => complete;
export const selectActiveItems = (items = []) => items.filter(item => !selectItemIsComplete(item));
export const selectCompleteItems = (items = []) => items.filter(item => selectItemIsComplete(item));
export const selectNewTodoTitle = ({ newTodoTitle = '' }) => newTodoTitle;
export const selectToggleAllComplete = ({ toggleAllComplete }) => toggleAllComplete;


export const [MainActions, MainActionTypes, mainReducer] = declareActions({
    UI_CREATE_TODO: {
        uiCreateTodo: (type, payload) => ({ type, payload })
    },
    UI_UPDATE_NEW_TITLE: {
        uiUpdateNewTodoTitle: (type, payload) => ({ type, payload })
    },
    UI_TOGGLE_ALL_COMPLETE: {
        uiToggleAllComplete: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                toggleAllComplete: payload
            };
        }
    },
    UI_SET_ACTIVE_FILTER: {
        uiSetActiveFilter: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                activeFilter: payload
            };
        }
    },
    CLEAR_COMPLETED: {
        clearCompleted: (type, payload) => ({ type, payload })
    },
    UPDATE_MAIN_NEW_TODO_TITLE: {
        updateNewTodoTitle: (type, payload: string) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                newTodoTitle: payload
            };
        }
    },
    UPDATE_MAIN_ITEMS: {
        updateItems: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                items: payload,
                activeItems: selectActiveItems(payload),
                completeItems: selectCompleteItems(payload)
            }
        }
    }
});

const queryMain = map(selectMain);
const queryNewTodoTitle = map(selectNewTodoTitle);
const queryToggleAllComplete = map(selectToggleAllComplete);

const whenUpdateNewTitle = ofType(MainActionTypes.UI_UPDATE_NEW_TITLE);
const whenCreateTodo = ofType(MainActionTypes.UI_CREATE_TODO);
const whenToggleAllComplete = ofType(MainActionTypes.UI_TOGGLE_ALL_COMPLETE);

const API = {
    markAllItemsCompleted(items: Array<{ id; }>, complete = true) {
        const updateItemActions = items.map(item => ({
            ...item,
            complete
        }));
        return updateItemActions;
    }
};

export const main = () => {
    const init = merge(
        pipe(
            ofType('@INIT'),
            map(() => ToDoActions.fetchItems())
        )
    );
    const fromView = merge(
        pipe(whenCreateTodo,
            withArg(pipe(onState, queryMain, queryNewTodoTitle)),
            map(([a, newTodoTitle]) => ToDoActions.createTodo(newTodoTitle))
        ),
        pipe(whenUpdateNewTitle,
            map(({ payload }) => MainActions.updateNewTodoTitle(payload))
        ),
        pipe(whenToggleAllComplete,
            withArg(pipe(onState, queryTodos, queryItems), pipe(onState, queryMain, queryToggleAllComplete)),
            map(([, items, isCompleted]) => API.markAllItemsCompleted(items, isCompleted)),
            map(completedItems => completedItems.map(item => ToDoActions.updateTodo(item.id, item)))
        ),
        pipe(
            ofType(MainActionTypes.UI_SET_ACTIVE_FILTER),
            withArg(pipe(onState, queryTodos, queryItems)),
            map(([a, todos]) => MainActions.updateItems(todos))
        )
    );
    const fromService = merge(
        pipe(
            ofType(ToDoActionTypes.CREATE_TODO_RESULT),
            map(() => MainActions.updateNewTodoTitle(''))
        ),
        pipe(
            merge(changeItems, createItem),
            withArg(pipe(onState, queryTodos, queryItems)),
            map(([action, todos]) => {
                return MainActions.updateItems(todos);
            })
        )
    );

    return merge(
        init,
        fromView,
        fromService
    );
}

export { MainView } from './template';
