import * as vdom from './virtualDom';


export function connect(mapStateToProps, mapDispatchToProps) {
    let unsubscribe = () => { };
    return function (wrappedTemplate) {
        return function (p) {
            const { render, store = vdom.currentStore, ...props } = p;
            unsubscribe();
            unsubscribe = store.subscribe((state) => {
                render && render(props);
            });

            return wrappedTemplate({
                ...props,
                ...mapStateToProps(store.getState(), props),
                ...mapDispatchToProps(store.dispatch, props)
            });
        }
    }
}
