import { main } from './main';


export const rootEffect = (action, state) => {
    return [].concat(
        main(action, state)
    );
};
