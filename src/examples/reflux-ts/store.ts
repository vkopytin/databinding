import { createStore } from './createStore';
import { reducer } from './reducers';
import { rootEffect } from './components';
import itrx = require('./itrx');


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

    const inputSeq = itrx.it(function* () {
        while (true) {
            const action = yield;
            console.log(action);
            if (action) {
                setTimeout(() => store.dispatch(action));
            }
        }
    });
    let action$ = itrx.it((function* () { yield }))();
    const state$ = (function* () {
        while (true) {
            state$['value'] = yield;
        }
    })();
    state$.next(store.getState());

    setTimeout(() => {
        //action$ = itrx.merge(itrx.map(inputSeq(), action => ({ type: 'test' })));
        action$ = rootEffect(inputSeq(), state$);
        store.dispatch({ type: '@INIT' });
    });

    return function (dispatch) {

        return function (action) {
            const ret = dispatch(action);

            action$.next(action);
            state$.next(store.getState());

            //const actions = rootEffect(action, store.getState());
            //actions.forEach(action => {
            //    if (action) {
            //        dispatch(action);
            //    }
            //});

            return ret;
        };
    };
}

export const store = createStore(reducer, { items: [], itemName: '' }, applyMiddleware(
    effectsMiddleware
));
