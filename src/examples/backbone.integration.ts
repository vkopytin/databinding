import * as BB from 'backbone';
import { utils } from 'databindjs';


export const backboneIntegration = [{
    type: BB.Collection,
    isEqual(left, right) {
        return left === right;
    },
    properties: [{
        name: /^(length)$/i,
        getter(obj: BB.Collection, name: string) {
            if (utils.isFunction(obj[name])) {
                return obj[name]();
            }
            return obj[name];
        },
        setter(obj: BB.Collection, name: string, value) {
            throw new Error(`This is read only property ${name}`);
        },
        handler: { },
        attach(obj: BB.Collection, propName: string, handler) {
            const callback = function (this: BB.Collection, collection: BB.Collection, options) {
                handler(this, 'length');
            }
            obj.on('add remove reset', callback);

            return callback;
        },
        detach(obj: BB.Collection, propName: string, callback) {
            obj.off('add remove reset', callback);
        }
    }, {
        name: /^(\w+)$/i,
        getter(obj: BB.Collection, name: string) {
            if (utils.isFunction(obj[name])) {
                return obj[name]();
            }
            return obj[name];
        },
        setter(obj: BB.Collection, name: string, value) {
            if (utils.isFunction(obj[name])) {
                return obj[name](value);
            }
            return obj[name] = value;
        },
        handler: { },
        attach(obj: BB.Collection, propName: string, handler) {
            const callback = function (this: BB.Collection<BB.Model>, evnt, obj, model, options) {
                handler(this, propName);
            };
            obj.on('all', callback);

            return callback;
        },
        detach(obj: BB.Collection, propName: string, callback) {
            obj.off('all', callback);
        }
    }]
}, {
    type: BB.View,
    isEqual(left, right) {
        return left === right;
    },
    properties: [{
        name: /^bind\((.+)\)$/,
        getter(obj: BB.View, name: string) {

            return (obj[name]).bind(obj);
        },
        setter(obj: BB.View, name: string, value) {
            throw new Error('Deleagete is readonly property');
        },
        handler: {},
        attach(obj: { on; off;}, propName: string, handler) {
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
        name: /^get(.+)$/,
        getter(obj: BB.View, name: string) {

            return obj[`get${name}`]();
        },
        setter(obj: BB.View, name: string, value) {
            obj[`set${name}`](value);
        },
        handler: {},
        attach(obj: { on; off;}, propName: string, handler) {
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
        name: /^\$\((.+)\)$/,
        getter(obj: BB.View, name: string) {
            const v = obj.$(name);
            if (v.length) {

                return v;
            }
        },
        setter(obj: BB.View, name: string, value) {
            throw new Error(`This is read only property ${name}`);
        },
        handler: {},
        attach(obj: { on; off;}, propName: string, handler) {
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
        getter(obj: BB.View, name: string) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);

            return obj[fnName](fnValue);
        },
        setter(obj: BB.View, name: string, value) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);
            obj[fnName](fnValue);
        },
        handler: {},
        attach(obj: { on; off;}, propName: string, handler) {
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
        name: /^(\w+)$/i,
        getter(obj: BB.View, name: string) {
            if (utils.isFunction(obj[name])) {

                return obj[name]();
            }

            return obj[name];
        },
        setter(obj: BB.View, name: string, value) {
            if (utils.isFunction(obj[name])) {

                return obj[name](value);
            }

            return obj[name] = value;
        },
        handler: {},
        attach(obj: { on; off;}, propName: string, handler) {
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
}, {
    type: BB.Model,
    isEqual(left, right) {
        return left === right;
    },
    properties: [{
        name: /^get\(([^\)]+)\)$/,
        getter(obj: BB.Model, name: string) {

            return obj.get(name);
        },
        setter(obj: BB.Model, name: string, v) {
            obj.set(name, v);
        },
        handler: {
        },
        attach(obj: BB.Model, propName: string, handler) {
            const [a, eventName] = this.name.exec(propName);
            const callback = (obj) => handler(obj, propName);
            obj.on('change:' + eventName, callback);

            return callback;
        },
        detach(obj: BB.Model, propName: string, callback) {
            const [a, eventName] = this.name.exec(propName);
            obj.off('change:' + eventName, callback);
        }
    }]
}];
