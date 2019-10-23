import * as BB from 'backbone';
import * as $ from 'jquery';
import { asyncQueue } from '../utils';
import * as utils from '../utils';
import { ValueConvertor } from './valueConvertor';
import { MulticastDelegate } from './multicastDelegate';


type Constructor<T = {}> = new (...args: any[]) => T;

interface IDataBinding {
    onPropertyChange(...args): void;
    bindings: IBindingInfo[];
    sourceFrom: string;
    root;
    targetId;
    sourceId;
}

interface IBindingInfo {
    source: {
        path: Array<{
            fullPath: string;
            propName: string;
        }>;
    };
    target: {
        path: Array<{
            fullPath: string;
            propName: string;
        }>;
    };
}

interface IDetachedState {
    item: any,
    propName: string;
    itemTi: ReturnType<typeof getTypeInfo>;
}

interface IStateItem {
    item: any;
    fullPath: string;
    propName: string;
    value: any;
    onChange: (obj, eventData: { propName: string; fullPath: string; }) => void;
    itemTi: ReturnType<typeof getTypeInfo>;
    valueTi: ReturnType<typeof getTypeInfo>;
    canRead: boolean;
    canWrite: boolean;
}

const typeDescriptors: Array<{
    type: any;
    properties: Array<{
        name: RegExp;
        getter(obj, name: string): any;
        setter(obj, name: string, value): void;
        handler?: { [key: string]: (...args) => any; } | MulticastDelegate;
        attach?(obj: any, propName: string);
        detach?(obj: any, propName: string);
    }>;
    events?: {
        change: {
            handler: { [key: string]: (...args) => any; };
            attach(obj: any, propName: string);
            detach(obj: any, propName: string);
        };
    };
}> = [{
    type: $,
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
        attach(obj: JQuery, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            if (!this.handler[eventName]) {
                this.handler[eventName] = function (evnt) {
                    dispatch($(event.currentTarget), {
                        propName: propName
                    });
                }
            }
            obj.on('input', this.handler[propName]);
        },
        detach(obj: JQuery, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            obj.off('all', this.handler[eventName]);
        }
    }, {
        name: /^(checked)$/,
        getter(obj: JQuery, propName: string) {
            return obj.is(':checked');
        },
        setter(obj: JQuery, propName: string, value) {
            return obj.prop('checked', value);
        },
        handler: {
            checked: (evnt) => {
                dispatch($(evnt.currentTarget), {
                    propName: 'checked'
                });
            }
        },
        attach(obj: JQuery, propName: string) {
            obj.on('input', this.handler[propName]);
        },
        detach(obj: JQuery, propName: string) {
            obj.off('input', this.handler[propName]);
        }
    }, {
        name: /^(val)$/,
        getter(obj: JQuery, propName: string) {
            return obj.val();
        },
        setter(obj: JQuery, propName: string, v) {
            return obj.val(v);
        },
        handler: {
            val: (evnt) => {
                dispatch($(evnt.currentTarget), {
                    propName: 'val'
                });
            }
        },
        attach(obj: JQuery, propName: string) {
            obj.on('input', this.handler[propName]);
        },
        detach(obj: JQuery, propName: string) {
            obj.off('input', this.handler[propName]);
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
        handler: new MulticastDelegate(evnt => [event.currentTarget, evnt]),
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
        handler: new MulticastDelegate(evnt => [event.currentTarget, evnt]),
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
        handler: new MulticastDelegate(evnt => [event.currentTarget, evnt]),
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
        handler: new MulticastDelegate(evnt => [event.currentTarget, evnt]),
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
        handler: new MulticastDelegate(evnt => [event.currentTarget, evnt]),
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
        handler: {
            general: function (this: BB.Collection, collection: BB.Collection, options) {
                dispatch(this, {
                    propName: 'length'
                });
            },
        },
        attach(obj: BB.Collection, propName: string) {
            obj.on('add remove reset', this.handler.general);
        },
        detach(obj: BB.Collection, propName: string) {
            obj.off('add remove reset', this.handler.general);
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
        attach(obj: BB.Collection, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            if (!this.handler[eventName]) {
                this.handler[eventName] = function (this: BB.Collection<BB.Model>, evnt, obj, model, options) {
                    dispatch(this, {
                        propName: propName
                    });
                }
            }
            obj.on('all', this.handler[eventName]);
        },
        detach(obj: BB.Collection, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            obj.off('all', this.handler[eventName]);
        }
    }]
}, {
    type: BB.View,
    properties: [{
        name: /^bind\((.+)\)$/,
        getter(obj: BB.View, name: string) {
            return (obj[name]).bind(obj);
        },
        setter(obj: BB.View, name: string, value) {
            throw new Error('Deleagete is readonly property');
        }
    }, {
        name: /^get(.+)$/,
        getter(obj: BB.View, name: string) {
            return obj[`get${name}`]();
        },
        setter(obj: BB.View, name: string, value) {
            obj[`set${name}`](value);
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
        }
    }],
    events: {
        change: {
            handler: {
                general(this: BB.View, evntData: { propName: string; }) {
                    dispatch(this, evntData);
                }
            },
            attach(obj: BB.View, propName: string) {
                obj.off('propertyChange', this.handler.general);
                obj.on('propertyChange', this.handler.general);
            },
            detach(obj: BB.View, propName: string) {
                obj.off('propertyChange', this.handler.general);
            }
        }
    }
}, {
    type: BB.Model,
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
        attach(obj: BB.Model, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            if (!this.handler[eventName]) {
                this.handler[eventName] = (obj) => {
                    dispatch(obj, {
                        propName: propName
                    });
                }
            }
            obj.on('change:' + eventName, this.handler[eventName]);
        },
        detach(obj: BB.Model, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            obj.off('change:' + eventName, this.handler[eventName]);
        }
    }]
}, {
    type: Object,
    properties: [{
        name: /^bind\((.+)\)$/,
        getter(obj: BB.View, name: string) {
            return (obj[name]).bind(obj);
        },
        setter(obj: BB.View, name: string, value) {
            throw new Error('Bind - is readonly property');
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
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
        handler: {
            general(this: object, evntData: { propName: string; }) {
                dispatch(this, evntData);
            }
        },
        attach(obj: { on; off;}, propName: string) {
            if ('on' in obj && 'off' in obj) {
                obj.off('propertyChange', this.handler.general);
                obj.on('propertyChange', this.handler.general);
            }
        },
        detach(obj: { on; off; }, propName: string) {
            if ('on' in obj && 'off' in obj) {
                obj.off('propertyChange', this.handler.general);
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
        attach(obj: { on; off;}, propName: string) {
            if ('on' in obj && 'off' in obj) {
                obj.off('propertyChange', this.handler.general);
                obj.on('propertyChange', this.handler.general);
            }
        },
        detach(obj: { on; off; }, propName: string) {
            if ('on' in obj && 'off' in obj) {
                obj.off('propertyChange', this.handler.general);
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
                    handler: pi.handler || typeDescriptor.events.change.handler,
                    attach: pi.attach || typeDescriptor.events.change.attach,
                    detach: pi.detach || typeDescriptor.events.change.detach
                };
                return propInfo;
            }
        },
        isEqual(typeInfo) {
            return typeDescriptor.type === typeInfo.type;
        }
    };
}

const stateMap = window['stateMap'] = [] as IStateItem[];
console.log(stateMap);
const queue = asyncQueue();

const getValueByProperty = (obj, propName) => {
    const ti = getTypeInfo(obj);
    const pi = ti.getProperty(propName);
    const val = pi.getValue(obj);
    return val;
}

const setValue = (toState: IStateItem, value: any) => {
    const typeInfo = toState.itemTi; // getTypeInfo(toState.item);
    const pi = typeInfo.getProperty(toState.propName);
    pi.setValue(toState.item, value);
}

const attachEvent = (stateItem: { itemTi, propName: string, item; }) => {
    const typeInfo = stateItem.itemTi; // getTypeInfo(stateItem.item);
    const pi = typeInfo.getProperty(stateItem.propName);
    pi.attach(stateItem.item, stateItem.propName);
}

const detachEvent = (stateItem: { itemTi, propName: string, item; }) => {
    const typeInfo = stateItem.itemTi; // getTypeInfo(stateItem.item);
    const pi = typeInfo.getProperty(stateItem.propName);
    pi.detach(stateItem.item, stateItem.propName);
}

const fillStateRecords = ({
    dataBinding,
    context,
    stateItems,
    contextTi = getTypeInfo(context)
}: {
    dataBinding: IDataBinding;
    context: any;
    stateItems: IStateItem[];
    contextTi?;
}, pathInfo: {
    fullPath: string;
    propName: string;
    canRead: boolean;
    canWrite: boolean;
}) => {
    if (context === undefined || context === null) {
        return { dataBinding, context, stateItems, contextTi };
    }
    const pi = contextTi.getProperty(pathInfo.propName);
    let value = pi.getValue(context);
    const stateItem: IStateItem = {
        fullPath: pathInfo.fullPath,
        item: context,
        itemTi: contextTi,
        valueTi: getTypeInfo(value),
        propName: pathInfo.propName,
        value: value,
        onChange: dataBinding.onPropertyChange,
        canRead: pathInfo.canRead,
        canWrite: pathInfo.canWrite
    };

    stateItems.push(stateItem);
    return { dataBinding, context: value, stateItems, contextTi: stateItem.valueTi };
};

const getChildrenByFullPath = (
    state: IStateItem[],
    parent: IStateItem,
    [pathInfo, ...resPi]: Array<{ fullPath: string; propName: string }>
): IStateItem[] => {
    if (!pathInfo) {
        return [];
    }
    const fullPath = pathInfo.fullPath;
    return utils.reduce(state, (res, item): IStateItem[] => {
        if (fullPath !== item.fullPath) {
            return res;
        }
        const children = getChildrenByFullPath(state, item, resPi);
        return [...res, item, ...children];
    }, []);
}

const getParentsByFullPath = (
    state: IStateItem[],
    child: IStateItem
): IStateItem[] => {
    const fullPath = child.fullPath
    return utils.reduce(state, (res, item): IStateItem[] => {
        if ((child.propName + '.' + item.fullPath) === fullPath) {
            const parents = getParentsByFullPath(state, item);
            if (parents.length) {
                return [...res, ...parents, item];
            }
            return [...res, item];
        }
        return res;
    }, []);
}

const isValueEqual = (left, right) => {
    const leftTi = getTypeInfo(left);
    const rightTi = getTypeInfo(right);

    if (
        left === right
        || leftTi && leftTi.type === $ && leftTi.isEqual(rightTi) && left[0] === right[0]
    ) {
        return true;
    }
    return false;
}

const pathFromStates = (states: Array<{
    propName?: string;
}>) => utils.reduce(states, (res, item) => [...res, item.propName], [] as string[]).join('.');

const findOldState = (oldState: IStateItem[], newState: IDetachedState) => {
    const childTi = newState.itemTi; // || getTypeInfo(newState.item);
    const nsPn = newState.propName;
    return utils.filter(oldState, (stateItem: IStateItem) => {
        if (nsPn !== stateItem.propName) {

            return false;
        }
        const itemTi = stateItem.itemTi; // getTypeInfo(stateItem.item);

        return stateItem.item === newState.item
            || itemTi && itemTi.type === $ && itemTi.isEqual(childTi) && stateItem.item[0] === newState.item[0];
    });
};

const applyNewState = (
    oldState: IStateItem[],
    dataBinding: IDataBinding,
    newState: IStateItem
) => {
    const rootItem = dataBinding.root;
    const fromPath = [...getParentsByFullPath(stateMap, newState), newState];
    const pathStr = pathFromStates(fromPath);
    const syncBindings = utils.reduce(dataBinding.bindings, (res, bindingInfo) => {
        const targetPathStr = pathFromStates(bindingInfo.target.path);
        const sourcePathStr = pathFromStates(bindingInfo.source.path);
        if (sourcePathStr.indexOf(pathStr) === 0) {
            return [...res, {
                sourceChanged: true,
                bindingInfo
            }];
        }
        if (targetPathStr.indexOf(pathStr) === 0) {
            return [...res, {
                sourceChanged: false,
                bindingInfo
            }];
        }
        return res;
    }, [] as Array<{ sourceChanged: boolean; bindingInfo: IBindingInfo; }>);
    const syncInfo = utils.reduce(syncBindings, (resSyncInfo, { bindingInfo, sourceChanged }) => {
        const targetInfo = utils.reduce(bindingInfo.target.path, fillStateRecords, { dataBinding, context: rootItem, stateItems: [] });
        const sourceInfo = utils.reduce(bindingInfo.source.path, fillStateRecords, { dataBinding, context: rootItem, stateItems: [] });
        const oldTargetState = utils.map(findOldState(stateMap, targetInfo.stateItems[0]), (i) => {
            return [i, ...getChildrenByFullPath(stateMap, i, utils.rest(bindingInfo.target.path))];
        });
        const oldSourceState = utils.map(findOldState(stateMap, sourceInfo.stateItems[0]), (i) => {
            return [i, ...getChildrenByFullPath(stateMap, i, utils.rest(bindingInfo.source.path))];
        });
        const syncTargetStates = utils.reduce(bindingInfo.target.path, (res, pathPart, index) => {
            const ns = targetInfo.stateItems[index];
            if (oldTargetState.length === 0) {
                return {
                    ...res,
                    create: ns ? [...res.create, ns] : res.create
                };
            }
            return utils.reduce(oldTargetState, ({ update, remove, create }, oss) => {
                const os = oss[index];
                if (!os && !ns) {
                    return { update, remove, create };
                }
                const exists = os && ns && utils.first(findOldState([os], ns));
                if (!exists) {
                    return {
                        update,
                        remove: os ? [...remove, os] : remove,
                        create: ~create.indexOf(ns) ? create : ns ? [...create, ns] : create
                    };
                }
                if (ns && !isValueEqual(exists.value, ns.value)) {
                    if (index + 1 === bindingInfo.target.path.length) {
                        return {
                            update: [...update, {
                                oldState: os,
                                newState: ns
                            }],
                            remove, create
                        };
                    } else {
                        return {
                            update,
                            remove: os ? [...remove, os] : remove,
                            create: ~create.indexOf(ns) ? create : [...create, ns]
                        };
                    }
                }
                return { update, remove, create };
            }, res);
        }, {
            update: [] as Array<{
                oldState: IStateItem,
                newState: IStateItem
            }>,
            remove: [] as IStateItem[],
            create: [] as IStateItem[]
        });
        const syncSourceStates = utils.reduce(bindingInfo.source.path, (res, pathPart, index) => {
            const ns = sourceInfo.stateItems[index];
            if (oldSourceState.length === 0) {
                return {
                    ...res,
                    create: ns ? [...res.create, ns] : res.create
                };
            }
            return utils.reduce(oldSourceState, ({ update, remove, create }, oss) => {
                const os = oss[index];
                if (!os && !ns) {
                    return { update, remove, create };
                }
                const exists = os && ns && utils.first(findOldState([os], ns));
                if (!exists) {
                    return {
                        update,
                        remove: os ? [...remove, os] : remove,
                        create: ~create.indexOf(ns) ? create : ns ? [...create, ns] : create
                    };
                }
                if (ns && !isValueEqual(exists.value, ns.value)) {
                    if (index + 1 === bindingInfo.source.path.length) {
                        return {
                            update: [...update, {
                                oldState: os,
                                newState: ns
                            }],
                            remove, create
                        };
                    } else {
                        return {
                            update,
                            remove: os ? [...remove, os] : remove,
                            create: ~create.indexOf(ns) ? create : [...create, ns]
                        };
                    }
                }
                return { update, remove, create };
            }, res);
        }, {
            update: [] as Array<{
                oldState: IStateItem,
                newState: IStateItem
            }>,
            remove: [] as IStateItem[],
            create: [] as IStateItem[]
        });
        return {
            update: {
                target: [...resSyncInfo.update.target, ...syncTargetStates.update],
                source: [...resSyncInfo.update.source, ...syncSourceStates.update]
            },
            remove: [...resSyncInfo.remove, ...syncTargetStates.remove, ...syncSourceStates.remove],
            create: [...resSyncInfo.create, ...syncTargetStates.create, ...syncSourceStates.create]
        };
    }, {
        update: {
            target: [] as Array<{
                oldState: IStateItem;
                newState: IStateItem;
            }>,
            source: [] as Array<{
                oldState: IStateItem;
                newState: IStateItem;
            }>
        },
        remove: [] as IStateItem[],
        create: [] as IStateItem[]
    });
    const uniqRemove = utils.reduce(
        syncInfo.remove,
        (res, i) => findOldState(res, i).length ? res : [...res, i],
        [] as IStateItem[]
    );
    const uniqueCreate = utils.reduce(
        syncInfo.create,
        (res, i) => findOldState(res, i).length ? res : [...res, i],
        [] as IStateItem[]
    );

    utils.forEach(utils.unique(uniqRemove), stateItem => {
        detachEvent(stateItem);
        stateMap.splice(stateMap.indexOf(stateItem), 1);
    });
    utils.forEach(utils.unique(uniqueCreate), stateItem => {
        stateMap.unshift(stateItem);
        attachEvent(stateItem);
    });
    const uniqueUpdateSource = syncInfo.update.target.length ? [] : utils.reduce(syncInfo.update.source, (res, i) => {
        const oldState = utils.find(res, n => {
            return n.oldState === i.oldState;
        });
        const newState = utils.find(res, n => {
            return n.newState === i.newState;
        });
        if (!oldState && !newState) {
            return [...res, i];
        }
        return res;
    }, [] as Array<{
        oldState: IStateItem;
        newState: IStateItem;
    }>);
    utils.forEach(uniqueUpdateSource, stateItem => {
        const index = stateMap.indexOf(stateItem.oldState);
        if (index === -1 ) throw new Error('Item doesn\'t belong to a state')
        stateMap.splice(index, 1);
        stateMap.unshift(stateItem.newState);
        //syncTarget(dataBinding, stateItem.newState);
    });
    const uniqueUpdateTarget = syncInfo.update.source.length ? [] : utils.reduce(syncInfo.update.target, (res, i) => {
        const oldState = utils.find(res, n => {
            return n.oldState === i.oldState;
        });
        const newState = utils.find(res, n => {
            return n.newState === i.newState;
        });
        if (!oldState && !newState) {
            return [...res, i];
        }
        return res;
    }, [] as Array<{
        oldState: IStateItem;
        newState: IStateItem;
    }>);
    utils.forEach(uniqueUpdateTarget, stateItem => {
        const index = stateMap.indexOf(stateItem.oldState);
        if (index === -1 ) throw new Error('Item doesn\'t belong to a state')
        stateMap.splice(index, 1);
        stateMap.unshift(stateItem.newState);
        //syncSource(dataBinding, stateItem.newState);
    });
    //if (!uniqueUpdateSource.length) {
        syncTarget(dataBinding, newState);
    //}
    //if (!uniqueUpdateTarget.length) {
        syncSource(dataBinding, newState);
    //}
}

const syncSource = (dataBinding: IDataBinding, newState: IStateItem) => {
    const fromPath = [...getParentsByFullPath(stateMap, newState), newState];
    const pathStr = pathFromStates(fromPath);
    const syncBindings = utils.reduce(dataBinding.bindings, (res, bindingInfo) => {
        const targetPathStr = pathFromStates(bindingInfo.target.path);
        if (targetPathStr.indexOf(pathStr) === 0) {
            return [...res, bindingInfo];
        }
        return res;
    }, [] as IBindingInfo[]);
    utils.forEach(syncBindings, b => {
        const targetInfo = utils.reduce(b.target.path, fillStateRecords, { dataBinding, context: fromPath[0].item, stateItems: [] });
        const sourceInfo = utils.reduce(b.source.path, fillStateRecords, { dataBinding, context: fromPath[0].item, stateItems: [] });
        const target = targetInfo.stateItems[b.target.path.length - 1];
        const source = sourceInfo.stateItems[b.source.path.length - 1];
        if (!source || !target) {
            return;
        }
        const sourceValue = ValueConvertor.changeType(source.value, target.value);
        if (target.canWrite && target.value !== sourceValue) {
            const value = ValueConvertor.changeType(target.value, source.value);
            setValue(source, value);

            applyNewState(stateMap, dataBinding, source);
        }
    });
}

const syncTarget = (dataBinding: IDataBinding, newState: IStateItem) => {
    const fromPath = [...getParentsByFullPath(stateMap, newState), newState];
    const pathStr = pathFromStates(fromPath);
    const syncBindings = utils.reduce(dataBinding.bindings, (res, bindingInfo) => {
        const sourcePathStr = pathFromStates(bindingInfo.source.path);
        if (sourcePathStr.indexOf(pathStr) === 0) {
            return [...res, bindingInfo];
        }
        return res;
    }, [] as IBindingInfo[]);
    utils.forEach(syncBindings, b => {
        const sourceInfo = utils.reduce(b.source.path, fillStateRecords, { dataBinding, context: fromPath[0].item, stateItems: [] });
        const targetInfo = utils.reduce(b.target.path, fillStateRecords, { dataBinding, context: fromPath[0].item, stateItems: [] });
        const source = sourceInfo.stateItems[b.source.path.length - 1];
        const target = targetInfo.stateItems[b.target.path.length - 1];
        if (!target || !source) {
            return;
        }
        const targetValue = ValueConvertor.changeType(target.value, source.value);
        if (target.canRead && source.value !== targetValue) {
            const value = ValueConvertor.changeType(source.value, targetValue);
            setValue(target, value);

            applyNewState(stateMap, dataBinding, target);
        }
    });
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
        any
    ]
}

interface IStateAction {
    propName: string;
    item: any;
}

const createNewStateItem = (item, propName) => {
    const ti = item && getTypeInfo(item);
    const pi = item && ti.getProperty(propName);
    const value = item && pi.getValue(item);
    return [{}, item, ti, value];
}

const updateStateItem = (state: IStateRecord, action: IStateAction) => {
    if (!state[action.propName]) {
        const newState = createNewStateItem(action.item, action.propName);
        //attachEvent({ item: newState[1], itemTi: newState[2], propName: action.propName });
        return {
            ...state,
            [action.propName]: newState
        } as IStateRecord;
    }
    const [children, item, itemTi, value] = state[action.propName];
    const [c, newItem, newItemTi, newValue] = createNewStateItem(action.item, action.propName);

    if (newItem) {

        if (
            item !== newItem
            || !(itemTi && itemTi.type === $ && itemTi.isEqual(newItemTi) && item[0] === newItem[0])
        ) {
            //detachEvent({ item, itemTi, propName: action.propName });
            //attachEvent({ item: newItem, itemTi: newItemTi, propName: action.propName });
        }
        return {
            ...state,
            [action.propName]: [{
                ...children
            }, newItem, newItemTi, newValue]
        };
    }

    return {
        ...state,
        [action.propName]: [{
            ...children
        }, null, null]
    };
}

const syncPathWithState = (
    state: IStateRecord,
    [path, ...pathInfo]: Array<{ propName: string }>,
    root: any
): IStateRecord => {
    if (!path) {
        return state;
    }
    const firstState = updateStateItem(state, { propName: path.propName, item: root });
    const [children, item, itemTi, value] = firstState[path.propName];
    const newState = syncPathWithState(children, pathInfo, value);

    return {
        ...state,
        [path.propName]: [{
            ...newState
        }, item, itemTi, value]
    };
}

const bindTo2 = (root, state: IStateRecord, bi: IBindingInfo) => {
    const nextState = syncPathWithState(state, bi.source.path, root);
    const newState = syncPathWithState(nextState, bi.target.path, root);
    return newState;
}


const toDataBindings = (root, sourceFrom: string, bindingsDecl: {
    [key: string]: string | string[]
}): IDataBinding => {
    let dataBinding;
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
                    path: [],
                    filters: []
                },
                target: {
                    path: utils.reduce(targetPath, (res, i) => [...res, {
                        fullPath: res.length
                            ? i + '.' + utils.last(res).fullPath
                            : i + ':' + targetId,
                        propName: i,
                        canRead: '+' !== isTargetReadWrite,
                        canWrite: '-' !== isTargetReadWrite
                    }], [] as Array<{ fullPath: string; propName: string }>)
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
                path: utils.reduce(sourcePath, (res, i) => [...res, {
                    fullPath: res.length
                        ? i + '.' + utils.last(res).fullPath
                        : i + ':' + (isTargetRoot ? targetId : sourceId),
                    propName: i,
                    canRead: '+' !== isSourceReadWrite,
                    canWrite: '-' !== isSourceReadWrite
                }], [] as Array<{ fullPath: string; propName: string }>)
            }
        }, ...res];
    }, [] as IBindingInfo[]);
    return dataBinding = {
        targetId,
        sourceId,
        sourceFrom: sourceFrom,
        onPropertyChange: (obj, eventData: { propName: string; fullPath?: string; }) => {
            queue.push(next => {
                applyNewState(stateMap, dataBinding, fillStateRecords({
                    dataBinding,
                    context: obj,
                    stateItems: []
                }, {
                    fullPath: eventData.fullPath,
                    propName: eventData.propName,
                    canRead: false,
                    canWrite: false
                }).stateItems[0]);
                next();
            });
        },
        bindings: dataBindings,
        root: root
    }
};

