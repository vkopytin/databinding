import { declareActions } from '../../declareActions';
import { map, ofType, pipe, merge, filter, withArg, onAction, onState, onDispatch } from '../../itrx';
import { ToDoActions, queryItems, queryTodos, ToDoActionTypes } from '../../models/todos';


export const selectCurrentItem = ({ currentItem = {} }) => currentItem;
export const selectLabelTitle = ({ title }) => title;
export const selectEditTitle = ({ title }) => title;

export const [ItemActions, ItemActionTypes, itemReducer] = declareActions({
    UPDATE_ITEM_COMMANDS: {
        updateCommands: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                ...payload
            };
        }
    },
    SET_CURRENT_ITEM: {
        setCurrentItem: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                currentItemId: payload
            };
        }
    }
});

export const queryCurrentItem = map(selectCurrentItem);

export const currentItem = () => {
    const init = merge(
        pipe(
            ofType('@INIT'),
            withArg(pipe(onState, queryCurrentItem), pipe(onState, queryTodos)),
            map(([a, item, todos], s, dispatch) => [
                ItemActions.updateCommands({
                    setCurrentItemCommand: (id) => dispatch(ItemActions.setCurrentItem(id)),
                    updateTodoTitleCommand: (id, title) => dispatch(ToDoActions.updateTodo(id, {
                        title
                    }))
                })
            ])
        )
    );

    const updateTodoItem = merge(
        pipe(
            ofType(ToDoActionTypes.UPDATE_TODO_RESULT),
            map(() => ToDoActions.fetchItems()),
            map(() => [])
        )
    );

    return merge(
        init,
        updateTodoItem
    );
}

export { TodoListViewItem } from './template';
