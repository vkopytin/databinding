import { mainReducer } from './components/main';


export const reducer = (prevState, action) => {
    const state = mainReducer(prevState, action);
    const { type, payload } = action;
    switch (type) {
        default:
            return state;
    }
};
