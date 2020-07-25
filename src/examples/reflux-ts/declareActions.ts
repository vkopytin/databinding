
export function createReducer (initialState) {
    return (reducerMap) => (state = initialState, action) => {
        const reducer = reducerMap[action.type];
        return reducer ? reducer(state, action) : state;
    }
};

// UnionToIntersection was borrowed from https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
type UnionToIntersection<U> = (U extends any
    ? (k: U) => void
    : any) extends ((k: infer I) => void)
    ? I
    : any;

type ActionArg<Y, T> = T extends (a: keyof Y, b: infer I, c?) => any ? I : any;

export function declareActions<T extends {
    [type in keyof T]: {
        [name in keyof T[K]]: (type: type, props: P, meta?) => any;
    };
}, K extends keyof T, KK extends keyof UnionToIntersection<T[K]>, P, O extends UnionToIntersection<T[K]>>(
    actions: T
): [{ [key in KK]: (args?: ActionArg<T, O[KK]>, meta?) => any }, { [key in K]: K }, any] {
    const reducers = {};
    const keys = Object.keys(actions);
    const resActions = keys.reduce((res, type) => {
        const actionDecl = actions[type];
        let left = res[0],
            right = res[1];
        const actionNames = Object.keys(actionDecl);
        const reducer = actionDecl.reducer;
        if (reducer) {
            reducers[type] = reducer;
        }
        const actionFn = actionDecl[actionNames[0]];
        left = { ...left, [actionNames[0]]: (props, meta) => actionFn(type, props, meta) };
        right = { ...right, [type]: type };

        return [left, right];
    }, [{}, {}]);
    return [...resActions, createReducer({})(reducers)] as any;
}

export const selectPayload = ({ payload }) => payload;
