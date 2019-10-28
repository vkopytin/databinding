import { Events } from '../../databinding/events';


const serviceId = 'todo-service';

let inst = null;

const using = <T extends { onsuccess; onerror; result; error; onupgradeneeded; }, R>(obj: T, next: (err, res?: any) => any) => {
    const origNext = next;
    const run = () => {
        obj.onupgradeneeded = (evnt) => origNext(null, obj.result);
        if ('onsuccess' in obj) {
            obj.onsuccess = (evnt) => next === origNext ? null : next(null, obj.result);
        } else {
            next === origNext ? null : next(null, obj.result);
        }
        obj.onerror = () => next(obj.error);
    }

    const enqueNext = (newFn: (err, res?) => any) => {
        const oldNext = next;
        next = (err, res: any) => {
            const result = oldNext(err, res);
            result.onerror = () => newFn(result.error);
            if ('onsuccess' in result) {
                result.onsuccess = () => newFn(null, result.result);
            } else {
                return newFn(null, result);
            }
            return result;
        };

        return {
            next: enqueNext,
            run: run
        };
    };

    return {
        next: enqueNext,
        run: run
    };
}

class TodoService extends Events {
    tableName = 'todos';

    static inst(): TodoService {
        if (inst === null) {
            inst = new TodoService();

            using(indexedDB.open(serviceId, 1), (err, res) => {
                const store = res.createObjectStore(inst.tableName, { keyPath: 'id', autoIncrement: true });
                store.createIndex('products_id_unqiue', 'id', { unique: true });
                return store;
            }).run();
        }

        return inst;
    }

    constructor() {
        super();
    }

    list(fn: (err, res) => void) {
        const items = [];
        using(indexedDB.open(serviceId, 1), (err, res) => res)
            .next((err, res) => {
                return res.transaction(this.tableName, 'readonly');
            })
            .next((err, tr) => {
                const store = tr.objectStore(this.tableName);
                return store.openCursor();
            })
            .next((err, res) => {
                if (res) {
                    items.push({
                        id: res.key,
                        title: res.value.title,
                        completed: res.value.completed
                    });
                    res.continue();
                } else {
                    fn(err, items);
                }
                return res;
            }).run();
    }

    filter(whereFn: (item, key) => boolean, fn: (err, res) => void) {
        const items = [];
        using(indexedDB.open(serviceId, 1), (err, res) => res)
            .next((err, res) => {
                return res.transaction(this.tableName, 'readonly');
            })
            .next((err, tr) => {
                const store = tr.objectStore(this.tableName);
                return store.openCursor();
            })
            .next((err, res) => {
                if (res) {
                    whereFn(res.value, res.key) && items.push({
                        id: res.key,
                        title: res.value.title,
                        completed: res.value.completed
                    });
                    res.continue();
                } else {
                    fn(err, items);
                }
                return res;
            }).run();
    }

    create(options, fn: (err, res) => void) {
        using(indexedDB.open(serviceId, 1), (err, res) => res)
            .next((err, res) => {
                return res.transaction(this.tableName, 'readwrite');
            })
            .next((err, tr) => {
                const store = tr.objectStore(this.tableName);
                return store.add(options);
            })
            .next((err, res) => {
                fn(err, res);
            })
            .run();
    }

    remove(id, fn: (err, res) => void) {
        using(indexedDB.open(serviceId, 1), (err, res) => res)
            .next((err, res) => {
                return res.transaction(this.tableName, 'readwrite');
            }).next((err, tr) => {
                const store = tr.objectStore(this.tableName);
                return store.delete(id);
            }).next((err, res) => {
                fn(err, res);
            })
            .run();
    }

    update(id, options = {}, fn?: (err, res) => void) {
        using(indexedDB.open(serviceId, 1), (err, res) => res)
        .next((err, res) => {
            return res.transaction(this.tableName, 'readwrite');
        }).next((err, tr) => {
            const store = tr.objectStore(this.tableName);
            return store.put({
                id: id,
                ...options
            });
        }).next((err, res) => {
            fn(err, res);
        })
        .run();
    }
}

export { TodoService };
