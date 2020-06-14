export { MainView } from './template';
import { declareActions } from '../../declareActions';
import { map, ofType, pipe, mergeIt, union, unionIt, mapIt } from '../../itrx';
import { ToDoActions, changeItems, queryItems, queryTodos, selectTodos } from '../../models/todos';


export const selectItems = ({ items = [] }) => items;
export const selectNewTodoTitle = ({ newTodoTitle = '' }) => newTodoTitle;

export const [MainActions, MainActionTypes, mainReducer] = declareActions({
    UPDATE_COMMANDS: {
        updateCommands: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                ...payload
            };
        }
    },
    UPDATE_ALL_COMPLETED: {
        markAllCompleted: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                toggleAllActive: payload
            };
        }
    },
    UPDATE_NEW_TODO_TITLE: {
        updateNewTodoTitle: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                newTodoTitle: payload
            };
        }
    },
    CREATE_NEW_ITEM: {
        createNewItem: (type, payload) => ({ type, payload }),
        reducer: (state: any = { }, { type, payload }) => {
            return {
                ...state,
                items: [...selectItems(state), payload]
            };
        }
    },
    UPDATE_VALUE: {
        updateValue: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                value: payload
            };
        }
    },
    UPDATE_ITEM_NAME: {
        updateItemName: (type, payload) => ({ type, payload }),
        reducer: (state: {} = {}, { type, payload }) => {
            return {
                ...state,
                itemName: payload
            };
        }
    },
    ADD_ITEM: {
        addItem: (type, payload) => ({ type, payload }),
        reducer: (state: any = { items: [] }, { type, payload }) => {
            return {
                ...state,
                items: [...state.items, payload]
            }
        }
    }
});

const initActions = [
    MainActions.updateCommands({
        markAllCompletedCommand: {
            exec() {

            }
        }
    })
];

export const selectMain = ({ main = {} }) => main;

export const main = (action$, state$) => {
    const test$ = pipe(
        ofType(MainActionTypes.UPDATE_VALUE),
        map(a => ({ type: 'test' }))
    )(action$);

    const init$ = pipe(
        ofType('@INIT'),
        map(() => [
            MainActions.updateCommands({
                markAllCompletedCommand: {
                    exec() {
                        action$.next(MainActions.updateValue(23));
                    }
                },
                updateNewTodoTitleCommand: (title) => action$.next(MainActions.updateNewTodoTitle(title)),
                createNewItemCommand: () => {
                    action$.next(MainActions.createNewItem(selectNewTodoTitle(selectMain(state$.value))));
                    action$.next(MainActions.updateNewTodoTitle(''));
                }
            }),
            ToDoActions.fetchItems()
        ])
    )(action$);

    const changeTodo$ = pipe(
        changeItems,
        union(mapIt(state$, selectTodos)),
        map(items => {
            console.log(items);
            return [];
        })
    )(action$);

    return mergeIt(
        changeTodo$,
        init$,
        test$
    );
}
