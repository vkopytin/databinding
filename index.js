(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("libpack", [], factory);
	else if(typeof exports === 'object')
		exports["libpack"] = factory();
	else
		root["libpack"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/databinding/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/databinding/core.ts":
/*!*********************************!*\
  !*** ./src/databinding/core.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var valueConvertor_1 = __webpack_require__(/*! ./valueConvertor */ "./src/databinding/valueConvertor.ts");
var events_1 = __webpack_require__(/*! ./events */ "./src/databinding/events.ts");
var utils_1 = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
var utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
var index_1 = __webpack_require__(/*! ./integration/index */ "./src/databinding/integration/index.ts");
var js_1 = __webpack_require__(/*! ./integration/js */ "./src/databinding/integration/js.ts");
index_1.useIntegration(js_1.jsIntegration, true);
var valueFilters = {
    bool: function (v) { return !!v; },
    not: function (v) { return !v; }
};
var getTypeInfo = function (obj) {
    var typeDescriptor = utils.find(index_1.typeDescriptors, function (td) { return obj instanceof td.type; });
    return __assign({}, typeDescriptor, { getProperty: function (name) {
            var _a = name.split('|'), propNameAndTag = _a[0], filters = _a.slice(1);
            var _b = propNameAndTag.split('@'), propName = _b[0], tag = _b[1];
            var pi = utils.find(typeDescriptor.properties, function (pi) { return pi.name && pi.name.test(propName); });
            if (pi) {
                var propNameRxRes = pi.name.exec(propName);
                var propInfo_1 = {
                    filters: utils.map(filters, function (filterName) { return valueFilters[filterName]; }),
                    getValue: (function (propName) { return function (obj) {
                        return utils.reduce(propInfo_1.filters, function (res, f) { return f(res); }, pi.getter(obj, propName));
                    }; })(propNameRxRes[1]),
                    setValue: (function (propName) { return function (obj, v) {
                        pi.setter(obj, propName, utils.reduce(propInfo_1.filters, function (res, f) { return f(res); }, v));
                    }; })(propNameRxRes[1]),
                    name: pi.name,
                    handler: pi.handler,
                    attach: pi.attach,
                    detach: pi.detach
                };
                return propInfo_1;
            }
        },
        isEqual: function (left, right) {
            if (left === right) {
                return true;
            }
            if (left === undefined || right === undefined || left === null || right === null) {
                return false;
            }
            return typeDescriptor ? typeDescriptor.isEqual(left, right) : false;
        } });
};
var queue = utils_1.asyncQueue();
var setValue = function (toState, value) {
    var typeInfo = toState.itemTi; // getTypeInfo(toState.item);
    var pi = typeInfo.getProperty(toState.propName);
    pi.setValue(toState.item, value);
};
var attachEvent = function (item, itemTi, propName, handler, listening) {
    var typeInfo = itemTi; // getTypeInfo(stateItem.item);
    var pi = typeInfo.getProperty(propName);
    var c = pi.attach(item, propName, handler);
    listening.push({ h: handler, c: c });
};
var detachEvent = function (item, itemTi, propName, handler, listening) {
    var typeInfo = itemTi; // getTypeInfo(stateItem.item);
    var pi = typeInfo.getProperty(propName);
    var c = utils.find(listening, function (l) { return l[0] === handler; });
    if (c) {
        pi.detach(item, propName, c);
        listening.splice(listening.indexOf(c), 1);
    }
};
//const rxSplitDot = () => /\.(?!(?:[^(]*\))|(?:[^\[]*\])|(?!(?:(?:[^']*'){2})*[^']*$))/g;
var rxSplitDot = function () { return /\.(?<!(?:\(([^()]|\(([^()]|\(([^()]|(([^()])*\))*\))*\))*\))|(?:[^\[]*\])|(?!(?:(?:[^']*'){2})*[^']*$)))/g; };
var splitDeclaration = function (d) {
    var rxByDot = /\.(?<!(?:\(([^()]|\(([^()]|\(([^()]|(([^()])*\))*\))*\))*\))|(?:[^\[]*\])|(?!(?:(?:[^']*'){2})*[^']*$)))/g;
    return utils.filter(d.split(rxByDot), function (i) { return !!i; });
};
var createNewStateItem = function (rootItem, item, propName, aId) {
    var ti = item && getTypeInfo(item);
    var pi = item && ti.getProperty(propName);
    var value = item && pi.getValue(item);
    return [{}, item, ti, value, makeEventHandler(rootItem), [], aId];
};
var makeEventHandler = function (rootItem) { return function (obj, propName) {
    queue.push(function (next, opId) {
        var newState = dispatchTo(rootItem, rootItem.state, {
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
}; };
var updateStateItem = function (rootItem, state, action) {
    var _a, _b, _c, _d;
    if (!state[action.propName]) {
        var newState = createNewStateItem(rootItem, action.item, action.propName, action.id);
        newState[1] && attachEvent(newState[1], newState[2], action.propName, newState[4], newState[5]);
        return __assign({}, state, (_a = {}, _a[action.propName] = newState, _a));
    }
    var _e = state[action.propName], children = _e[0], item = _e[1], itemTi = _e[2], value = _e[3], h = _e[4], listening = _e[5];
    var _f = createNewStateItem(rootItem, action.item, action.propName, action.id), c = _f[0], newItem = _f[1], newItemTi = _f[2], newValue = _f[3], newH = _f[4], newListening = _f[5];
    if (newItem) {
        if (utils.isNullOrUndefined(item) || !itemTi.isEqual(item, newItem)) {
            item && detachEvent(item, itemTi, action.propName, h, listening);
            attachEvent(newItem, newItemTi, action.propName, newH, newListening);
            return __assign({}, state, (_b = {}, _b[action.propName] = [children, newItem, newItemTi, newValue, newH, newListening, action.id], _b));
        }
        else {
            var valueTi = getTypeInfo(value);
            if (utils.isNullOrUndefined(value) || !valueTi.isEqual(value, newValue)) {
                return __assign({}, state, (_c = {}, _c[action.propName] = [children, item, itemTi, newValue, h, listening, action.id], _c));
            }
        }
        return state;
    }
    item && detachEvent(item, itemTi, action.propName, h, listening);
    return __assign({}, state, (_d = {}, _d[action.propName] = [children, null, null, null, null, [], action.id], _d));
};
var initPathWithState = function (rootItem, state, _a, currentItem) {
    var _b;
    var path = _a[0], pathInfo = _a.slice(1);
    if (!path) {
        return state;
    }
    var firstState = updateStateItem(rootItem, state, { propName: path.propName, item: currentItem });
    var _c = firstState[path.propName], children = _c[0], item = _c[1], itemTi = _c[2], value = _c[3], h = _c[4], l = _c[5];
    var newState = initPathWithState(rootItem, children, pathInfo, value);
    return __assign({}, state, (_b = {}, _b[path.propName] = [newState, item, itemTi, value, h, l, null], _b));
};
var syncStateWithChildrens = function (rootItem, state, action) {
    var _a;
    var firstState = updateStateItem(rootItem, state, action);
    var _b = firstState[action.propName], children = _b[0], item = _b[1], itemTi = _b[2], value = _b[3], h = _b[4], l = _b[5];
    var newChildren = utils.reduce(Object.keys(children), function (nextState, key) {
        var _a;
        var newSubChildren = syncStateWithChildrens(rootItem, nextState, { propName: key, item: value });
        if (newSubChildren !== nextState) {
            return __assign({}, nextState, (_a = {}, _a[key] = newSubChildren[key], _a));
        }
        return nextState;
    }, children);
    if (firstState !== state || children !== newChildren) {
        return __assign({}, state, (_a = {}, _a[action.propName] = [newChildren, item, itemTi, value, h, l, action.id], _a));
    }
    return state;
};
var syncState = function (rootItem, state, action) {
    return utils.reduce(Object.keys(state), function (oldState, key) {
        var _a, _b;
        var _c = oldState[key], children = _c[0], oldItem = _c[1], oldItemTi = _c[2], oldValue = _c[3], oldH = _c[4], oldL = _c[5];
        var item = action.item;
        if (key === action.propName) {
            if (!utils.isNullOrUndefined(oldItem) && oldItemTi.isEqual(oldItem, item)) {
                var newState = syncStateWithChildrens(rootItem, oldState, action);
                if (newState !== oldState) {
                    var _d = newState[key], newChildren_1 = _d[0], newItem = _d[1], newItemTi = _d[2], newValue = _d[3], newH = _d[4], newL = _d[5];
                    return __assign({}, newState, (_a = {}, _a[key] = [syncState(rootItem, newChildren_1, action), newItem, newItemTi, newValue, newH, newL, action.id], _a));
                }
                return oldState;
            }
        }
        var newChildren = syncState(rootItem, children, action);
        if (newChildren !== children) {
            return __assign({}, oldState, (_b = {}, _b[key] = [newChildren, oldItem, oldItemTi, oldValue, oldH, oldL, action.id], _b));
        }
        return oldState;
    }, state);
};
var getFullPath = function (state, action) {
    return utils.reduce(Object.keys(state), function (res, key) {
        var _a = state[key], children = _a[0], oldItem = _a[1], oldItemTi = _a[2];
        var item = action.item;
        if (key === action.propName) {
            if (!utils.isNullOrUndefined(oldItem) && oldItemTi.isEqual(oldItem, item)) {
                return utils.reduce(res.concat([key]), function (subRes, path) {
                    var subPaths = getFullPath(children, action);
                    if (subPaths.length) {
                        return subRes.concat(utils.map(subPaths, function (subPath) { return path + '.' + subPath; }));
                    }
                    return subRes.concat([path]);
                }, res);
            }
        }
        var subPaths = getFullPath(children, action);
        if (subPaths.length) {
            return res.concat(utils.map(subPaths, function (subPath) { return key + '.' + subPath; }));
        }
        return res;
    }, []);
};
var transferValue = function (rootItem, state, dataBinding, action) {
    var pathStrArr = getFullPath(state, action);
    var transferToTarget = utils.reduce(dataBinding.bindings, function (res, bindingInfo) {
        var sourcePathStr = bindingInfo.source.fullPath;
        return utils.reduce(pathStrArr, function (res, pathStr) {
            if (sourcePathStr.indexOf(pathStr) === 0) {
                return res.concat([bindingInfo]);
            }
            return res;
        }, res);
    }, []);
    var transferToSource = utils.reduce(dataBinding.bindings, function (res, bindingInfo) {
        var sourcePathStr = bindingInfo.target.fullPath;
        return utils.reduce(pathStrArr, function (res, pathStr) {
            if (sourcePathStr.indexOf(pathStr) === 0) {
                return res.concat([bindingInfo]);
            }
            return res;
        }, res);
    }, []);
    var newTargetState = utils.reduce(transferToTarget, function (oldState, bi) {
        var source = utils.reduce(bi.source.path, function (res, path) {
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
        var target = utils.reduce(bi.target.path, function (res, path) {
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
        var newTargetState = oldState;
        var targetValue = valueConvertor_1.ValueConvertor.changeType(target.value, source.value);
        if (target.canRead && source.value !== targetValue
            && !(source.aId === action.id && target.aId === source.aId) // recursive set terminator
        ) {
            var value = valueConvertor_1.ValueConvertor.changeType(source.value, targetValue);
            setValue(target, value);
            newTargetState = dispatchTo(rootItem, oldState, {
                item: target.item,
                propName: target.propName,
                id: action.id
            });
        }
        if (newTargetState !== oldState) {
            return __assign({}, oldState, newTargetState);
        }
        return oldState;
    }, state);
    var newSourceState = utils.reduce(transferToSource, function (oldState, bi) {
        var source = utils.reduce(bi.source.path, function (res, path) {
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
        var target = utils.reduce(bi.target.path, function (res, path) {
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
        var newSourceState = oldState;
        var sourceValue = valueConvertor_1.ValueConvertor.changeType(source.value, target.value);
        if (target.canWrite && target.value !== sourceValue
            && !(source.aId === action.id && target.aId === source.aId) // recursive set terminator
        ) {
            var value = valueConvertor_1.ValueConvertor.changeType(target.value, sourceValue);
            setValue(source, value);
            newSourceState = dispatchTo(rootItem, oldState, {
                item: source.item,
                propName: source.propName,
                id: action.id
            });
        }
        if (newSourceState !== oldState) {
            return __assign({}, oldState, newSourceState);
        }
        return oldState;
    }, newTargetState);
    if (newSourceState !== state) {
        return __assign({}, state, newSourceState);
    }
    return state;
};
var updateLayout = function (obj) {
    queue.push(function (next, opId) {
        var newState = syncState(obj, obj.state, {
            item: obj,
            propName: 't',
            id: opId
        });
        var actionsSource = utils.map(obj.dataBinding.bindings, function (bi) { return ({
            item: newState[bi.source.path[0].propName][0][bi.source.path[1].propName][1],
            propName: bi.source.path[1].propName,
            id: opId
        }); });
        newState = utils.reduce(actionsSource, function (newState, action) { return dispatchTo(obj, newState, action); }, newState);
        newState = syncState(obj, newState, {
            item: obj,
            propName: 't',
            id: opId
        });
        newState = utils.reduce(actionsSource, function (newState, action) { return dispatchTo(obj, newState, action); }, newState);
        newState = dispatchTo(obj, newState, { item: obj, propName: 't' });
        if (newState !== obj.state) {
            obj.state = newState;
            obj.events.trigger('change');
        }
        next();
    });
};
exports.updateLayout = updateLayout;
var dispatchTo = function (rootItem, state, action) {
    var nextState = syncState(rootItem, state, action);
    var newState = transferValue(rootItem, nextState, nextState['t'][1].dataBinding, action);
    if (state !== newState) {
        return __assign({}, state, newState);
    }
    return state;
};
var bindToState = function (root, state, bi) {
    var nextState = initPathWithState(root, state, bi.source.path, root);
    var newState = initPathWithState(root, nextState, bi.target.path, root);
    return newState;
};
var subscribeToChange = function (rootItem, handler) {
    rootItem.events.on('change', handler);
};
exports.subscribeToChange = subscribeToChange;
var toStateObject = function (state, rootItem) {
    return utils.reduce(rootItem.dataBinding.bindings, function (oldState, bi) {
        var newState = oldState;
        var res = utils.reduce(bi.target.path, function (res, path, index) {
            if (!res.state) {
                return {
                    current: res.current[path.propName] = bi.target.path.length - 1 > index
                        ? res.current[path.propName] || (res.current[path.propName] = {})
                        : null,
                    state: res.state,
                    value: null,
                    propName: path.propName
                };
            }
            return {
                current: res.current[path.propName] = bi.target.path.length - 1 > index
                    ? res.current[path.propName] || (res.current[path.propName] = {})
                    : res.state[path.propName][3],
                state: res.state[path.propName][0],
                value: res.state[path.propName][3],
                propName: path.propName
            };
        }, { current: newState, state: rootItem.state, value: null, propName: '' });
        return newState.t;
    }, state || {});
};
exports.toStateObject = toStateObject;
var toDataBindings = function (root, bindingsDecl) {
    var dataBinding;
    var bindingId = utils.uniqueId('binding-');
    var targetId = utils.uniqueId('target-');
    var sourceId = utils.uniqueId('source-');
    var declaration = utils.reduce(Object.keys(bindingsDecl), function (res, key) { return res.concat([key, bindingsDecl[key]]); }, []);
    var dataBindings = utils.reduce(declaration, function (_a, decl, index) {
        var _b, _c, _d;
        var first = _a[0], res = _a.slice(1);
        var a, isTargetReadWrite, isSourceReadWrite, fullPath;
        _b = decl.split(/^([-+])?(.+)/i), a = _b[0], isTargetReadWrite = _b[1], fullPath = _b[2];
        var targetPath = splitDeclaration("t." + fullPath);
        if (index % 2 === 0) {
            return [{
                    source: {
                        fullPath: '',
                        path: [],
                        filters: []
                    },
                    target: {
                        fullPath: targetPath.join('.'),
                        path: utils.reduce(targetPath, function (res, i) { return res.concat([{
                                propName: i,
                                canRead: '+' !== isTargetReadWrite,
                                canWrite: '-' !== isTargetReadWrite
                            }]); }, [])
                    }
                }].concat(first ? [first].concat(res) : res);
        }
        var sourcePath;
        var isTargetRoot;
        if (/^\./.test(decl)) {
            _c = decl.split(/^([-+])?(.+)/i), a = _c[0], isSourceReadWrite = _c[1], fullPath = _c[2];
            sourcePath = splitDeclaration(("t" + fullPath).replace(/^\./, ''));
            isTargetRoot = true;
        }
        else {
            _d = decl.split(/^([-+])?(.+)/i), a = _d[0], isSourceReadWrite = _d[1], fullPath = _d[2];
            sourcePath = splitDeclaration("s." + fullPath);
            isTargetRoot = false;
        }
        return [__assign({}, first, { source: {
                    fullPath: sourcePath.join('.'),
                    path: utils.reduce(sourcePath, function (res, i) { return res.concat([{
                            propName: i,
                            canRead: '+' !== isSourceReadWrite,
                            canWrite: '-' !== isSourceReadWrite
                        }]); }, [])
                } })].concat(res);
    }, []);
    return dataBinding = {
        bindingId: bindingId,
        targetId: targetId,
        sourceId: sourceId,
        bindings: dataBindings,
        root: root
    };
};
var bindTo = function (obj, sourceFrom, bindingsDecl) {
    var rootItem = {
        s: sourceFrom(),
        t: obj,
        state: null,
        dataBinding: null,
        events: new events_1.Events()
    };
    var dataBinding = rootItem.dataBinding = toDataBindings(rootItem, bindingsDecl);
    var state = utils.reduce(dataBinding.bindings, function (newState, bi) { return bindToState(rootItem, newState, bi); }, {});
    rootItem.state = state;
    return rootItem;
};
exports.bindTo = bindTo;
var unbindFrom = function (rootItem) {
    rootItem.s = null;
    rootItem.t = null;
    rootItem.events = null;
    rootItem.state = utils.reduce(rootItem.dataBinding.bindings, function (state, bi) { return bindToState(rootItem, state, bi); }, {});
};
exports.unbindFrom = unbindFrom;


/***/ }),

/***/ "./src/databinding/events.ts":
/*!***********************************!*\
  !*** ./src/databinding/events.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Events = /** @class */ (function () {
    function Events() {
        this.subscribers = {};
    }
    Events.prototype.on = function (name, handler) {
        var subscribers = this.subscribers[name] || (this.subscribers[name] = []);
        subscribers.push(handler);
    };
    Events.prototype.off = function (name, handler) {
        var subscribers = this.subscribers[name];
        if (!subscribers) {
            return;
        }
        var idx = subscribers.indexOf(handler);
        if (idx !== -1) {
            subscribers.splice(idx, 1);
        }
    };
    Events.prototype.trigger = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var subscribers;
        var i;
        if (!event) {
            throw new Error('Event was invalid.');
        }
        if (typeof event === 'string') {
            subscribers = this.subscribers[event];
            if (!subscribers) {
                return;
            }
            subscribers = subscribers.slice();
            i = subscribers.length;
            while (i--) {
                try {
                    subscribers[i].apply(this, [event].concat(args));
                }
                catch (e) {
                    setTimeout(function () { throw e; });
                }
            }
        }
    };
    return Events;
}());
exports.Events = Events;
var withEvents = function (Base) {
    var child = function Events$Mix(a, b) {
        Base.apply(this, arguments);
        return Events.apply(this, arguments);
    };
    Object.assign(child, Events, Base);
    child.prototype = Base.prototype;
    Object.assign(child.prototype, Events.prototype);
    child.prototype.constructor = child;
    return child;
};
exports.withEvents = withEvents;


/***/ }),

/***/ "./src/databinding/index.ts":
/*!**********************************!*\
  !*** ./src/databinding/index.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
exports.utils = utils;
var events_1 = __webpack_require__(/*! ./events */ "./src/databinding/events.ts");
exports.Events = events_1.Events;
exports.withEvents = events_1.withEvents;
var integration_1 = __webpack_require__(/*! ./integration */ "./src/databinding/integration/index.ts");
exports.useIntegration = integration_1.useIntegration;
var multicastDelegate_1 = __webpack_require__(/*! ./multicastDelegate */ "./src/databinding/multicastDelegate.ts");
exports.MulticastDelegate = multicastDelegate_1.MulticastDelegate;
var core_1 = __webpack_require__(/*! ./core */ "./src/databinding/core.ts");
exports.bindTo = core_1.bindTo;
exports.toStateObject = core_1.toStateObject;
exports.subscribeToChange = core_1.subscribeToChange;
exports.unbindFrom = core_1.unbindFrom;
exports.updateLayout = core_1.updateLayout;


/***/ }),

/***/ "./src/databinding/integration/index.ts":
/*!**********************************************!*\
  !*** ./src/databinding/integration/index.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var typeDescriptors = [];
exports.typeDescriptors = typeDescriptors;
function useIntegration(obj, append) {
    if (append === void 0) { append = false; }
    if (append) {
        typeDescriptors.push.apply(typeDescriptors, obj);
    }
    else {
        typeDescriptors.unshift.apply(typeDescriptors, obj);
    }
}
exports.useIntegration = useIntegration;


/***/ }),

/***/ "./src/databinding/integration/js.ts":
/*!*******************************************!*\
  !*** ./src/databinding/integration/js.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var multicastDelegate_1 = __webpack_require__(/*! ../multicastDelegate */ "./src/databinding/multicastDelegate.ts");
var utils = __webpack_require__(/*! ../../utils */ "./src/utils/index.ts");
var jsIntegration = [{
        type: Object,
        isEqual: function (left, right) {
            return left === right;
        },
        properties: [{
                name: /^bind\((.+)\)$/,
                getter: function (obj, name) {
                    return (obj[name]).bind(obj);
                },
                setter: function (obj, name, value) {
                    throw new Error('Bind - is readonly property');
                },
                handler: { general: function () { } },
                attach: function (obj, propName, handler) {
                    if ('on' in obj && 'off' in obj) {
                        var callback = function () { return handler(obj, propName); };
                        obj.on('change:' + propName, callback);
                        return callback;
                    }
                },
                detach: function (obj, propName, callback) {
                    if ('on' in obj && 'off' in obj) {
                        obj.off('change:' + propName, callback);
                    }
                }
            }, {
                name: /^event\((.+)\)$/,
                getter: function (obj, eventName) {
                    return this.handler.getHandler(obj, eventName);
                },
                setter: function (obj, eventName, value) {
                    this.handler.addHandler(obj, eventName, value);
                },
                handler: new multicastDelegate_1.MulticastDelegate(function (a) { return [this, a]; }),
                attach: function (obj, propName) {
                    var _a = this.name.exec(propName), a = _a[0], eventName = _a[1];
                    obj.on(eventName, this.handler.invoke);
                },
                detach: function (obj, propName) {
                    var _a = this.name.exec(propName), a = _a[0], eventName = _a[1];
                    this.handler.removeHandler(obj, eventName);
                    obj.off(eventName, this.handler.invoke);
                }
            }, {
                name: /^(\w+\(.*\))$/i,
                getter: function (obj, name) {
                    var _a = /^(\w+)\((.*)\)$/.exec(name), a = _a[0], fnName = _a[1], fnValue = _a[2];
                    return obj[fnName](fnValue);
                },
                setter: function (obj, name, value) {
                    var _a = /^(\w+)\((.*)\)$/.exec(name), a = _a[0], fnName = _a[1], fnValue = _a[2];
                    obj[fnName](fnValue, value);
                },
                handler: {},
                attach: function (obj, propName, handler) {
                    if ('on' in obj && 'off' in obj) {
                        var callback = function () { return handler(obj, propName); };
                        obj.on('change:' + propName, callback);
                        return callback;
                    }
                },
                detach: function (obj, propName, callback) {
                    if ('on' in obj && 'off' in obj) {
                        obj.off('change:' + propName, callback);
                    }
                }
            }, {
                name: /^(\w+\(.*\))$/i,
                getter: function (obj, name) {
                    var _a = /^(\w+)\((.*)\)$/.exec(name), a = _a[0], fnName = _a[1], fnValue = _a[2];
                    return obj[fnName](fnValue);
                },
                setter: function (obj, name, value) {
                    var _a = /^(\w+)\((.*)\)$/.exec(name), a = _a[0], fnName = _a[1], fnValue = _a[2];
                    obj[fnName](fnValue);
                },
                handler: {},
                attach: function (obj, propName, handler) {
                    if ('on' in obj && 'off' in obj) {
                        var callback = function () { return handler(obj, propName); };
                        obj.on('change:' + propName, callback);
                        return callback;
                    }
                },
                detach: function (obj, propName, callback) {
                    if ('on' in obj && 'off' in obj) {
                        obj.off('change:' + propName, callback);
                    }
                }
            }, {
                name: /^([\$\w]+)$/i,
                getter: function (obj, name) {
                    if (utils.isFunction(obj[name])) {
                        return obj[name]();
                    }
                    return obj[name];
                },
                setter: function (obj, name, value) {
                    if (utils.isFunction(obj[name])) {
                        return obj[name](value);
                    }
                    return obj[name] = value;
                },
                handler: {},
                attach: function (obj, propName, handler) {
                    if ('on' in obj && 'off' in obj) {
                        var callback = function () { return handler(obj, propName); };
                        obj.on('change:' + propName, callback);
                        return callback;
                    }
                },
                detach: function (obj, propName, callback) {
                    if ('on' in obj && 'off' in obj) {
                        obj.off('change:' + propName, callback);
                    }
                }
            }]
    }];
exports.jsIntegration = jsIntegration;


/***/ }),

/***/ "./src/databinding/multicastDelegate.ts":
/*!**********************************************!*\
  !*** ./src/databinding/multicastDelegate.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utils = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
var MulticastDelegate = /** @class */ (function () {
    function MulticastDelegate(convertArgs) {
        var _this = this;
        this.convertArgs = convertArgs;
        this.list = [];
        this.invoke = (function () {
            var inst = _this;
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return inst.trigger.apply(inst, inst.convertArgs.apply(this, args));
            };
        })();
    }
    MulticastDelegate.prototype.getHandler = function (obj, eventName) {
        if (eventName === void 0) { eventName = ''; }
        var d = utils.find(this.list, function (_a) {
            var o = _a[0], evn = _a[1];
            return obj === o && eventName === evn;
        });
        if (d) {
            return d[2];
        }
        return null;
    };
    MulticastDelegate.prototype.addHandler = function (obj, eventName, handler) {
        if (!handler) {
            handler = eventName;
            eventName = '';
        }
        var current = utils.find(this.list, function (_a) {
            var o = _a[0], evn = _a[1];
            return obj === o && eventName === evn;
        });
        if (!current) {
            this.list.push([obj, eventName, handler, 1]);
            return;
        }
        current[3]++;
    };
    MulticastDelegate.prototype.removeHandler = function (obj, eventName) {
        var current = utils.find(this.list, function (_a) {
            var o = _a[0], evn = _a[1];
            return obj === o && evn === eventName;
        });
        current[3]--;
        if (current[3] === 0) {
            this.list.splice(this.list.indexOf(current), 1);
        }
    };
    MulticastDelegate.prototype.trigger = function (obj, eventName) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var delegates = utils.filter(this.list, function (_a) {
            var o = _a[0], evn = _a[1];
            return o === obj && evn === eventName;
        });
        utils.forEach(delegates, function (_a) {
            var o = _a[0], e = _a[1], h = _a[2];
            return h.apply(void 0, args);
        });
    };
    return MulticastDelegate;
}());
exports.MulticastDelegate = MulticastDelegate;


/***/ }),

/***/ "./src/databinding/valueConvertor.ts":
/*!*******************************************!*\
  !*** ./src/databinding/valueConvertor.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ValueConvertor = /** @class */ (function () {
    function ValueConvertor() {
    }
    ValueConvertor.isBoolean = function (value) {
        return typeof value === 'boolean';
    };
    ValueConvertor.isString = function (value) {
        return typeof value === 'string' || value instanceof String;
    };
    ValueConvertor.isNumber = function (value) {
        return typeof value === 'number' && isFinite(value);
    };
    ValueConvertor.toNumber = function (obj) {
        return +obj;
    };
    ValueConvertor.toString = function (obj) {
        return '' + obj;
    };
    ValueConvertor.toBoolean = function (obj) {
        return !!obj;
    };
    ValueConvertor.changeType = function (obj, targetInst) {
        var objType = typeof obj;
        var targetType = typeof targetInst;
        if (objType !== 'object') {
            if (objType === targetType) {
                return obj;
            }
        }
        if (ValueConvertor.isNumber(targetInst)) {
            return ValueConvertor.toNumber(obj);
        }
        if (ValueConvertor.isString(targetInst)) {
            return ValueConvertor.toString(obj);
        }
        if (ValueConvertor.isBoolean(targetInst)) {
            return ValueConvertor.toBoolean(obj);
        }
        return obj;
    };
    return ValueConvertor;
}());
exports.ValueConvertor = ValueConvertor;


/***/ }),

/***/ "./src/utils/index.ts":
/*!****************************!*\
  !*** ./src/utils/index.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function forEach(arr, cb) {
    var length = arr == null ? 0 : arr.length;
    var index = 0;
    var n = length % 8;
    if (n > 0) {
        do {
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
        } while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
            if (cb(arr[index], index++, arr) === false) {
                return;
            }
        } while (--n); // n must be greater than 0 here also
    }
    return arr;
}
exports.forEach = forEach;
function map(arr, cb) {
    var length = arr == null ? 0 : arr.length;
    var result = new Array(length);
    var index = 0;
    var n = length % 8;
    if (n > 0) {
        do {
            result[index] = cb(arr[index], index++, arr);
        } while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
            result[index] = cb(arr[index], index++, arr);
        } while (--n); // n must be greater than 0 here also
    }
    return result;
}
exports.map = map;
function filter(arr, cb) {
    var length = arr == null ? 0 : arr.length;
    var result = [];
    var resIndex = 0;
    var index = 0;
    var n = length % 8;
    var value;
    if (n > 0) {
        do {
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
        } while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                result[resIndex++] = value;
            }
        } while (--n); // n must be greater than 0 here also
    }
    return result;
}
exports.filter = filter;
function reduce(arr, cb, res) {
    var length = arr == null ? 0 : arr.length;
    var index = 0;
    var n = length % 8;
    if (n > 0) {
        do {
            res = cb(res, arr[index], index++, arr);
        } while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
            res = cb(res, arr[index], index++, arr);
        } while (--n); // n must be greater than 0 here also
    }
    return res;
}
exports.reduce = reduce;
function find(arr, cb) {
    var length = arr == null ? 0 : arr.length;
    var index = 0;
    var n = length % 8;
    var value;
    if (n > 0) {
        do {
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
        } while (--n); // n must be greater than 0 here
    }
    n = Math.floor(length / 8);
    if (n > 0) { // if iterations < 8 an infinite loop, added for safety in second printing
        do {
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
            value = arr[index];
            if (cb(value, index++, arr)) {
                return value;
            }
        } while (--n); // n must be greater than 0 here also
    }
}
exports.find = find;
function difference(arr, vals) {
    // tslint:disable-next-line
    return filter(arr, function (a) { return !~vals.indexOf(a); });
}
exports.difference = difference;
function strEquals(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (var i = 0; i < a.length / 2; ++i) {
        if (a[i] !== b[i] || a[a.length - i - 1] !== b[b.length - i - 1]) {
            return false;
        }
    }
    return true;
}
exports.strEquals = strEquals;
function unique(arr) {
    return filter(arr, function (value, index, self) { return self.indexOf(value) === index; });
}
exports.unique = unique;
function first(arr) {
    return (arr != null && arr.length)
        ? arr[0]
        : undefined;
}
exports.first = first;
function last(arr) {
    var length = arr == null ? 0 : arr.length;
    return length ? arr[length - 1] : undefined;
}
exports.last = last;
function rest(arr, n, guard) {
    return Array.prototype.slice.call(arr, n == null || guard ? 1 : n);
}
exports.rest = rest;
var idCounter = {};
function uniqueId(prefix) {
    if (prefix === void 0) { prefix = ''; }
    if (!idCounter[prefix]) {
        idCounter[prefix] = 0;
    }
    var id = ++idCounter[prefix];
    if (prefix === '') {
        return "" + id;
    }
    return "" + (prefix + id);
}
exports.uniqueId = uniqueId;
function asyncQueue(concurrency) {
    if (concurrency === void 0) { concurrency = 1; }
    var running = 0;
    var taskQueue = [];
    var runTask = function (task, operationId) {
        var done = function () {
            running--;
            if (taskQueue.length > 0) {
                runTask(taskQueue.shift(), operationId);
            }
        };
        running++;
        try {
            task(done, operationId);
        }
        catch (ex) {
            setTimeout(function () { throw ex; });
            done();
        }
    };
    var enqueueTask = function (task) { return taskQueue.push(task); };
    return {
        push: function (task) { return running < concurrency ? runTask(task, uuId()) : enqueueTask(task); }
    };
}
exports.asyncQueue = asyncQueue;
function asyncQueueWithPriority(concurrency) {
    if (concurrency === void 0) { concurrency = 1; }
    var running = 0;
    var taskQueue = [];
    var runTask = function (task, priority) {
        var done = function () {
            running--;
            if (taskQueue.length > 0) {
                runTask.apply(void 0, taskQueue.shift());
            }
        };
        running++;
        try {
            task(done);
        }
        catch (ex) {
            setTimeout(function () { throw ex; });
            done();
        }
    };
    var enqueueTask = function (task, priority) {
        var nextTask = find(taskQueue, function (t) { return t[1] > priority; });
        if (nextTask) {
            taskQueue.splice(taskQueue.indexOf(nextTask), 0, [task, priority]);
        }
        else {
            taskQueue.push([task, priority]);
        }
    };
    return {
        push: function (task, priority) {
            if (priority === void 0) { priority = 0; }
            return running < concurrency
                ? runTask(task, priority)
                : enqueueTask(task, priority);
        }
    };
}
exports.asyncQueueWithPriority = asyncQueueWithPriority;
function isFunction(obj) {
    return typeof obj === 'function' || false;
}
exports.isFunction = isFunction;
function isNullOrUndefined(obj) {
    return obj === undefined || obj === null;
}
exports.isNullOrUndefined = isNullOrUndefined;
function uuId() {
    var d = new Date().getTime();
    if (typeof window.performance !== 'undefined' && typeof window.performance.now === 'function') {
        d += window.performance.now(); // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // tslint:disable-next-line
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        // tslint:disable-next-line
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
exports.uuId = uuId;


/***/ })

/******/ });
});