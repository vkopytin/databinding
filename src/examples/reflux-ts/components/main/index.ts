import { declareActions } from '../../declareActions';
import { map, ofType, pipe, merge, filter, withArg, onAction, onState, onDispatch } from '../../itrx';
import { ToDoActions, changeItems, queryItems, queryTodos, selectTodos, createItem } from '../../models/todos';


export const selectMain = ({ main = { newTodoTitle: '' } }) => main;
export const selectItems = ({ items = [] }) => items;
export const selectNewTodoTitle = ({ newTodoTitle = '' }) => newTodoTitle;


export const [MainActions, MainActionTypes, mainReducer] = declareActions({
    UPDATE_MAIN_COMMANDS: {
        updateCommands: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                ...payload
            };
        }
    },
    UPDATE_MAIN_ALL_COMPLETED: {
        markAllCompleted: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                toggleAllActive: payload
            };
        }
    },
    UPDATE_MAIN_NEW_TODO_TITLE: {
        updateNewTodoTitle: (type, payload) => ({ type, payload }),
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
                items: payload
            }
        }
    }
});

const queryMain = map(selectMain);
const queryNewTodoTitle = map(selectNewTodoTitle);

export const main = () => {
    let mark = 0;
    const init = merge(
        pipe(
            filter(() => (mark++ % 2) === 0),
            withArg(pipe(onState, queryMain, queryNewTodoTitle)),
            map(([a, newTodoTitle], s, dispatch) => [
                MainActions.updateCommands({
                    markAllCompletedCommand: () => { },
                    updateNewTodoTitleCommand: (title) => dispatch(MainActions.updateNewTodoTitle(title)),
                    createNewItemCommand: () => {
                        dispatch(ToDoActions.createTodo(newTodoTitle));
                        dispatch(MainActions.updateNewTodoTitle(''));
                    }
                })
            ])
        ),
        pipe(
            ofType('@INIT'),
            map(() => ToDoActions.fetchItems())
        )
    );

    const changeTodo = merge(
        pipe(
            merge(changeItems, createItem),
            withArg(pipe(onState, queryTodos, queryItems)),
            map(([action, todos]) => {
                return MainActions.updateItems(todos);
            })
        )
    );

    return merge(
        changeTodo,
        init
    );
}

export { MainView } from './template';
