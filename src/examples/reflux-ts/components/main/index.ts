export { MainView } from './template';
import { declareActions } from '../../declareActions';


export const [MainActions, MainActionTypes, mainReducer] = declareActions({
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

function merge() { 

}

const main = (action$, state$) => {

    return merge(

    );
};
