import { ValueConvertor } from './valueConvertor';
import { MulticastDelegate } from './multicastDelegate';
import { Events } from './events';
import { asyncQueue } from '../utils';
import * as utils from '../utils';
import { typeDescriptors, useIntegration } from './integration/index';
import { jsIntegration } from './integration/js';

useIntegration(jsIntegration, true);

interface IDataBinding {
    bindings: IBindingInfo[];
    root;
    targetId: string;
    sourceId: string;
    bindingId: string;
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

interface IPropertyInfo {
    filters: any[];
    name: RegExp;
    handler: {
        [key: string]: (...args: any[]) => any;
    } | MulticastDelegate;
    getValue: (obj: any) => any;
    setValue: (obj: any, v: any) => void;
    attach: (obj: any, propName: string, handler: (o: any, p: string) => void) => any;
    detach: (obj: any, propName: string, handler: (o: any, p: string) => void) => any;
}

interface ITypeInfo {
    type: any;
    getProperty(name: string): IPropertyInfo;
    isEqual(left: any, right: any): boolean;
}

interface IStateRecord {
    [propName: string]: [
        IStateRecord,
        any, // item
        ITypeInfo, // itemTi
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

interface IRootItem {
    s;
    t;
    res: any[];
    state: IStateRecord;
    dataBinding: IDataBinding;
    events: Events;
}

const valueFilters = {
    bool: v => !!v,
    not: v => !v
}

const getTypeInfo = (obj): ITypeInfo => {
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

const updateLayout = (obj: IRootItem) => {
    queue.push((next, opId) => {
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

const bindToState = (root, state: IStateRecord, bi: IBindingInfo) => {
    const nextState = initPathWithState(root, state, bi.source.path, root);
    const newState = initPathWithState(root, nextState, bi.target.path, root);

    return newState;
}

const subscribeToChange = (rootItem: IRootItem, handler) => {
    rootItem.events.on('change', handler);
}

const toDataBindings = (root, bindingsDecl: {
    [key: string]: string | string[]
}, targetPrefix = 't'): IDataBinding => {
    let dataBinding;
    const bindingId = utils.uniqueId('binding-');
    const targetId = utils.uniqueId('target-');
    const sourceId = utils.uniqueId('source-');
    const declaration = utils.reduce(Object.keys(bindingsDecl), (res, key) => [...res, key, bindingsDecl[key]], []);
    const dataBindings = utils.reduce(declaration, ([first, ...res], decl, index) => {
        let a, isTargetReadWrite, isSourceReadWrite, fullPath;
        [a, isTargetReadWrite, fullPath] = decl.split(/^([-+])?(.+)/i);
        const targetPath = splitDeclaration(`${targetPrefix}.${fullPath}`);
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
            sourcePath = splitDeclaration(`${targetPrefix}${fullPath}`.replace(/^\./, ''));
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
        bindings: dataBindings,
        root: root
    }
};

const bindTo = (obj, sourceFrom: () => any, bindingsDecl: { [key: string]: string | string[] }) => {
    const rootItem: IRootItem = {
        s: sourceFrom(),
        t: obj,
        res: [],
        state: null,
        dataBinding: null,
        events: new Events()
    };
    const dataBinding = rootItem.dataBinding = toDataBindings(rootItem, bindingsDecl);
    const state = utils.reduce(dataBinding.bindings, (newState, bi) => bindToState(rootItem, newState, bi), {});
    rootItem.state = state;

    return rootItem;
}

const addBindingTo = (rootItem: IRootItem, bindingsDecl: { [key: string]: string | string[] }) => {
    const index = rootItem.res.length;
    const dataBinding = toDataBindings(rootItem, bindingsDecl);
    rootItem.dataBinding.bindings = [...rootItem.dataBinding.bindings, ...dataBinding.bindings];
    const state = utils.reduce(dataBinding.bindings, (newState, bi) => bindToState(rootItem, newState, bi), rootItem.state);
    rootItem.state = state;
    const newSourceState = utils.reduce(dataBinding.bindings, (stateInfo, bi) => {
        const oldState = rootItem.state;
        const source = utils.reduce(bi.target.path, (res, path) => {
            if (!res.state) {

                return {
                    state: res.state,
                    item: null,
                    itemTi: null,
                    value: null,
                    propName: path.propName,
                    onChange: (o, p) => { }
                };
            }

            return {
                state: res.state[path.propName][0],
                item: res.state[path.propName][1],
                itemTi: res.state[path.propName][2],
                value: res.state[path.propName][3],
                propName: path.propName,
                onChange: res.state[path.propName][4]
            };
        }, { state: oldState, item: null, itemTi: null, value: null, propName: '', onChange: null });

        return [...stateInfo, source];
    }, []);

    return newSourceState[0];
}

const unbindFrom = (rootItem: IRootItem) => {
    rootItem.s = null;
    rootItem.t = null;
    rootItem.events = null;
    rootItem.state = utils.reduce(rootItem.dataBinding.bindings, (state, bi) => bindToState(rootItem, state, bi), {});
}

export { addBindingTo, bindTo, IRootItem, unbindFrom, updateLayout, subscribeToChange };
