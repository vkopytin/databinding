import { store } from './store';


export function connect(mapStateToProps, mapDispatchToProps) {
    let unsubscribe = () => { };
    return function (wrappedTemplate) {
        return function (p) {
            const { render, ...props } = p;
            unsubscribe();
            unsubscribe = store.subscribe((state) => {
                render(props);
            });

            return wrappedTemplate({
                ...props,
                ...mapStateToProps(store.getState(), props),
                ...mapDispatchToProps(store.dispatch, props)
            });
        }
    }
}
