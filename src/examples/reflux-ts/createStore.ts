export function createStore(reducer, initialState) {
    const currentReducer = reducer;
    let currentState = initialState;
    const listeners = [];

    return {
        getState() {
            return currentState;
        },
        dispatch(action) {
            currentState = currentReducer(currentState, action);
            listeners.map(listener => listener(currentState));
            return action;
        },
        subscribe(newListener) {
            listeners.push(newListener);
            return function () {
                const index = listeners.indexOf(newListener);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
            };
        }
    };
}
