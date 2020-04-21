const instances = new WeakMap();

export function current<T extends {}, O extends {}>(
    ctor: { new (...args): T },
    options?: O
): T {
    if (instances.has(ctor)) {
        return instances.get(ctor);
    }
    const inst = new ctor(options);
    instances.set(ctor, inst);

    return inst;
}

export function html(el, html?: string) {
    if (arguments.length > 1) {
        el.innerHTML = html;
    }
    return el.innerHTML;
}

export function el(selector, inst?) {
    inst = inst || document;
    if (!selector) {
        return null;
    }
    if ('string' === typeof selector) {
        return inst.querySelector(selector);
    }
    return selector;
}

export function attr(el, name, val?) {
    if (arguments.length > 2) {
        el.setAttribute(name, val);
    }
    return el.getAttribute(name);
}

export function text(el, text?) {
    if (arguments.length > 1) {
        el.innerText = text;
    }
    return el.innerText;
}

export function remove(el) {
    el.parentNode.removeChild(el);
}

export function on(inst, selector, eventName, fn) {
    const handler = function (evnt) {
        if (evnt.target.matches(selector)) {
            fn(evnt);
        }
    }
    inst.addEventListener(eventName, handler);
    return function () {
        inst.removeEventListener(eventName, handler);
    }
}

export function trigger(el, eventName) {
    el.dispatchEvent(new Event(eventName, { bubbles: true }));
}

export function getResult(inst, getFn) {
    const fnOrAny = getFn && getFn();
    if (typeof fnOrAny === 'function') {
        return fnOrAny.call(inst);
    }
    return fnOrAny;
}

export function find<T>(items: T[], fn: (item: T) => boolean) {
    for (const item of items) {
        if (fn(item)) {
            return item;
        }
    }
    return null;
}

export function filter<T>(items: T[], fn: (item: T) => boolean): T[] {
    const res = [] as T[]
    for (const item of items) {
        if (fn(item)) {
            res.push(item);
        }
    }
    return res;
}

export function map<T, Y>(items: T[], fn: (item: T) => Y): Y[] {
    const res = [] as Y[];
    for (const item of items) {
        res.push(fn(item));
    }
    return res;
}

export function last<T>(items: T[], from = 1): T[] {
    const length = items.length;
    return [].slice.call(items, from, length);
}

export function first<T>(items: T[], n = 1) {
    return [].slice.call(items, 0, n);
}
