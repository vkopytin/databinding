import { main } from './main';
import { mergeIt } from '../itrx';




export const rootEffect = (action$, state$) => mergeIt(
    main(action$, state$)
);
