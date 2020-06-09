import { Events } from 'databindjs';


class Base<S = {}> extends Events {
    state: S;

    constructor(...args: string[]) {
        super();
    }

    prop<K extends keyof S>(propName: K, val?: S[K]): S[K] {
        if (arguments.length > 1 && val !== (this.state as any)[propName]) {
            (this.state as any)[propName] = val;
            this.trigger('change:prop(' + propName + ')');
        }

        return this.state[propName];
    }

}

export { Base };
