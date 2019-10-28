import * as BB from 'backbone';
import * as $ from 'jquery';
import { asyncQueue } from '../utils';
import * as utils from '../utils';
import { ValueConvertor } from './valueConvertor';
import { MulticastDelegate } from './multicastDelegate';
import { Events } from './events';


interface IDataBinding {
    onPropertyChange(...args): void;
    bindings: IBindingInfo[];
    root;
    targetId;
    sourceId;
    bindingId;
}

interface IBindingInfo {
    source: {
        fullPath: string;
        path: Array<{
            propName: string;
            canRead: boolean;
            canWrite: boolean;
        }>;
    };
    target: {
        fullPath: string;
        path: Array<{
            propName: string;
            canRead: boolean;
            canWrite: boolean;
        }>;
    };
}

const typeDescriptors: Array<{
    type: any;
    properties: Array<{
        name: RegExp;
        getter(obj, name: string): any;
        setter(obj, name: string, value): void;
        handler?: { [key: string]: (...args) => any; } | MulticastDelegate;
        attach?(obj: any, propName: string, handler: (o, p: string) => void);
        detach?(obj: any, propName: string, handler: (o, p: string) => void);
    }>;
    isEqual(left, right): boolean;
}> = [{
    type: $,
    isEqual(left, right) {
        return left[0] === right[0];
    },
    properties: [{
        name: /^addClass\((.+)\)$/,
        getter(obj: JQuery, name: string) {
            return !obj.hasClass(name);
        },
        setter(obj: JQuery, name: string, value) {
            return obj.toggleClass(name, !value);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^toggleClass\((.+)\)$/,
        getter(obj: JQuery, name: string) {
            return obj.hasClass(name);
        },
        setter(obj: JQuery, name: string, value) {
            return obj.toggleClass(name, value);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^prop\((.+)\)$/,
        getter(obj: JQuery, name: string) {
            return obj.prop(name);
        },
        setter(obj: JQuery, name: string, value) {
            obj.prop(name, value);
        },
        handler: { },
        attach(obj: JQuery, propName: string, handler) {
            const callback = evnt => handler($(evnt.currentTarget), propName);
            obj.on('input', callback);

            return callback;
        },
        detach(obj: JQuery, propName: string, callback) {
            obj.off('all', callback);
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
        attach(obj: { on; off;}, propName: string, handler) { },
        detach(obj: { on; off; }, propName: string, callback) { }
    }, {
        name: /^(checked)$/,
        getter(obj: JQuery, propName: string) {
            return obj.is(':checked');
        },
        setter(obj: JQuery, propName: string, value) {
            return obj.prop('checked', value);
        },
        handler: { },
        attach(obj: JQuery, propName: string, handler) {
            const callback = (evnt) => handler($(evnt.currentTarget), 'checked');
            obj.on('input', callback);

            return callback;
        },
        detach(obj: JQuery, propName: string, callback) {
            obj.off('input', callback);
        }
    }, {
        name: /^(val)$/,
        getter(obj: JQuery, propName: string) {
            return obj.val();
        },
        setter(obj: JQuery, propName: string, v) {
            return obj.val(v);
        },
        handler: {},
        attach(obj: JQuery, propName: string, handler) {
            const callback = (evnt) => handler($(evnt.currentTarget), 'val');
            obj.on('input', callback);

            return callback;
        },
        detach(obj: JQuery, propName: string, callback) {
            obj.off('input', callback);
        }
    }, {
        name: /^(text)$/,
        getter(obj: JQuery) {
            return obj.text();
        },
        setter(obj: JQuery, name, v) {
            return obj.text(v);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^(html)$/,
        getter(obj: JQuery) {
            return obj.html();
        },
        setter(obj: JQuery, name, v) {
            return obj.html(v);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }    
    }, {
        name: /^(keypress)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('keypress', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('keypress', this.handler.invoke);
        }
    }, {
        name: /^(click)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('click', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('click', this.handler.invoke);
        }
    }, {
        name: /^(dblclick)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('dblclick', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('dblclick', this.handler.invoke);
        }
    }, {
        name: /^(blur)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('blur', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('blur', this.handler.invoke);
        }
    }, {
        name: /^(keydown)$/,
        getter(obj: JQuery) {
            return this.handler.getHandler(obj[0]);
        },
        setter(obj: JQuery, propName: string, value) {
            this.handler.addHandler(obj[0], value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, '', evnt]),
        attach(obj: JQuery, propName: string) {
            obj.on('keydown', this.handler.invoke);
        },
        detach(obj: JQuery, propName: string) {
            this.handler.removeHandler(obj[0]);
            obj.off('keydown', this.handler.invoke);
        }
    }]
}, {
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
}, {
    type: Object,
    isEqual(left, right) {
        return left === right;
    },
    properties: [{
        name: /^bind\((.+)\)$/,
        getter(obj: BB.View, name: string) {

            return (obj[name]).bind(obj);
        },
        setter(obj: BB.View, name: string, value) {
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
        getter(obj: BB.View, name: string) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);

            return obj[fnName](fnValue);
        },
        setter(obj: BB.View, name: string, value) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);
            obj[fnName](fnValue, value);
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
        getter(obj, name: string) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);

            return obj[fnName](fnValue);
        },
        setter(obj, name: string, value) {
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
        handler: {
            general(this: object, evntData: { propName: string; }) {
                dispatch(this, evntData);
            }
        },
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
}];

const valueFilters = {
    bool: v => !!v,
    not: v => !v
}

const getTypeInfo = obj => {
    const typeDescriptor = utils.find(typeDescriptors, td => obj instanceof td.type);

    return {
        ...typeDescriptor,
        getProperty(name: string) {
            const [propNameAndTag, ...filters] = name.split('|');
            const [propName, tag] = propNameAndTag.split('@');
            const pi = utils.find(typeDescriptor.properties, pi => pi.name && pi.name.test(propName));
            if (pi) {
                const propNameRxRes = pi.name.exec(propName);
                const propInfo = {
                    filters: utils.map(filters, filterName => valueFilters[filterName]),
                    getValue: (propName => (obj) => {

                        return utils.reduce(propInfo.filters, (res, f) => f(res), pi.getter(obj, propName));
                    })(propNameRxRes[1]),
                    setValue: (propName => (obj, v) => {
                        pi.setter(obj, propName, utils.reduce(propInfo.filters, (res, f) => f(res), v));
                    })(propNameRxRes[1]),
                    name: pi.name,
                    handler: pi.handler,
                    attach: pi.attach,
                    detach: pi.detach
                };

                return propInfo;
            }
        },
        isEqual(left, right) {
            if (left === right) {
                return true;
            }
            if (left === undefined || right === undefined || left === null || right === null) {
                return false;
            }
            return typeDescriptor ? typeDescriptor.isEqual(left, right) : false;
        }
    };
}

const queue = asyncQueue();

const getValueByProperty = (obj, propName) => {
    const ti = getTypeInfo(obj);
    const pi = ti.getProperty(propName);
    const val = pi.getValue(obj);

    return val;
}

const setValue = (toState: { itemTi, propName: string, item; }, value: any) => {
    const typeInfo = toState.itemTi; // getTypeInfo(toState.item);
    const pi = typeInfo.getProperty(toState.propName);
    pi.setValue(toState.item, value);
}

const attachEvent = (item, itemTi, propName: string, handler: (obj, propName: string) => void, listening: Array<{ h; c; }>) => {
    const typeInfo = itemTi; // getTypeInfo(stateItem.item);
    const pi = typeInfo.getProperty(propName);
    const c = pi.attach(item, propName, handler);
    listening.push({ h: handler, c });
}

const detachEvent = (item, itemTi, propName: string, handler: (obj, propName: string) => void, listening: Array<{ h; c; }>) => {
    const typeInfo = itemTi; // getTypeInfo(stateItem.item);
    const pi = typeInfo.getProperty(propName);
    const c = utils.find(listening, l => l[0] === handler);

    if (c) {
        pi.detach(item, propName, c);
        listening.splice(listening.indexOf(c), 1);
    }
}

//const rxSplitDot = () => /\.(?!(?:[^(]*\))|(?:[^\[]*\])|(?!(?:(?:[^']*'){2})*[^']*$))/g;
const rxSplitDot = () => /\.(?<!(?:\(([^()]|\(([^()]|\(([^()]|(([^()])*\))*\))*\))*\))|(?:[^\[]*\])|(?!(?:(?:[^']*'){2})*[^']*$)))/g;
const splitDeclaration = (d: string) => {
    const rxByDot = /\.(?<!(?:\(([^()]|\(([^()]|\(([^()]|(([^()])*\))*\))*\))*\))|(?:[^\[]*\])|(?!(?:(?:[^']*'){2})*[^']*$)))/g;

    return utils.filter(d.split(rxByDot), i => !!i);
}

interface IStateRecord {
    [propName: string]: [
        IStateRecord,
        any, // item
        any, // itemTi
        any, // value
        (o, p: string) => void,
        Array<{ h; c; }>,
        string,
    ]
}

interface IStateAction {
    propName: string;
    item: any;
    id?: string;
}

const createNewStateItem = (rootItem, item, propName, aId: string) => {
    const ti = item && getTypeInfo(item);
    const pi = item && ti.getProperty(propName);
    const value = item && pi.getValue(item);

    return [{}, item, ti, value, makeEventHandler(rootItem), [], aId];
}

const makeEventHandler = (rootItem) => (obj, propName: string) => {
    queue.push((next, opId) => {
        const newState = dispatchTo(rootItem, rootItem.state, {
            item: obj,
            propName: propName,
            id: opId
        });
        if (newState !== rootItem.state) {
            rootItem.state = newState;
            rootItem.events.trigger('change');
            mainState[rootItem.dataBinding.bindingId] = newState;
        }
        next();
    });
}

const updateStateItem = (rootItem, state: IStateRecord, action: IStateAction): IStateRecord => {
    if (!state[action.propName]) {
        const newState = createNewStateItem(rootItem, action.item, action.propName, action.id);
        newState[1] && attachEvent(newState[1], newState[2], action.propName, newState[4], newState[5]);

        return {
            ...state,
            [action.propName]: newState
        } as IStateRecord;
    }
    const [children, item, itemTi, value, h, listening] = state[action.propName];
    const [c, newItem, newItemTi, newValue, newH, newListening] = createNewStateItem(rootItem, action.item, action.propName, action.id);

    if (newItem) {
        if (utils.isNullOrUndefined(item) || !itemTi.isEqual(item, newItem)) {
            item && detachEvent(item, itemTi, action.propName, h, listening);
            attachEvent(newItem, newItemTi, action.propName, newH, newListening);

            return {
                ...state,
                [action.propName]: [children, newItem, newItemTi, newValue, newH, newListening, action.id]
            };
        } else {
            const valueTi = getTypeInfo(value);
            if (utils.isNullOrUndefined(value) || !valueTi.isEqual(value, newValue)) {

                return {
                    ...state,
                    [action.propName]: [children, item, itemTi, newValue, h, listening, action.id]
                };
            }
        }

        return state;
    }

    item && detachEvent(item, itemTi, action.propName, h, listening);

    return {
        ...state,
        [action.propName]: [children, null, null, null, null, [], action.id]
    };
}

const initPathWithState = (
    rootItem: any,
    state: IStateRecord,
    [path, ...pathInfo]: Array<{ propName: string }>,
    currentItem: any
): IStateRecord => {
    if (!path) {

        return state;
    }
    const firstState = updateStateItem(rootItem, state, { propName: path.propName, item: currentItem });
    const [children, item, itemTi, value, h, l] = firstState[path.propName];
    const newState = initPathWithState(rootItem, children, pathInfo, value);

    return {
        ...state,
        [path.propName]: [newState, item, itemTi, value, h, l, null]
    };
}

const syncStateWithChildrens = (rootItem, state: IStateRecord, action: { propName: string; item: any; id?: string; }): IStateRecord => {
    const firstState = updateStateItem(rootItem, state, action);
    const [children, item, itemTi, value, h, l] = firstState[action.propName];
    const newChildren = utils.reduce(Object.keys(children), (nextState, key) => {
        const newSubChildren = syncStateWithChildrens(rootItem, nextState, { propName: key, item: value });

        if (newSubChildren !== nextState) {

            return {
                ...nextState,
                [key]: newSubChildren[key]
            };
        }

        return nextState;
    }, children);

    if (firstState !== state || children !== newChildren) {

        return {
            ...state,
            [action.propName]: [newChildren, item, itemTi, value, h, l, action.id]
        };
    }

    return state;
}

const syncState = (rootItem, state: IStateRecord, action: IStateAction): IStateRecord => {

    return utils.reduce(Object.keys(state), (oldState, key) => {
        const [children, oldItem, oldItemTi, oldValue, oldH, oldL] = oldState[key];
        const item = action.item;

        if (key === action.propName) {
            if (!utils.isNullOrUndefined(oldItem) && oldItemTi.isEqual(oldItem, item)) {
                const newState = syncStateWithChildrens(rootItem, oldState, action);
                if (newState !== oldState) {
                    const [newChildren, newItem, newItemTi, newValue, newH, newL] = newState[key];

                    return {
                        ...newState,
                        [key]: [syncState(rootItem, newChildren, action), newItem, newItemTi, newValue, newH, newL, action.id]
                    };
                }

                return oldState;
            }
        }
        const newChildren = syncState(rootItem, children, action);
        if (newChildren !== children) {

            return {
                ...oldState,
                [key]: [newChildren, oldItem, oldItemTi, oldValue, oldH, oldL, action.id]
            };
        }

        return oldState;
    }, state);
}

const getFullPath = (state: IStateRecord, action: IStateAction): string[] => {

    return utils.reduce(Object.keys(state), (res, key) => {
        const [children, oldItem, oldItemTi] = state[key];
        const item = action.item;

        if (key === action.propName) {
            if (!utils.isNullOrUndefined(oldItem) && oldItemTi.isEqual(oldItem, item)) {

                return utils.reduce([...res, key], (subRes, path) => {
                    const subPaths = getFullPath(children, action);
                    if (subPaths.length) {

                        return [...subRes, ...utils.map(subPaths, subPath => path + '.' + subPath)];
                    }

                    return [...subRes, path];
                }, res);
            }
        }

        const subPaths = getFullPath(children, action);
        if (subPaths.length) {

            return [...res, ...utils.map(subPaths, subPath => key + '.' + subPath)];
        }

        return res;
    }, []);
}

const transferValue = (rootItem, state: IStateRecord, dataBinding: IDataBinding, action: IStateAction) => {
    const pathStrArr = getFullPath(state, action);
    const transferToTarget = utils.reduce(dataBinding.bindings, (res, bindingInfo) => {
        const sourcePathStr = bindingInfo.source.fullPath;

        return utils.reduce(pathStrArr, (res, pathStr) => {
            if (sourcePathStr.indexOf(pathStr) === 0) {

                return [...res, bindingInfo];
            }

            return res;
        }, res);
    }, [] as IBindingInfo[]);
    const transferToSource = utils.reduce(dataBinding.bindings, (res, bindingInfo) => {
        const sourcePathStr = bindingInfo.target.fullPath;

        return utils.reduce(pathStrArr, (res, pathStr) => {
            if (sourcePathStr.indexOf(pathStr) === 0) {

                return [...res, bindingInfo];
            }

            return res;
        }, res);
    }, [] as IBindingInfo[]);

    const newTargetState = utils.reduce(transferToTarget, (oldState, bi) => {
        const source = utils.reduce(bi.source.path, (res, path) => {
            if (!res.state) {

                return {
                    state: res.state,
                    item: null,
                    itemTi: null,
                    value: null,
                    propName: path.propName,
                    canRead: path.canRead,
                    canWrite: path.canWrite,
                    aId: action.id
                };
            }

            return {
                state: res.state[path.propName][0],
                item: res.state[path.propName][1],
                itemTi: res.state[path.propName][2],
                value: res.state[path.propName][3],
                propName: path.propName,
                canRead: path.canRead,
                canWrite: path.canWrite,
                aId: res.state[path.propName][6]
            };
        }, { state: oldState, item: null, itemTi: null, value: null, propName: '', canRead: true, aId: action.id });
        const target = utils.reduce(bi.target.path, (res, path) => {
            if (!res.state) {

                return {
                    state: res.state,
                    item: null,
                    itemTi: null,
                    value: null,
                    propName: path.propName,
                    canRead: path.canRead,
                    canWrite: path.canWrite,
                    aId: action.id
                };
            }

            return {
                state: res.state[path.propName][0],
                item: res.state[path.propName][1],
                itemTi: res.state[path.propName][2],
                value: res.state[path.propName][3],
                propName: path.propName,
                canRead: path.canRead,
                canWrite: path.canWrite,
                aId: res.state[path.propName][6]
            };
        }, { state: oldState, item: null, itemTi: null, value: null, propName: '', canRead: true, aId: action.id });

        if (!target.item || !source.item) {

            return;
        }
        let newTargetState = oldState;
        const targetValue = ValueConvertor.changeType(target.value, source.value);
        if (
            target.canRead && source.value !== targetValue
            && !(source.aId === action.id && target.aId === source.aId) // recursive set terminator
        ) {
            const value = ValueConvertor.changeType(source.value, targetValue);
            setValue(target, value);

            newTargetState = dispatchTo(rootItem, oldState, {
                item: target.item,
                propName: target.propName,
                id: action.id
            });
        }

        if (newTargetState !== oldState) {

            return {
                ...oldState,
                ...newTargetState
            };
        }

        return oldState;
    }, state);

    const newSourceState = utils.reduce(transferToSource, (oldState, bi) => {
        const source = utils.reduce(bi.source.path, (res, path) => {
            if (!res.state) {

                return {
                    state: res.state,
                    item: null,
                    itemTi: null,
                    value: null,
                    propName: path.propName,
                    canRead: path.canRead,
                    canWrite: path.canWrite,
                    aId: action.id
                };
            }

            return {
                state: res.state[path.propName][0],
                item: res.state[path.propName][1],
                itemTi: res.state[path.propName][2],
                value: res.state[path.propName][3],
                propName: path.propName,
                canRead: path.canRead,
                canWrite: path.canWrite,
                aId: res.state[path.propName][6]
            };
        }, { state: oldState, item: null, itemTi: null, value: null, propName: '', canRead: true, canWrite: true, aId: action.id });
        const target = utils.reduce(bi.target.path, (res, path) => {
            if (!res.state) {

                return {
                    state: res.state,
                    item: null,
                    itemTi: null,
                    value: null,
                    propName: path.propName,
                    canRead: path.canRead,
                    canWrite: path.canWrite,
                    aId: action.id
                };
            }

            return {
                state: res.state[path.propName][0],
                item: res.state[path.propName][1],
                itemTi: res.state[path.propName][2],
                value: res.state[path.propName][3],
                propName: path.propName,
                canRead: path.canRead,
                canWrite: path.canWrite,
                aId: res.state[path.propName][6]
            };
        }, { state: oldState, item: null, itemTi: null, value: null, propName: '', canRead: true, canWrite: true, aId: action.id });

        if (!source.item || !target.item) {

            return;
        }
        let newSourceState = oldState;
        const sourceValue = ValueConvertor.changeType(source.value, target.value);
        if (
            target.canWrite && target.value !== sourceValue
            && !(source.aId === action.id && target.aId === source.aId) // recursive set terminator
        ) {
            const value = ValueConvertor.changeType(target.value, sourceValue);
            setValue(source, value);

            newSourceState = dispatchTo(rootItem, oldState, {
                item: source.item,
                propName: source.propName,
                id: action.id
            });
        }

        if (newSourceState !== oldState) {

            return {
                ...oldState,
                ...newSourceState
            };
        }

        return oldState;
    }, newTargetState);

    if (newSourceState !== state) {

        return {
            ...state,
            ...newSourceState
        };
    }

    return state;
}

const updateLayoutTo = (state: IStateRecord, obj) => {
    const nextTargetState = syncState(obj, state, {item: obj, propName: 't'});
    const nextSourceState = dispatchTo(obj, nextTargetState, { item: obj, propName: 's' });
    const nextSourceTransferState = dispatchTo(obj, nextSourceState, { item: obj, propName: 't' });
    const nextTargetTransferState = dispatchTo(obj, nextSourceTransferState, { item: obj, propName: 't' });

    if (nextTargetTransferState !== state) {

        return {
            ...state,
            ...nextTargetTransferState
        };
    }

    return state;
}

const updateLayout = (obj: { s; t; state: IStateRecord; dataBinding: IDataBinding; events: Events; }) => {
    queue.push((next, opId) => {
        //const newState = updateLayoutTo(obj.state, obj);
        let newState = syncState(obj, obj.state, {
            item: obj,
            propName: 't',
            id: opId
        });
        const actionsSource = utils.map(obj.dataBinding.bindings, bi => ({
            item: newState[bi.source.path[0].propName][0][bi.source.path[1].propName][1],
            propName: bi.source.path[1].propName,
            id: opId
        }));
        newState = utils.reduce(actionsSource, (newState, action) => dispatchTo(obj, newState, action), newState);
        newState = syncState(obj, newState, {
            item: obj,
            propName: 't',
            id: opId
        });
        newState = utils.reduce(actionsSource, (newState, action) => dispatchTo(obj, newState, action), newState);
        newState = dispatchTo(obj, newState, { item: obj, propName: 't' });

        if (newState !== obj.state) {
            obj.state = newState
            obj.events.trigger('change');
            mainState[obj.dataBinding.bindingId] = newState;
        }
        next();
    });
}

const dispatchTo = (rootItem, state: IStateRecord, action: IStateAction) => {
    const nextState = syncState(rootItem, state, action);
    const newState = transferValue(rootItem, nextState, nextState['t'][1].dataBinding, action);
    if (state !== newState) {

        return {
            ...state,
            ...newState
        };
    }

    return state;
}

const dispatch = (obj, propChangeEventArgs: { propName: string }) => {
    queue.push((next, opId) => {
        //try {
        mainState = window['mainState'] = utils.reduce(Object.keys(mainState), (oldState, key) => {
            const newState = dispatchTo(oldState[key].t[1], oldState[key], {
                item: obj,
                propName: propChangeEventArgs.propName,
                id: opId
            });
            if (newState !== oldState[key]) {
                const rootItem = newState.t[1];
                rootItem.state = newState;
                rootItem.events.trigger('change');

                return {
                    ...oldState,
                    [key]: newState
                };
            }

            return oldState;
        }, mainState);
        next();
    });
    //} catch (ex) {
    //    setTimeout(() => { throw ex });
    //}
}

const bindToState = (root, state: IStateRecord, bi: IBindingInfo) => {
    const nextState = initPathWithState(root, state, bi.source.path, root);
    const newState = initPathWithState(root, nextState, bi.target.path, root);

    return newState;
}

const subscribeToChange = (rootItem: { events: Events; }, handler) => {
    rootItem.events.on('change', handler);
}

const toStateObject = (state, rootItem: { s; t; state: IStateRecord, dataBinding: IDataBinding }) => {
    return utils.reduce(rootItem.dataBinding.bindings, (oldState, bi) => {
        let newState = oldState;
        const res = utils.reduce(bi.target.path, (res, path, index) => {
            if (!res.state) {
                return {
                    current: res.current[path.propName] = bi.target.path.length - 1 > index
                        ? res.current[path.propName] || (res.current[path.propName] = { })
                        : null,
                    state: res.state,
                    value: null,
                    propName: path.propName
                };
            }

            return {
                current: res.current[path.propName] = bi.target.path.length - 1 > index
                    ? res.current[path.propName] || (res.current[path.propName] = { })
                    : res.state[path.propName][3],
                state: res.state[path.propName][0],
                value: res.state[path.propName][3],
                propName: path.propName
            };
        }, { current: newState, state: rootItem.state, value: null, propName: '' });
        return newState.t;
    }, state || {});
}

const toDataBindings = (root, bindingsDecl: {
    [key: string]: string | string[]
}): IDataBinding => {
    let dataBinding;
    const bindingId = utils.uniqueId('binding-');
    const targetId = utils.uniqueId('target-');
    const sourceId = utils.uniqueId('source-');
    const declaration = utils.reduce(Object.keys(bindingsDecl), (res, key) => [...res, key, bindingsDecl[key]], []);
    const dataBindings = utils.reduce(declaration, ([first, ...res], decl, index) => {
        let a, isTargetReadWrite, isSourceReadWrite, fullPath;
        [a, isTargetReadWrite, fullPath] = decl.split(/^([-+])?(.+)/i);
        const targetPath = splitDeclaration(`t.${fullPath}`);
        if (index % 2 === 0) {

            return [{
                source: {
                    fullPath: '',
                    path: [],
                    filters: []
                },
                target: {
                    fullPath: targetPath.join('.'),
                    path: utils.reduce(targetPath, (res, i) => [...res, {
                        propName: i,
                        canRead: '+' !== isTargetReadWrite,
                        canWrite: '-' !== isTargetReadWrite
                    }], [] as Array<{ propName: string; canRead: boolean; canWrite: boolean; }>)
                }
            }, ...first ? [first, ...res] : res];
        }
        let sourcePath: string[];
        let isTargetRoot: boolean;
        if (/^\./.test(decl)) {
            [a, isSourceReadWrite, fullPath] = decl.split(/^([-+])?(.+)/i);
            sourcePath = splitDeclaration(`t${fullPath}`.replace(/^\./, ''));
            isTargetRoot = true;
        } else {
            [a, isSourceReadWrite, fullPath] = decl.split(/^([-+])?(.+)/i);
            sourcePath = splitDeclaration(`s.${fullPath}`);
            isTargetRoot = false;
        }

        return [{
            ...first,
            source: {
                fullPath: sourcePath.join('.'),
                path: utils.reduce(sourcePath, (res, i) => [...res, {
                    propName: i,
                    canRead: '+' !== isSourceReadWrite,
                    canWrite: '-' !== isSourceReadWrite
                }], [] as Array<{ propName: string; canRead: boolean; canWrite: boolean; }>)
            }
        }, ...res];
    }, [] as IBindingInfo[]);

    return dataBinding = {
        bindingId,
        targetId,
        sourceId,
        onPropertyChange: (obj, eventData: { propName: string; fullPath?: string; }) => {

        },
        bindings: dataBindings,
        root: root
    }
};

let mainState = window['mainState'] = {} as {
    [key: string]: {
        s?: [IStateRecord, { s; t; state: IStateRecord }, any, any, (o, p: string) => void, Array<{ h; c; }>, string],
        t?: [IStateRecord, { s; t; state: IStateRecord }, any, any, (o, p: string) => void, Array<{ h; c; }>, string]
    }
};

const bindTo = (obj, sourceFrom: () => any, bindingsDecl: { [key: string]: string | string[] }) => {
    const rootItem = {
        s: sourceFrom(),
        t: obj,
        state: null,
        dataBinding: null,
        events: new Events()
    };
    const dataBinding = rootItem.dataBinding = toDataBindings(rootItem, bindingsDecl);
    const state = utils.reduce(dataBinding.bindings, (state, bi) => bindToState(rootItem, state, bi), {});
    rootItem.state = state;
    mainState[dataBinding.bindingId] = state;

    return rootItem;
}

const unbindFrom = (rootItem: { s; t; state: IStateRecord, dataBinding: IDataBinding; events: Events; }) => {
    rootItem.s = null;
    rootItem.t = null;
    rootItem.events = null;
    rootItem.state = utils.reduce(rootItem.dataBinding.bindings, (state, bi) => bindToState(rootItem, state, bi), {});
    delete mainState[rootItem.dataBinding.bindingId];
}

export { bindTo, unbindFrom, dispatch, updateLayout, toStateObject, subscribeToChange };
