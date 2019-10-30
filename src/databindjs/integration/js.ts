import { MulticastDelegate } from '../multicastDelegate';
import * as utils from '../../utils';


const jsIntegration = [{
    type: Object,
    isEqual(left, right) {
        return left === right;
    },
    properties: [{
        name: /^bind\((.+)\)$/,
        getter(obj, name: string) {

            return (obj[name]).bind(obj);
        },
        setter(obj, name: string, value) {
            throw new Error('Bind - is readonly property');
        },
        handler: { general: () => { } },
        attach(obj, propName: string, handler) {
            if ('on' in obj && 'off' in obj) {
                const callback = () => handler(obj, propName);
                obj.on('change:' + propName, callback);

                return callback;
            }
        },
        detach(obj, propName: string, callback) {
            if ('on' in obj && 'off' in obj) {
                obj.off('change:' + propName, callback);
            }
        }
    }, {
        name: /^event\((.+)\)$/,
        getter(obj, eventName) {
            return this.handler.getHandler(obj, eventName);
        },
        setter(obj, eventName: string, value) {
            this.handler.addHandler(obj, eventName, value);
        },
        handler: new MulticastDelegate(function (a) { return [this, a]; }),
        attach(obj, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            obj.on(eventName, this.handler.invoke);
        },
        detach(obj, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            this.handler.removeHandler(obj, eventName);
            obj.off(eventName, this.handler.invoke);
        }
    }, {
        name: /^(\w+\(.*\))$/i,
        getter(obj, name: string) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);

            return obj[fnName](fnValue);
        },
        setter(obj, name: string, value) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);
            obj[fnName](fnValue, value);
        },
        handler: {},
        attach(obj: { on; off; }, propName: string, handler) {
            if ('on' in obj && 'off' in obj) {
                const callback = () => handler(obj, propName);
                obj.on('change:' + propName, callback);

                return callback;
            }
        },
        detach(obj: { on; off; }, propName: string, callback) {
            if ('on' in obj && 'off' in obj) {
                obj.off('change:' + propName, callback);
            }
        }
    }, {
        name: /^(\w+\(.*\))$/i,
        getter(obj, name: string) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);

            return obj[fnName](fnValue);
        },
        setter(obj, name: string, value) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);
            obj[fnName](fnValue);
        },
        handler: {},
        attach(obj: { on; off; }, propName: string, handler) {
            if ('on' in obj && 'off' in obj) {
                const callback = () => handler(obj, propName);
                obj.on('change:' + propName, callback);

                return callback;
            }
        },
        detach(obj: { on; off; }, propName: string, callback) {
            if ('on' in obj && 'off' in obj) {
                obj.off('change:' + propName, callback);
            }
        }
    }, {
        name: /^([\$\w]+)$/i,
        getter(obj, name: string) {
            if (utils.isFunction(obj[name])) {

                return obj[name]();
            }

            return obj[name];
        },
        setter(obj, name: string, value) {
            if (utils.isFunction(obj[name])) {

                return obj[name](value);
            }

            return obj[name] = value;
        },
        handler: {},
        attach(obj: { on; off; }, propName: string, handler) {
            if ('on' in obj && 'off' in obj) {
                const callback = () => handler(obj, propName);
                obj.on('change:' + propName, callback);

                return callback;
            }
        },
        detach(obj: { on; off; }, propName: string, callback) {
            if ('on' in obj && 'off' in obj) {
                obj.off('change:' + propName, callback);
            }
        }
    }]
}];

export { jsIntegration };
