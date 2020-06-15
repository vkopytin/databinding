import { declareActions } from '../../declareActions';
import { map, ofType, pipe, merge, filter, withArg, onAction, onState, onDispatch } from '../../itrx';


export const selectCurrentItem = ({ currentItem = {} }) => currentItem;
export const selectLabelTitle = ({ title }) => title;

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
});

export const currentItem = () => {
    let mark = 0;
    const init = merge(
        pipe(
            filter(() => (mark++ % 3) === 0),
            withArg(pipe(onState)),
            map(([a, newTodoTitle], s, dispatch) => [
                ItemActions.updateCommands({
                    setCurrentItemCommand: (id) => { console.log(id) },
                })
            ])
        )
    );

    return merge(
        init
    );
}

export { TodoListViewItem } from './template';
