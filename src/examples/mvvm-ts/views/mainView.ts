import { Base } from '../base/base';
import utils = require('../utils');
import { template } from '../templates/mainView';
import { MainViewModel, TodoViewModelItem } from '../viewModels';
import { ListView } from '../controls/listView';
import { TodoListItemView } from './todoListItemView';


const ENTER_KEY = 13;

interface MainView extends ReturnType<typeof initialize$MainView> {

}

function initialize$MainView<T>(inst: T, el) {
    return Object.assign(inst, {
        newTitle: utils.el('.new-title', el),
        allComplete: utils.el('.complete-all', el),
        filterAll: utils.el('.all', el),
        filterActive: utils.el('.active', el),
        filterCompleted: utils.el('.completed', el),
        todoList: new ListView({
            el: utils.el('.todo-list', el),
            createItem() {
                return new TodoListItemView<TodoViewModelItem>();
            }
        })
    });
}

class MainView extends Base {
    vm = this.getViewModel();
    options = this.initOptions(this.config);
    el = utils.el(this.options.el);
    offTitleToModel;
    offTitleFromModel;
    offItemsFromModel;

    offOnKeypress;
    offMarkAllComplete;
    offChangeItems;
    offFilter;

    createNewItemCommand = { exec() { return; } };
    toggleAllCompleteCommand = { exec() { return; } };

    constructor(public config: ReturnType<MainView['initOptions']>) {
        super('change:items');
    }

    getTitle() {
        return this.newTitle.value;
    }

    setTitle(val) {
        if (this.newTitle.value !== val) {
            this.newTitle.value = val;
            utils.trigger(this.newTitle, 'input');
        }
    }

    getAllComplete() {
        return this.allComplete.checked;
    }

    setAllComplete(val) {
        if (this.allComplete.checked !== val) {
            this.allComplete.checked = val;
            utils.trigger(this.allComplete, 'change');
        }
    }

    getFilter() {
        const el = utils.el('.filter input:checked', this.el);
        return el && el.value;
    }

    setFilter(newValue: 'all' | 'active' | 'completed') {
        const oldValue = this.getFilter();
        if (newValue !== oldValue) {
            const el = utils.el(`.filter input[value="${newValue}"]`);
            el.checked = true;
        }
    }

    getViewModel() { 
        return null as MainViewModel;
    }

    setViewModel() {
        this.unbind();
        this.setFilter('all');
        this.setAllComplete(this.areAllComplete());
        this.bind();
    }

    initOptions(options = {}) {
        const defOpts = {
            el: 'body'
        };
        return {
            ...defOpts,
            ...options
        };
    }

    initialize() {
        const html = template({
            vid: 1
        });
        utils.html(this.el, html);
        initialize$MainView(this, this.el);

        this.offOnKeypress = utils.on(this.el, '.new-title', 'keypress', evnt => this.onKeypress(evnt));
        this.offMarkAllComplete = utils.on(this.el, '.complete-all', 'change', () => this.getAllComplete() && this.toggleAllCompleteCommand.exec());
        this.offChangeItems = this.todoList.on('change:items', () => this.setAllComplete(this.areAllComplete()));
        this.offFilter = utils.on(this.el, '.filter input', 'click', () => this.filterItems(this.getFilter()));

        this.setViewModel();
    }

    bind() {
        this.unbind();
        this.createNewItemCommand = this.vm.createNewItemCommand;
        this.toggleAllCompleteCommand = this.vm.markAllCompleteCommand;
        this.offTitleToModel = utils.on(this.el, '.new-title', 'input', () => this.vm.prop('title', this.getTitle()));
        this.offTitleFromModel = this.vm.on('change:title', () => this.setTitle(this.vm.prop('title')));
        this.offItemsFromModel = this.vm.on('change:items', () => this.todoList.prop('items', this.vm.prop('items')));
    }

    unbind() {
        this.createNewItemCommand = { exec() { return; } };
        this.toggleAllCompleteCommand = { exec() { return; } };
        utils.getResult(this, () => this.offTitleToModel);
        utils.getResult(this, () => this.offTitleFromModel);
        utils.getResult(this, () => this.offItemsFromModel);
    }

    onKeypress(evnt) {
        if (evnt.which === ENTER_KEY && ('' + this.newTitle.value).trim()) {
            this.createNewItemCommand.exec();
        }
    }

    areAllComplete() {
        if (!this.todoList || !this.todoList.prop('items').length) {
            return false;
        }
        return !utils.find(this.vm.prop('items'), i => !i.getIsComplete());
    }

    filterItems(filterName: 'all' | 'active' | 'completed') {
        switch (filterName) {
            case 'active':
                return this.todoList.setFilter(i => i.getIsComplete());
            case 'completed':
                return this.todoList.setFilter(i => !i.getIsComplete());
            default:
                return this.todoList.setFilter(null);
        }
    }

    remove() {
        utils.getResult(this, () => this.offOnKeypress);
        utils.getResult(this, () => this.offMarkAllComplete);
        utils.getResult(this, () => this.offChangeItems);
        utils.getResult(this, () => this.offFilter);

        utils.remove(this.el);
    }
}

export { MainView };
