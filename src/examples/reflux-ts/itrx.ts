export function it(generator) {
    return function (...args) {
        let iterator = generator(...args);
        iterator.type = generator;
        iterator.next();
        return iterator;
    };
}

function* fromGenerator(...arr) {
    for (const a of arr) {
        yield* a;
    }
};
export const from = (...arr) => {
    const iterator = fromGenerator(...arr);
    iterator['type'] = fromGenerator;
    return iterator;
}

function * mapGenerator<a, b>(a: Iterator<a>, f: (b: b) => a) {
    while (true) {
        const res = f(yield);
        a.next(res);
    }
}
export const map = it(mapGenerator);

function toArray(iterator) {
    const res = [];
    let value = iterator.next();
    while (!value.done) {
        res.push(value.value);
        value = iterator.next();
    }
    return res;
}

export const merge = it(function* (...its) {
    while (true) {
        const input = yield;
        its.map(it => it.next(input));
    }
});

export const filter = it(function* <a,b>(a: Iterator<a>, f: (b:b) => a) {
    while (true) {
        const input = yield;
        const res = f(input);
        if (res) {
            a.next(input);
        }
    }
});

export const ofType = (a, type) => filter(a, a => a.type === type);

export const pipe = (seq$, ...operators) => {
    return operators.reverse().reduce((res, operator) => operator(res), seq$);
};

export const op = {
    ofType: (type) => seq$ => ofType(seq$, type),
    map: (fn) => seq$ => map(seq$, fn),
    merge: (...fn) => merge(...fn)
}
