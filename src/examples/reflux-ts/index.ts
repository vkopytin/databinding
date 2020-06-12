import { makeVdom } from './virtualDom';
import { MainView } from './views/main';


const $el = document.createElement('div');
document.body.appendChild($el);
const patch = makeVdom(null);
patch($el, MainView, { value: 0 });
