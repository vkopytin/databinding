export const onAction = (...abc) => [abc[0]];
export const onState = (...abc) => [abc[1]];
export const onDispatch = (...abc) => [abc[2]];

export const pipe = (...args) => (...abc) => args.reduce((res, fn) => res.length ? fn(...res) : [], abc);
export const merge = (...args) => (...abc) => args.reduce((res, fn) => [...res, ...fn(...abc)], []);

export const map = (fn) => (...abc) => [fn(...abc)];
export const withArg = (...fn) => (a, ...abc) => [[a, ...merge(...fn)(a, ...abc)], ...abc];
export const filter = (fn) => (...abc) => fn(...abc) ? [...abc] : [];

export const ofType = (type) => filter(a => a.type === type);
