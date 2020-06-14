export { MainView } from './template';
import { declareActions } from '../../declareActions';
import { it, merge, from, map, ofType, filter, pipe, op } from '../../itrx';


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

export const main = (action$, state$) => {
    const test$ = pipe(action$,
        op.ofType(MainActionTypes.UPDATE_VALUE),
        op.map(a => ({ type: 'test' }))
    );
    const init$ = pipe(action$,
        op.ofType('@INIT'),
        op.map(() => MainActions.updateCommands({
            markAllCompletedCommand: {
                exec() {
                    action$.next(MainActions.updateValue(23));
                }
            }
        }))
    );
    return merge(
        init$,
        test$
    );
}
