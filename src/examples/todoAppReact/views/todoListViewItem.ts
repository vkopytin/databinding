import { Component, createRef } from 'react';
import { bindTo, subscribeToChange, unbindFrom, updateLayout, withEvents } from 'databindjs';
import { ENTER_KEY, ESC_KEY } from '../consts';
import { template } from '../templates/itemView';


class TodoListViewItem extends withEvents(Component)<any, any> {
    ref = createRef();
    editInput = null;
    state = {
        labelTitle: this.props.item.title(),
        editTitle: this.props.item.title(),
        completed: this.props.item.completed(),
        editing: false,
        hidden: false
    };
    prevChanges = {};

    binding = bindTo(this, () => this.props.item, {
        '-prop(labelTitle)': 'title',
        'prop(editTitle)': 'title',
        'prop(completed)': 'completed',
        '+props.bind(update)': 'event(change:completed)'
    });

    constructor(props) {
        super(props);
        subscribeToChange(this.binding, () => {
            this.setState({
                ...this.state
            });
        });
    }

    prop(propName, val?) {
        if (arguments.length > 1) {
            this.state[propName] = val;
            this.trigger('change:prop(' + propName + ')');
        }
        return this.state[propName];
    }

    componentDidMount() {
        updateLayout(this.binding);
    }

    componentWillUnmount() {
        unbindFrom(this.binding);
    }

    updateOnEnter(e) {
        if (e.which === ENTER_KEY) {
            this.close();
        }
    }

    edit() {
        this.prevChanges = this.props.item.toJSON();
        const textLength = ('' + this.prop('editTitle')).length;
        this.setState({ ...this.state, editing: true }, () => {
            this.editInput.focus();
            (this.editInput).setSelectionRange(textLength, textLength);
        });
    }

    revertOnEscape(e) {
        if (e.which === ESC_KEY) {
            this.setState({ ...this.state, editing: false }, () => {
                this.cancelChanges();
            });
        }
    }

    cancelChanges() {
        this.props.item.fromData(this.prevChanges);
    }

    close() {
        const value = '' + this.prop('editTitle');
        const trimmedValue = value.trim();

        if (!this.prop('editing')) {
            return;
        }

        if (trimmedValue) {
            this.props.item.update({ title: trimmedValue });
        } else {
            this.clear();
        }

        this.setState({ ...this.state, editing: false });
    }

    clear() {
        this.props.remove();
    }

    hide(on) {
        this.prop('hidden', !on);
    }

    render() {
        return template(this, this.ref);
    }
}

export { TodoListViewItem };
