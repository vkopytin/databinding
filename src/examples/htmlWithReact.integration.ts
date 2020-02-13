import * as $ from 'jquery';
import { MulticastDelegate } from 'databindjs';
import { utils } from 'databindjs';
import * as domTools from '../utils/dom-tools';


export const htmlWithReactIntegration = [{
    matches(obj) {
        return utils.isElement(obj);
    },
    isEqual(left, right) {
        return left === right;
    },
    properties: [{
        name: /^addClass\((.+)\)$/,
        getter(obj: Element, name: string) {
            return !domTools.hasClass(obj, name);
        },
        setter(obj: Element, name: string, value) {
            return domTools.toggleClass(obj, name, !value);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^toggleClass\((.+)\)$/,
        getter(obj: Element, name: string) {
            return !domTools.hasClass(obj, name);
        },
        setter(obj: Element, name: string, value) {
            return domTools.toggleClass(obj, name, value);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^prop\((.+)\)$/,
        getter(obj: Element, name: string) {
            return $(obj).prop(name);
        },
        setter(obj: Element, name: string, value) {
            $(obj).prop(name, value);
        },
        handler: {},
        attach(obj: Element, propName: string, handler) {
            const callback = evnt => handler($(evnt.currentTarget), propName);
            $(obj).on('input', callback);

            return callback;
        },
        detach(obj: Element, propName: string, callback) {
            $(obj).off('all', callback);
        }
    }, {
        name: /^(\w+\(.*\))$/i,
        getter(obj: Element, name: string) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);

            return obj[fnName](fnValue);
        },
        setter(obj: Element, name: string, value) {
            const [a, fnName, fnValue] = /^(\w+)\((.*)\)$/.exec(name);
            obj[fnName](fnValue);
        },
        handler: {},
        attach(obj: { on; off; }, propName: string, handler) { },
        detach(obj: { on; off; }, propName: string, callback) { }
    }, {
        name: /^(checked)$/,
        getter(obj: Element, propName: string) {
            return $(obj).is(':checked');
        },
        setter(obj: Element, propName: string, value) {
            return $(obj).prop('checked', value);
        },
        handler: {},
        attach(obj: Element, propName: string, handler) {
            const callback = (evnt) => handler($(evnt.currentTarget), 'checked');
            $(obj).on('input', callback);

            return callback;
        },
        detach(obj: Element, propName: string, callback) {
            $(obj).off('input', callback);
        }
    }, {
        name: /^(val)$/,
        getter(obj: Element, propName: string) {
            return $(obj).val();
        },
        setter(obj: Element, propName: string, v) {
            return $(obj).val(v);
        },
        handler: {},
        attach(obj: Element, propName: string, handler) {
            const callback = (evnt) => handler($(evnt.currentTarget), 'val');
            $(obj).on('input', callback);

            return callback;
        },
        detach(obj: Element, propName: string, callback) {
            $(obj).off('input', callback);
        }
    }, {
        name: /^(text)$/,
        getter(obj: Element) {
            return $(obj).text();
        },
        setter(obj: Element, name, v) {
            return $(obj).text(v);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^(html)$/,
        getter(obj: Element) {
            return $(obj).html();
        },
        setter(obj: Element, name, v) {
            return $(obj).html(v);
        },
        handler: { general: () => { } },
        attach(obj, propName: string) { },
        detach(obj, propName: string) { }
    }, {
        name: /^(keypress)$/,
        getter(obj: Element, propName: string) {
            return this.handler.getHandler(obj, propName);
        },
        setter(obj: Element, propName: string, value) {
            this.handler.addHandler(obj, propName, value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, event.type, evnt]),
        attach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            $(obj).on(eventName, this.handler.invoke);
        },
        detach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            this.handler.removeHandler(obj, eventName);
            $(obj).off(eventName, this.handler.invoke);
        }
    }, {
        name: /^(click)$/,
        getter(obj: Element) {
            return this.handler.getHandler(obj);
        },
        setter(obj: Element, propName: string, value) {
            this.handler.addHandler(obj, propName, value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, event.type, evnt]),
        attach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            $(obj).on(eventName, this.handler.invoke);
        },
        detach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            this.handler.removeHandler(obj, eventName);
            $(obj).off(eventName, this.handler.invoke);
        }
    }, {
        name: /^(dblclick)$/,
        getter(obj: Element) {
            return this.handler.getHandler(obj);
        },
        setter(obj: Element, propName: string, value) {
            this.handler.addHandler(obj, propName, value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, event.type, evnt]),
        attach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            $(obj).on(eventName, this.handler.invoke);
        },
        detach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            this.handler.removeHandler(obj, eventName);
            $(obj).off(eventName, this.handler.invoke);
        }
    }, {
        name: /^(blur)$/,
        getter(obj: Element) {
            return this.handler.getHandler(obj);
        },
        setter(obj: Element, propName: string, value) {
            this.handler.addHandler(obj, propName, value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, event.type, evnt]),
        attach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            $(obj).on(eventName, this.handler.invoke);
        },
        detach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            this.handler.removeHandler(obj, eventName);
            $(obj).off(eventName, this.handler.invoke);
        }
    }, {
        name: /^(keydown)$/,
        getter(obj: Element) {
            return this.handler.getHandler(obj);
        },
        setter(obj: Element, propName: string, value) {
            this.handler.addHandler(obj, propName, value);
        },
        handler: new MulticastDelegate(evnt => [event.currentTarget, event.type, evnt]),
        attach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            $(obj).on(eventName, this.handler.invoke);
        },
        detach(obj: Element, propName: string) {
            const [a, eventName] = this.name.exec(propName);
            this.handler.removeHandler(obj, eventName);
            $(obj).off(eventName, this.handler.invoke);
        }
    }]
}];
