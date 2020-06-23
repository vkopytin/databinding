import { declareActions } from '../../declareActions';
import { map, ofType, pipe, merge, filter, withArg, onAction, onState, onDispatch } from '../../itrx';
import { ToDoActions, queryItems, queryTodos, ToDoActionTypes } from '../../models/todos';


export const selectCurrentItem = ({ currentItem = {} }) => currentItem;
export const selectLabelTitle = ({ title }) => title;
export const selectEditTitle = ({ editTitle }) => editTitle;
export const selectCurrentItemId = ({ currentItemId }) => currentItemId;

export const [ItemActions, ItemActionTypes, itemReducer] = declareActions({
    UI_UPDATE_EDITING_TITLE: {
        uiUpdateEditingTitle: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                editTitle: payload
            };
        }
    },
    UI_SET_CURRENT_ITEM: {
        uiSetCurrentItem: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                currentItemId: payload
            };
        }
    },
    UI_UPDATE_TODO_TITLE: {
        uiUpdateTodoTitle: (type, payload) => ({ type, payload })
    }
});

export const queryCurrentItem = map(selectCurrentItem);
export const queryEditTitle = map(selectEditTitle);
export const queryCurrentItemId = map(selectCurrentItemId);

export const currentItem = () => {

    const fromView = merge(
        pipe(
            ofType(ItemActionTypes.UI_SET_CURRENT_ITEM),
            withArg(pipe(onState, queryTodos, queryItems)),
            map(([{ payload: id }, items]: [any, any[]]) => {
                const currentItem = items.find(item => item.id === id);
                if (!currentItem) {
                    return [];
                }
                return ItemActions.uiUpdateEditingTitle(currentItem.title);
            })
        ),
        pipe(
            ofType(ItemActionTypes.UI_UPDATE_TODO_TITLE),
            withArg(pipe(onState, queryCurrentItem, queryCurrentItemId), pipe(onState, queryCurrentItem, queryEditTitle)),
            map(([a, itemId, editTitle]) => ToDoActions.updateTodo(itemId, { title: editTitle }))
        )
    );
    const fromService = merge(
        pipe(
            ofType(ToDoActionTypes.UPDATE_TODO_RESULT),
            map(() => ToDoActions.fetchItems()),
            map(() => [])
        )
    );

    return merge(
        fromView,
        fromService
    );
}

export { TodoListViewItem } from './template';
