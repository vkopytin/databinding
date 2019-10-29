import { useIntegration } from './databinding';
import { jQueryIntegration } from './examples/jquery.integration';
import { backboneIntegration } from './examples/backbone.integration';


useIntegration(jQueryIntegration);
useIntegration(backboneIntegration);

if (/[\?&]contacts[=&]/.test('' + window.location)) {
    require('./examples/contactsApp');
} else if (/[\?&]todo=bb&?/.test('' + window.location)) {
    require('./examples/todoApp');
} else if (/[\?&]todo=r&?/.test('' + window.location)) {
    require('./examples/todoAppReact');
} else {
    require('./examples/todoAppWithJQuery');
}
