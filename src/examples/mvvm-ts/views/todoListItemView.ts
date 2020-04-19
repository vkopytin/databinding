import { template } from '../templates/listItem';
import utils = require('../utils');
import { TodoViewModelItem } from '../viewModels';


function htmlToEl(html) {
    const el = document.createElement('div');
    utils.html(el, html);

    return el.firstElementChild;
}

class TodoListItemView<T extends TodoViewModelItem> {
    el = htmlToEl(template({}));
    vm: T;
    completeCommand;
    deleteCommand;
    updateTitleCommand;
    offTitleChange;
    offCompletedChange;
    offDeleteClick;

    getId() {
        return utils.attr(this.el, 'data-id');
    }

    setId(val) {
        if (this.getId() !== val) {
            utils.attr(this.el, 'data-id', val);
        }
        return val;
    }

    getTitle() {
        return utils.el('.title', this.el).value;
    }

    setTitle(val) {
        if (this.getTitle() !== val) {
            const title = utils.el('.title', this.el);
            title.value = val;
        }
        return val;
    }

    getCompleted() {
        const el = utils.el('.completed', this.el);
        return el.checked;
    }

    setCompleted(newValue) {
        const oldValue = this.getCompleted();
        if (oldValue !== newValue) {
            utils.el('.completed', this.el).checked = newValue;
        }
        return newValue;
    }

    bind() {
        this.unbind();
        this.completeCommand = this.vm.completeCommand;
        this.deleteCommand = this.vm.deleteCommand;
        this.updateTitleCommand = this.vm.updateTitleCommand;
        this.offCompletedChange = utils.on(this.el, '.completed', 'click', () => this.completeCommand.exec(this.getCompleted()));
        this.offDeleteClick = utils.on(this.el, '.delete', 'click', () => this.deleteCommand.exec());
        this.offTitleChange = utils.on(this.el, '.title', 'input', () => this.updateTitleCommand.exec(this.getTitle()));
    }

    unbind() {
        this.completeCommand = null;
        this.updateTitleCommand = null;
        this.deleteCommand = null;
        utils.getResult(this, () => this.offTitleChange);
        utils.getResult(this, () => this.offCompletedChange);
        utils.getResult(this, () => this.offDeleteClick);
    }

    setViewModel(item: T) {
        if (this.vm !== item) {
            this.vm = item;
            this.bind();
            this.setId(item.getId());
            this.setTitle(item.getTitle());
            this.setCompleted(item.getIsComplete());
        }
    }

    remove() {
        this.unbind();
        utils.remove(this.el);
    }
}

export { TodoListItemView };
