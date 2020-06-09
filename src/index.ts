import { useIntegration } from 'databindjs';
import { htmlWithReactIntegration } from './examples/htmlWithReact.integration';
import { jQueryIntegration } from './examples/jquery.integration';
import { backboneIntegration } from './examples/backbone.integration';


useIntegration(htmlWithReactIntegration);
useIntegration(jQueryIntegration);
useIntegration(backboneIntegration);

if (/[\?&]contacts[=&]/.test('' + window.location)) {
    require('./examples/contactsApp');
} else if (/[\?&]todo=bb&?/.test('' + window.location)) {
    require('./examples/todoApp');
} else if (/[\?&]todo=r&?/.test('' + window.location)) {
    require('./examples/todoAppReact');
} else if (/[\?&]todo=js&?/.test('' + window.location)) {
    require('./examples/todoAppWithJQuery');
} else if (/[\?&]databind=js&?/.test('' + window.location)) {
    require('./examples/databinding-js');
} else if (/[\?&]mvvm=js&?/.test('' + window.location)) {
    require('./examples/mvvm-ts');
} else {
    require('./examples/editor')
}
