import { createStore } from './createStore';
import { reducer } from './reducers';
import { rootEffect } from './components';


export default function compose(...funcs: Function[]) {
    if (funcs.length === 0) {
      // infer the argument type so it is usable in inference down the line
      return <T>(arg: T) => arg
    }
  
    if (funcs.length === 1) {
      return funcs[0]
    }
  
    return funcs.reduce((a, b) => (...args: any) => a(b(...args)))
}

export function applyMiddleware(...middlewares) {
    return function (createStoreFn: typeof createStore) {
        return function (reducer, initialState) {
            const store = createStoreFn(reducer, initialState);
            let dispatch = (action, ...args) => { throw Error(`Dispatching {${JSON.stringify(action)}} while creating middleware`) };
            const middlewareAPI = {
                getState: store.getState,
                dispatch: (action, ...args) => dispatch(action, ...args)
            }
            const chain = middlewares.map(middleware => middleware(middlewareAPI));
            dispatch = compose(...chain)(store.dispatch);

            return {
                ...store,
                dispatch
            };
        };
    }
}

function effectsMiddleware(store) {

    setTimeout(() => {
        store.dispatch({ type: '@INIT' });
    });

    let handler = rootEffect();

    return function (dispatch) {

        return function (action) {
            const ret = dispatch(action);

            for (const a of [].concat(...handler(action, store.getState(), (a) => store.dispatch(a)))) {
                store.dispatch(a);
            }

            return ret;
        };
    };
}

const createThunkMiddleware = (extraArgument?) => ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
        return action(dispatch, getState, extraArgument);
    }

    return next(action);
};

var thunk = createThunkMiddleware();

export const store = createStore(reducer, { items: [], itemName: '' }, applyMiddleware(
    thunk,
    effectsMiddleware
));
