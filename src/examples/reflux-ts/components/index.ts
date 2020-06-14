import { main } from './main';
import { merge } from '../itrx';


export const rootEffect = (action$, state$) => merge(
    main(action$, state$)
);
