import * as _ from 'underscore';

export function forEach<T>(arr: T[], cb: (item?: T, index?: number, arr?: T[]) => any) {
    const length = arr == null ? 0 : arr.length;
    let index = 0;
    let n = length % 8;

    if (n > 0) {
        do {
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
        }
        while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
        }
        while (--n); // n must be greater than 0 here also
    }

    return arr;
}

export function map<T, R>(arr: T[], cb: (item?: T, index?: number, arr?: T[]) => R): R[] {
    const length = arr == null ? 0 : arr.length;
    const result = new Array(length);
    let index = 0;
    let n = length % 8;

    if (n > 0) {
        do {
            result[index] = cb(arr[index], index++, arr);
        }
        while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
        }
        while (--n); // n must be greater than 0 here also
    }

    return result;
}

export function filter<T>(arr: T[], cb: (item?: T, index?: number, arr?: T[]) => boolean | any): T[] {
    const length = arr == null ? 0 : arr.length;
    const result = [];
    let resIndex = 0;
    let index = 0;
    let n = length % 8;
    let value;

    if (n > 0) {
        do {
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
        }
        while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
        }
        while (--n); // n must be greater than 0 here also
    }
    
    return result;
}

export function reduce<T, R = T[]>(arr: T[], cb: (res: R, value: T, index: number, arr: T[]) => R, res?: R): R {
    const length = arr == null ? 0 : arr.length;
    let index = 0;
    let n = length % 8;

    if (n > 0) {
        do {
            res = cb(res, arr[index], index++, arr);
        }
        while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
        }
        while (--n); // n must be greater than 0 here also
    }
    return res;
}

export function find<T>(arr: T[], cb: (item?: T, index?: number, arr?: T[]) => boolean | any): T {
    const length = arr == null ? 0 : arr.length;
    let index = 0;
    let n = length % 8;
    let value;

    if (n > 0) {
        do {
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
        }
        while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
        }
        while (--n); // n must be greater than 0 here also
    }
}

export function difference<T>(arr: T[], vals: T[]): T[] {
    // tslint:disable-next-line
    return filter(arr, (a) => !~vals.indexOf(a));
}

export function strEquals(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length / 2; ++i) {
        if (a[i] !== b[i] || a[a.length - i - 1] !== b[b.length - i - 1]) {
            return false;
        }
    }
    return true;
}

export function unique<T>(arr: T[]): T[] {
    return filter(arr, (value, index, self) => self.indexOf(value) === index);
}

export function first<T>(arr: T[]): T {
    return (arr != null && arr.length)
        ? arr[0]
        : undefined
}

export function last(arr) {
    const length = arr == null ? 0 : arr.length
    return length ? arr[length - 1] : undefined
}

export function rest<T>(arr: T[], n?, guard?): T[] {
    return Array.prototype.slice.call(arr, n == null || guard ? 1 : n);
}

const idCounter = {}
export function uniqueId(prefix = '') {
    if (!idCounter[prefix]) {
        idCounter[prefix] = 0
    }

    const id = ++idCounter[prefix]
    if (prefix === '') {
        return `${id}`
    }

    return `${prefix + id}`
}

export function asyncQueue(concurrency = 1) {
    let running = 0;
    const taskQueue = [];

    const runTask = (task, operationId) => {
        const done = () => {
            running--;
            if (taskQueue.length > 0) {
                runTask(taskQueue.shift(), operationId);
            }
        };
        running++;
        try {
            task(done, operationId);
        } catch (ex) {
            _.delay(() => { throw ex; });
            done();
        }
    };

    const enqueueTask = task => taskQueue.push(task);

    return {
        push: task => running < concurrency ? runTask(task, uuId()) : enqueueTask(task)
    };
}

export function asyncQueueWithPriority(concurrency = 1) {
    let running = 0;
    const taskQueue = [] as Array<[(done: () => void) => void, number]>;

    const runTask = (task: (done: () => void) => void, priority: number) => {
        const done = () => {
            running--;
            if (taskQueue.length > 0) {
                runTask(...taskQueue.shift());
            }
        };
        running++;
        try {
            task(done);
        } catch (ex) {
            _.delay(() => { throw ex; });
            done();
        }
    };

    const enqueueTask = (task: (done: () => void) => void, priority: number) => {
        const nextTask = find(taskQueue, t => t[1] > priority);
        if (nextTask) {
            taskQueue.splice(taskQueue.indexOf(nextTask), 0, [task, priority]);
        } else {
            taskQueue.push([task, priority]);
        }
    };

    return {
        push: (task: (done: () => void) => void, priority = 0) => running < concurrency ? runTask(task, priority) : enqueueTask(task, priority)
    };
}

export function isFunction(obj) {
    return typeof obj === 'function' || false;
}

export function isNullOrUndefined(obj) {
    return obj === undefined || obj === null;
}

export function uuId() { // Public Domain/MIT
    let d = new Date().getTime();
    if (typeof window.performance !== 'undefined' && typeof window.performance.now === 'function') {
        d += window.performance.now(); // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // tslint:disable-next-line
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        // tslint:disable-next-line
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
