import * as utils from '../utils';


class MulticastDelegate {
    list = [] as Array<[any, string, (...args) => any, number]>;
    invoke = (() => {
        const inst = this;
        return function (...args) {
            return inst.trigger.apply(inst, inst.convertArgs.apply(this, args));
        };
    })();

    constructor(public convertArgs: (...args) => [object, any?, any?, any?]) {
    }

    getHandler(obj, eventName = '') {
        const d = utils.find(this.list, ([o, evn]) => obj === o && eventName === evn);
        if (d) {
            return d[2];
        }
        return null;
    }

    addHandler(obj, eventName, handler) {
        if (!handler) {
            handler = eventName;
            eventName = '';
        }
        const current = utils.find(this.list, ([o, evn]) => obj === o && eventName === evn);
        if (!current) {
            this.list.push([obj, eventName, handler, 1]);
            return;
        }
        current[3]++;
    }

    removeHandler(obj, eventName) {
        const current = utils.find(this.list, ([o, evn]) => obj === o && evn === eventName);
        current[3]--;
        if (current[3] === 0) {
            this.list.splice(this.list.indexOf(current), 1);
        }
    }

    trigger(obj, eventName, ...args) {
        const delegates = utils.filter(this.list, ([o, evn]) => o === obj && evn === eventName);
        utils.forEach(delegates, ([o, e, h]) => h(...args));
    }
}

export { MulticastDelegate };
