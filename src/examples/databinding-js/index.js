const mainTemplate = data => `
<div>
    <div class="form">
    </div>
    <hr/>
    <h3>Select model</h3>
    <ul class="models">
        <li><label><input type="radio" name="select-model" value="0"/>&nbsp;Timer</label></li>
        <li><label><input type="radio" name="select-model" value="1"/>&nbsp;Counter</label></li>
        <li><label><input type="radio" name="select-model" value="2"/>&nbsp;Random number</label></li>
    </ul>
    <pre class="model-state">
    </pre>
</div>
`;

const formTemplate = data => `
<div class="form-item"><label>Enter your name: <input type="text" class="name" size="40" value=""/></label></div>
<div class="form-item"><label>Base64 code name: <input type="text" class="output" size="40" value=""/></label></div>
<div class="form-item"><span class="current-time">&nbsp;</span></div>
`;

function dispatcher() {

    const handlers = [];

    return {
        add(handler) {
            if (!handler) {
                throw new Error('Can\'t attach to empty handler');
            }
            handlers.push(handler);

            return function () {
                const index = handlers.indexOf(handler);
                if (~index) {
                    return handlers.splice(index, 1);
                }
                throw new Error('Ohm! Something went wrong with detaching unexisting event handler');
            };
        },

        notify() {
            const args = [].slice.call(arguments, 0);
            for (const handler of handlers) {
                handler.apply(null, args);
            }
        }
    }
}

function initEvents() {
    const args = [].slice.call(arguments, 0);
    const events = {};
    for (const key of args) {
        events[key] = dispatcher();
    }
    return {
        on(eventName, handler) {
            return events[eventName].add(handler);
        },
        trigger(eventName) {
            events[eventName].notify();
        }
    };
}

const utils = {
    html(el, html) {
        el.innerHTML = html;
    },
    el(selector, inst = document) {
        if (!selector) {
            return null;
        }
        if ('string' === typeof selector) {
            return inst.querySelector(selector);
        }
        return selector;
    },
    on(inst, selector, eventName, fn) {
        const handler = function (evnt) {
            if (evnt.target.matches(selector)) {
                fn(evnt);
            }
        }
        inst.addEventListener(eventName, handler);
        return function () {
            inst.removeEventListener(eventName, handler);
        }
    },
    getResult(inst, getFn) {
        const fnOrAny = getFn && getFn();
        if (typeof fnOrAny === 'function') {
            return fnOrAny.call(inst);
        }
        return fnOrAny;
    }
};

class FormView {
    constructor(selector) {
        this.el = utils.el(selector);
    }

    getName() {
        return this.name.value;
    }

    setName(val) {
        if (val !== this.name.value) {
            this.name.value = val;
            this.name.dispatchEvent(new Event('input'));
        }
    }

    getOutput() {
        return this.output.value;
    }

    setOutput(val) {
        if (val !== this.output.value) {
            this.output.value = val;
            this.output.dispatchEvent(new Event('input'));
        }
    }

    setCurrentTime(val) {
        if (val != this.currentTime.innerText) {
            this.currentTime.innerText = val;
        }
    }

    setModel(model) {
        this.unbind();
        if (!model) {
            return;
        }
        this.setName(model.prop('name'));
        this.setOutput(model.prop('output'));
        model && this.bind(model);
    }

    initialize() {
        utils.html(this.el, formTemplate({}));
        this.initialize$FormView(this.el);
    }

    initialize$FormView(el) {
        this.name = utils.el('.name', el);
        this.output = utils.el('.output', el);
        this.currentTime = utils.el('.current-time', el);
    }

    bind(model) {
        // update data from DOM to model
        this.onInputNameRemove = utils.on(this.el, '.name', 'input', () => model.prop('name', this.getName()));
        this.onInputOutputRemove = utils.on(this.el, '.output', 'input', () => model.prop('output', this.getOutput()));
        // update data from model to DOM
        this.syncNameRemove = model.on('change:name', () => this.setName(model.prop('name')));
        this.syncOutputRemove = model.on('change:output', () => this.setOutput(model.prop('output')));
        this.syncCurrentTimeRemove = model.on('change:time', () => this.setCurrentTime(model.prop('time')));
    }

