import { createStore } from './createStore';


export const store = createStore((state, { type, payload }) => {
    switch (type) {
        case 'update':
            return {
                ...state,
                value: payload
            };
        case 'itemName':
            return {
                ...state,
                itemName: payload
            };
        case 'createItem':
            return {
                ...state,
                items: [...state.items, payload]
            }
        default:
            return store;
    }
}, { items: [], itemName: '' });
