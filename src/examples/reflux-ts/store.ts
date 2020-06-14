import { createStore } from './createStore';
import { reducer } from './reducers';
import { rootEffect } from './components';
import { it } from './itrx';


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

    const inputSeq = it(function* () {
        while (true) {
            const actions = [].concat(yield);
            console.log(actions);
            if (actions) {
                setTimeout(() => actions.map(action => store.dispatch(action)));
            }
        }
    });
    let action$ = it((function* () { yield }))();
    const state$ = it(function* (lastValue) {
        while (true) {
            yield store.getState();
        }
    })(store.getState());

    setTimeout(() => {
        action$ = rootEffect(inputSeq(), state$);
        store.dispatch({ type: '@INIT' });
    });

    return function (dispatch) {

        return function (action) {
            const ret = dispatch(action);
            action$.next(action);

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