const getDetachedState = (obj, { propName }: { propName: string }): IDetachedState => {
    return {
        item: obj,
        propName,
        itemTi: getTypeInfo(obj)
    };
}

const dispatch = (obj, propChangeEventArgs: { propName: string }) => {
    try {
        const state = stateMap;
        const stateItems = findOldState(state, getDetachedState(obj, propChangeEventArgs));
        if (stateItems.length > 1) {
            throw new Error('Cant figure out which state update');
        } else if (stateItems.length === 0) {
            throw new Error('Update was not registed withing the state. Please, run dispatch on the parent object');
        }
        const stateItem = utils.first(stateItems);
        stateItem.onChange(obj, {
            ...propChangeEventArgs,
            fullPath: stateItem.fullPath
        });
        return state;
    } catch (ex) {
        setTimeout(() => { throw ex });
    }
}

const bindTo = (obj, sourceFrom: string, bindingsDecl: { [key: string]: string | string[] }) => {
    const rootItem = {
        s: getValueByProperty(obj, sourceFrom),
        t: obj
    };
    const dataBinding = toDataBindings(rootItem, sourceFrom, bindingsDecl);
    const state = utils.reduce(dataBinding.bindings, (state, bi) => bindTo2(rootItem, state, bi), {});
    console.log(state);
    applyNewState(stateMap, dataBinding, fillStateRecords({
        dataBinding,
        context: rootItem,
        stateItems: []
    }, {
        fullPath: 's:' + dataBinding.sourceId,
        propName: 's',
        canRead: false,
        canWrite: false
    }).stateItems[0]);

    return rootItem;
}

const unbindFrom = (rootItem: { s; t; }) => {
    rootItem.s = null;
    dispatch(rootItem, { propName: 's' });
    rootItem.t = null;
    dispatch(rootItem, { propName: 't' });
    const sourceStates = findOldState(stateMap, getDetachedState(rootItem, {
        propName: 's'
    }));
    const targetStates = findOldState(stateMap, getDetachedState(rootItem, {
        propName: 't'
    }));
    utils.forEach(sourceStates, sourceState => stateMap.splice(stateMap.indexOf(sourceState), 1));
    utils.forEach(targetStates, targetState => stateMap.splice(stateMap.indexOf(targetState), 1));
}

export { bindTo, unbindFrom, dispatch };
