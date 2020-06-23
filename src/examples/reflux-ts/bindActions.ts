export function bindActions<A, K extends keyof A>(actions: A, dispatch) {
    const res = Object.keys(actions).reduce((res, key) => ({
        ...res,
        [key]: (...args) => dispatch(actions[key](...args))
    }), {} as { [key in K]: A[K] });

    return res;
}
