import { reduce } from '../../utils';


export function className(str: string, ...args) {
    str = str || '';
    const classArray = str.split(/\s+/gi);
    const res = reduce(classArray, (res, val) => {
        if (val.indexOf('?') !== 0) {
            return [...res, val];
        }
        if (args.shift()) {

            return [...res, val.replace(/^\?/, '')];
        }

        return res;
    }, []);

    return res.join(' ');
}

function isArray(input) {
    if (input instanceof Array || Object.prototype.toString.call(input) === '[object Array]') {
        return true;
    } else return false;
}

export function pick(obj, fn) {
    const keys = Object.keys(obj);
    return keys.reduce((res: any, key) => {
        if (fn(obj[key])) {
            if (isArray(obj)) {
                return [
                    ...res,
                    obj[key]
                ];
            } else {
                return {
                    ...res,
                    [key]: obj[key]
                };
            }
        }
        return res;
    }, isArray(obj) ? [] : {});
}

export function arrayMerge(array1, array2) {
    const array = [].concat(array1);
    for (let i = 0; i < array2.length; i++) {
        if (array.indexOf(array2[i]) === -1) {
            array.push(array2[i]);
        }
    }
    return array;
}
