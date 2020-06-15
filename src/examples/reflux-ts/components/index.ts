import { main } from './main';
import { currentItem } from './todoItem';
import { merge } from '../itrx';


export const rootEffect = () => merge(
    main(),
    currentItem()
);
