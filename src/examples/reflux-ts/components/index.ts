import { main, MainActions } from './main';
import { currentItem, ItemActions } from './todoItem';
import { merge } from '../itrx';


export const rootEffect = () => merge(
    main(),
    currentItem()
);

export const Actions = {
    ...MainActions,
    ...ItemActions
};
