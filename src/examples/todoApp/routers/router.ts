import * as BB from 'backbone';
import { AppView } from '../views/appView';
import { Todos } from '../collections/todos';


class TodoRouter extends BB.Router {
    app: AppView;

    constructor(options = {} as BB.RouterOptions) {
        super({
            routes: {
                '*filter': 'setFilter',
                '': 'main'
            },
            ...options
        });
    }

    setFilter(param) {
        this.app = this.ensureApp({ todoFilter: param || '' });
        // Set the current filter to be used
        this.app.setTodoFilter(param || '');

        // Trigger a collection filter event, causing hiding/unhiding
        // of Todo view items
        this.app.collection.trigger('filter');
    }

    ensureApp(options) {
        if (!this.app) {
            this.app = new AppView({
                collection: new Todos(),
                ...options
            });
        }
        return this.app;
    }
}

export { TodoRouter };
