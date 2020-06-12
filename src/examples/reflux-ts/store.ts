import { createStore } from './createStore';
import { reducer } from './reducers';

export const store = createStore(reducer, { items: [], itemName: '' });
