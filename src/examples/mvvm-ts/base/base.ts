function dispatcher() {

    const handlers = [];

    return {
        add(handler) {
            if (!handler) {
                throw new Error('Can\'t attach to empty handler');
            }
            handlers.push(handler);

            return function () {
                const index = handlers.indexOf(handler);
                if (~index) {
                    return handlers.splice(index, 1);
                }
                throw new Error('Ohm! Something went wrong with detaching unexisting event handler');
            };
        },

        notify() {
            const args = [].slice.call(arguments, 0);
            for (const handler of handlers) {
                handler.apply(null, args);
            }
        }
    }
}

function initEvents(...args) {
    const events = {};
    for (const key of args) {
        events[key] = dispatcher();
    }
    return {
        on(eventName, handler) {
            return events[eventName].add(handler);
        },
        trigger(eventName) {
            events[eventName].notify();
        }
    };
}

class Base<S = {}> {
    state: S;

    constructor(...args: string[]) {
        const events = initEvents(...args);

        this.on = events.on;
        this.trigger = events.trigger;
    }

    on(eventName, handler) {
        throw new Error('Not implemented');
    }

    trigger(eventName) {
        throw new Error('Not implemented');
    }

    prop<K extends keyof S>(propName: K, val?: S[K]): S[K] {
        if (arguments.length > 1 && val !== (this.state as any)[propName]) {
            (this.state as any)[propName] = val;
            this.trigger('change:' + propName);
        }

        return this.state[propName];
    }

}

export { Base };
