import { dom } from './dom';
import { arrayMerge } from './utils'; 


export const EVENT_NAMES = {
    onClick: 'click',
    onInput: 'input',
    onKeyPress: 'keypress',
    onChange: 'change',
    onSubmit: 'submit',
    onKeyDown: 'keydown',
    onKeyUp: 'keyup',
    onBlur: 'blur',
    onMouseDown: 'mousedown'
};

export const propConverters = {
    contentEditable: function (value) {
        return !!value;
    },
    convert(propName, value) {
        if (propName in propConverters) {
            return propConverters[propName](value);
        }
        return value;
    }
};

export function el(type, attrs = {}, ...children) {
    children = [].concat(...children)
        .filter(a => [undefined, true, false].indexOf(a) === -1)
        .map(item => (['object', 'function'].indexOf(typeof item) === -1 ? '' + item : item));
    if (typeof type === 'function') {
        return type({ ...attrs, store: currentStore, children: children.length > 1 ? children : children[0] }, children);
    }

    return {
        type,
        attrs,
        children
    };
}

export let currentStore = null;

export function makeVdom(oldDom, store) {
    currentStore = store;
    function createElement(node) {
        if (node === undefined) {
            return document.createTextNode('');
        }
        if (['object', 'function'].indexOf(typeof node) === -1) {
            return document.createTextNode(node);
        }
        if (typeof node.type === 'function') {
            const { children = [] } = node;
            const [first] = children;
            const $el = createElement(first);
            patch($el, node.type, { ...node.attrs, store });
            return $el;
        }
        const { type, attrs = {}, children } = node;
        const { ref, ...attributes } = (attrs || {});
        const el = dom.el(type, attributes, ...[].concat(children).map(child => createElement(child)));
        return el;
    }

    function compare($el, newNode, oldNode) {
        if (typeof newNode !== typeof oldNode) {
            return true;
        }
        if (['object', 'function'].indexOf(typeof newNode) === -1) {
            if (newNode !== oldNode) {
                const oldValue = $el.textContent;
                if (oldValue !== newNode) {
                    return true;
                }
            }
            return false;
        }
        return newNode.type !== oldNode.type
    }

    function updateAttribute($el, newValue, oldValue, key) {
        if (oldValue === undefined) {
            $el.setAttribute(key, newValue);
        } else if (newValue === undefined) {
            $el.removeAttribute(key);
        } else if (newValue !== oldValue) {
            $el.setAttribute(key, newValue);
        }
    }

    function updateProperty($el, newValue, oldValue, key) {
        const oldElValue = $el[key];
        if (oldValue === undefined) {
            if (oldElValue !== newValue) {
                $el[key] = propConverters.convert(key, newValue);
            }
        } else if (newValue === undefined) {
            if (oldElValue !== newValue) {
                $el[key] = propConverters.convert(key, newValue);
            }
        } else if (newValue !== oldValue) {
            if (oldElValue !== newValue) {
                $el[key] = propConverters.convert(key, newValue);
            }
        }
    }

    function updateEvent($el, newHandler, oldHandler, key) {
        const eventName = EVENT_NAMES[key];
        if (!oldHandler) {
            dom.attach($el, '', eventName, newHandler);
        } else if (!newHandler) {
            dom.detach($el, eventName, oldHandler);
        } else {
            dom.detach($el, eventName, oldHandler);
            dom.attach($el, '', eventName, newHandler);
        }
    }

    function updateAttributes($el, newAttrs, oldAttrs) {
        newAttrs = newAttrs || {};
        oldAttrs = oldAttrs || {}
        const newKeys = Object.keys(newAttrs);
        const oldKeys = Object.keys(oldAttrs);
        const allKeys = arrayMerge(newKeys, oldKeys);
        for (const key of allKeys) {
            if (key in EVENT_NAMES) {
                updateEvent($el, newAttrs[key], oldAttrs[key], key);
            } else if (key in $el) {
                updateProperty($el, newAttrs[key], oldAttrs[key], key);
            } else {
                updateAttribute($el, newAttrs[key], oldAttrs[key], key);
            }
        }
    }

    function detachEvents($el, oldAttrs) {
        oldAttrs = oldAttrs || {}
        const oldKeys = Object.keys(oldAttrs);
        for (const key of oldKeys) {
            if (key in EVENT_NAMES) {
                updateEvent($el, undefined, oldAttrs[key], key);
            }
        }
    }

    function updateElement($parent, newNode, oldNode, index = 0) {
        let nodesToRemove = [];
        if (!oldNode) {
            $parent.appendChild(
                createElement(newNode)
            );
        } else if (!newNode) {
            detachEvents($parent.childNodes[index], oldNode.attrs);
            nodesToRemove.push($parent.childNodes[index]);
        } else if (compare($parent.childNodes[index], newNode, oldNode)) {
            detachEvents($parent.childNodes[index], oldNode.attrs);
            $parent.replaceChild(
                createElement(newNode),
                $parent.childNodes[index]
            );
        } else if (newNode.type) {
            updateAttributes($parent.childNodes[index], newNode.attrs, oldNode.attrs);
            const length = Math.max(newNode.children.length, oldNode.children.length);
            for (let i = 0; i < length; i++) {
                nodesToRemove = [
                    ...nodesToRemove,
                    ...updateElement(
                        $parent.childNodes[index],
                        newNode.children[i],
                        oldNode.children[i],
                        i
                    )];
            }
        }
        if (newNode && newNode.attrs && newNode.attrs.ref) {
            newNode.attrs.ref($parent.childNodes[index]);
        }
        return nodesToRemove;
    }

    function patch($el, view, props = {}) {
        const newDom = view({
            ...props,
            store,
            render(props) { patch($el, view, props); }
        });
        const removedNodes = updateElement($el, newDom, oldDom);
        removedNodes.map(node => node.parentElement.removeChild(node));
        oldDom = newDom;
    }

    return patch;
}
