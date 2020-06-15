import { dom } from './dom';


export const EVENT_NAMES = {
    onClick: 'click',
    onInput: 'input',
    onKeyPress: 'keypress',
    onChange: 'change',
    onSubmit: 'submit'
};

function arrayMerge(array1, array2) {
    const array = [].concat(array1);
    for (let i = 0; i < array2.length; i++) {
        if (array.indexOf(array2[i]) === -1) {
            array.push(array2[i]);
        }
    }
    return array;
}

export function el(type, attrs = {}, ...children) {
    children = [].concat(...children).filter(a => a !== undefined);
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
        if (typeof node === 'string') {
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
        return dom.el(type, attrs, ...[].concat(children).map(child => createElement(child)));
    }

    function compare(left, right) {
        return typeof left !== typeof right
            || typeof left === 'string' && left !== right
            || left.type !== right.type;
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
        if (oldValue === undefined) {
            $el[key] = newValue;
        } else if (newValue === undefined) {
            $el[key] = newValue;
        } else if (newValue !== oldValue) {
            $el[key] = newValue;
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

    function updateElement($parent, newNode, oldNode, index = 0) {
        if (!oldNode) {
            $parent.appendChild(
                createElement(newNode)
            );
        } else if (!newNode) {
            $parent.removeChild(
                $parent.childNodes[index]
            );
        } else if (compare(newNode, oldNode)) {
            $parent.replaceChild(
                createElement(newNode),
                $parent.childNodes[index]
            );
        } else if (newNode.type) {
            updateAttributes($parent.childNodes[index], newNode.attrs, oldNode.attrs);
            const length = Math.max(newNode.children.length, oldNode.children.length);
            for (let i = 0; i < length; i++) {
                updateElement(
                    $parent.childNodes[index],
                    newNode.children[i],
                    oldNode.children[i],
                    i
                );
            }
        }
    }

    function patch($el, view, props = {}) {
        const newDom = view({
            ...props,
            store,
            render(props) { patch($el, view, props); }
        });
        updateElement($el, newDom, oldDom);
        oldDom = newDom;
    }

    return patch;
}
