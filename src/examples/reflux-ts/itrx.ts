export function it(generator) {
    return function (...args) {
        let iterator = generator(...args);
        iterator.next();
        return iterator;
    };
}

export const from = it(function* (...arr) {
    for (const a of arr) {
        yield* a;
    }
});

export const mapIt = it(function * <a, b>(a: Iterator<a>, f: (b: b) => a) {
    while (true) {
        const value = yield;
        const res = f(value);
        a.next(res);
    }
});

function toArray(iterator) {
    const res = [];
    let value = iterator.next();
    while (!value.done) {
        res.push(value.value);
        value = iterator.next();
    }
    return res;
}

export const mergeIt = it(function* (...its) {
    while (true) {
        const input = yield;
        its.map(it => it.next(input));
    }
});

export const filterIt = it(function* <a,b>(a: Iterator<a>, f: (b:b) => a) {
    while (true) {
        const input = yield;
        const res = f(input);
        if (res) {
            a.next(input);
        }
    }
});

export const unionIt = it(function* (a, b) {
    while (true) {
        const res = yield;
        const value = b.next();
        a.next([res, value.value]);
    }
});

export const ofTypeIt = (a, type) => filterIt(a, a => a.type === type);

export const pipe = (...operators) => {
    return seq$ => operators.reverse().reduce((res, operator) => operator(res), seq$);
};

export const ofType = (type) => seq$ => ofTypeIt(seq$, type);
export const map = (fn) => seq$ => mapIt(seq$, fn);
export const merge = (...fn) => seq$ => mergeIt(...fn);
export const union = (b$) => seq$ => unionIt(seq$, b$);
