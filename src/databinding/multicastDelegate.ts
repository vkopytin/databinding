import * as utils from '../utils';


class MulticastDelegate {
    list = [] as Array<[any, (...args) => any, number]>;
    invoke = (() => {
        const inst = this;
        return function (...args) {
            return inst.trigger.apply(inst, inst.convertArgs.apply(this, args));
        };
    })();

    constructor(public convertArgs: (...args) => [object, any?, any?, any?]) {
    }

    getHandler(obj) {
        const d = utils.find(this.list, ([o]) => obj === o);
        if (d) {
            return d[1];
        }
        return null;
    }

    addHandler(obj, handler) {
        const current = utils.find(this.list, ([o]) => obj === o);
        if (!current) {
            this.list.push([obj, handler, 1]);
            return;
        }
        current[2]++;
    }

    removeHandler(obj) {
        const current = utils.find(this.list, ([o]) => obj === o);
        current[2]--;
        if (current[2] === 0) {
            this.list.splice(this.list.indexOf(current), 1);
        }
    }

    trigger(obj, ...args) {
        const delegates = utils.filter(this.list, ([o]) => o === obj);
        utils.forEach(delegates, ([o, h]) => h(...args));
    }
}

export { MulticastDelegate };
