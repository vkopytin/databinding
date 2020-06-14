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