    unbind() {
        utils.getResult(this, () => this.onInputNameRemove);
        utils.getResult(this, () => this.onInputOutputRemove);
        utils.getResult(this, () => this.syncNameRemove);
        utils.getResult(this, () => this.syncOutputRemove);
        utils.getResult(this, () => this.syncCurrentTimeRemove);
    }

    remove() {
    }
}

class TimerModel {
    constructor() {
        const{ on, trigger } = initEvents(this,
            'change:name',
            'change:output',
            'change:time'
        );
        this.on = on;
        this.trigger = trigger;
        this.state = {
            name: 'initial value',
            output: '',
            time: new Date()
        };
        this.initialize();
    }

    initialize() {
        this.timer = setInterval(() => this.prop('time', new Date()), 1000);
        this.processFormRemove = this.on('change:name', () => this.processForm());
    }

    prop(propName, val) {
        if (arguments.length > 1 && this.state.val !== val) {
            this.state[propName] = val;
            this.trigger('change:' + propName);
        }
        return this.state[propName];
    }

    processForm() {
        setTimeout(() => {
            this.prop('output', btoa(this.prop('name')));
        });
    }

    remove() {
        utils.getResult(this, () => this.processFormRemove);
        clearInterval(this.timer);
    }
}

class CounterModel {
    constructor() {
        const{ on, trigger } = initEvents(this,
            'change:name',
            'change:output',
            'change:time'
        );
        this.on = on;
        this.trigger = trigger;
        this.state = {
            name: 'initial value',
            output: '',
            time: 0
        };
        this.initialize();
    }

    initialize() {
        this.timer = setInterval(() => this.prop('time', this.prop('time') > 100 ? 0 : this.prop('time') + 1), 1000);
        this.processFormRemove = this.on('change:name', () => this.processForm());
    }

    prop(propName, val) {
        if (arguments.length > 1 && this.state.val !== val) {
            this.state[propName] = val;
            this.trigger('change:' + propName);
        }
        return this.state[propName];
    }

    processForm() {
        setTimeout(() => {
            this.prop('output', btoa(this.prop('name')));
        });
    }

    remove() {
        utils.getResult(this, () => this.processFormRemove);
        clearInterval(this.timer);
    }
}

class RandomModel {
    constructor() {
        const{ on, trigger } = initEvents(this,
            'change:name',
            'change:output',
            'change:time'
        );
        this.on = on;
        this.trigger = trigger;
        this.state = {
            name: 'initial value',
            output: '',
            time: 0
        };
        this.initialize();
    }

    initialize() {
        this.timer = setInterval(() => this.prop('time', Math.round(Math.random() * 10000)), 1000);
        this.processFormRemove = this.on('change:name', () => this.processForm());
    }

    prop(propName, val) {
        if (arguments.length > 1 && this.state.val !== val) {
            this.state[propName] = val;
            this.trigger('change:' + propName);
        }
        return this.state[propName];
    }

    processForm() {
        setTimeout(() => {
            this.prop('output', btoa(this.prop('name')));
        });
    }

    remove() {
        utils.getResult(this, () => this.processFormRemove);
        clearInterval(this.timer);
    }
}

class App {
    constructor(selector) {
        this.el = utils.el(selector);
    }

    initialize() {
        utils.html(this.el, mainTemplate({}));
        this.initialize$App(this.el);
        this.form.initialize();
        utils.on(this.el, '.models input', 'click', (evnt) => this.switchModel(evnt));
    }

    initialize$App(el) {
        this.form = new FormView(utils.el('.form', el));
        this.modelState = utils.el('.model-state', el);
    }

    logModelState(model) {
        utils.html(this.modelState, JSON.stringify(model))
    }

    bind(formModel) {
        this.form.setModel(formModel);
        this.removeHandlers = [
            formModel.on('change:name', () => this.logModelState(formModel)),
            formModel.on('change:output', () => this.logModelState(formModel)),
            formModel.on('change:time', () => this.logModelState(formModel))
        ];
    }

    switchModel(evnt) {
        const index = +evnt.target.value;
        this.bind(this.models[index]);
    }

    setModels(models) {
        this.models = models;
        this.bind(models[0]);
    }

    remove() {
        this.form.setModel(null);
        this.removeHandlers.forEach(removeHandler => utils.getResult(this, () => removeHandler))
        this.form.remove();
    }
}

setTimeout(() => {
    const app = new App('body');
    const models = [new TimerModel(), new CounterModel(), new RandomModel()];
    app.initialize();
    app.setModels(models);
});
