if (/[\?&]contacts[=&]/.test('' + window.location)) {
    require('./examples/contactsApp');
} else if (/[\?&]todo=bb&?/.test('' + window.location)) {
    require('./examples/todoApp');
} else if (/[\?&]todo=r&?/.test('' + window.location)) {
    require('./examples/todoAppReact');
} else {
    require('./examples/todoAppWithJQuery');
}
