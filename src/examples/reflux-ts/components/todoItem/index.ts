import { declareActions } from '../../declareActions';
import { map, ofType, pipe, merge, filter, withArg, onAction, onState, onDispatch } from '../../itrx';
import { ToDoActions, queryItems, queryTodos, whenUpdateTodoResult } from '../../models/todos';


export const selectCurrent = ({ current = {} }) => current;
export const selectTitle = ({ title }) => title;
export const selectId = ({ id }) => id;
export const selectComplete = ({ complete }) => complete;

export const [ItemActions, ItemActionTypes, itemReducer] = declareActions({
    UI_UPDATE_CURRENT_TITLE: {
        uiUpdateCurrentTitle: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                title: payload
            };
        }
    },
    UI_SET_CURRENT_ITEM: {
        uiSetCurrentItem: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                id: payload
            };
        }
    },
    UI_UPDATE_TODO_TITLE: {
        uiUpdateTodoTitle: (type, payload) => ({ type, payload })
    },
    UI_SET_COMPLETE: {
        uiSetComplete: (type, id, complete) => ({ type, payload: { id, complete } })
    },
    UI_REMOVE_ITEM: {
        uiRemoveItem: (type, payload) => ({ type, payload })
    },
    SET_CURRENT: {
        setCurrent: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { payload }) => {
            return {
                ...state,
                ...payload
            };
        }
    }
});

export const queryCurrent = map(selectCurrent);
export const queryTitle = map(selectTitle);
export const queryComplete = map(selectComplete);
export const queryId = map(selectId);

const whenSetCurrentItem = ofType(ItemActionTypes.UI_SET_CURRENT_ITEM);
const whenUpdateTodoTitle = ofType(ItemActionTypes.UI_UPDATE_TODO_TITLE);
const whenSetComplete = ofType(ItemActionTypes.UI_SET_COMPLETE);
const whenRemoveItem = ofType(ItemActionTypes.UI_REMOVE_ITEM);

export const currentItem = () => {

    const fromView = merge(
        pipe(
            whenSetCurrentItem,
            withArg(pipe(onState, queryTodos, queryItems)),
            map(([{ payload: id }, items]: [any, any[]]) => {
                const currentItem = items.find(item => item.id === id);
                return ItemActions.setCurrent(currentItem);
            })
        ),
        pipe(
            whenUpdateTodoTitle,
            withArg(pipe(onState, queryCurrent, queryId), pipe(onState, queryCurrent, queryTitle)),
            map(([a, itemId, editTitle]) => ToDoActions.updateTodo(itemId, { title: editTitle }))
        ),
        pipe(
            whenSetComplete,
            map(({ payload: { id, complete } }) => ToDoActions.updateTodo(id, { complete }))
        ),
        pipe(
            whenRemoveItem,
            map(({ payload: id }) => ToDoActions.deleteTodo(id))
        )
    );
    const fromService = merge(
        pipe(
            whenUpdateTodoResult,
            map(() => ToDoActions.fetchItems())
        )
    );

    return merge(
        fromView,
        fromService
    );
}

export { TodoListViewItem } from './template';
