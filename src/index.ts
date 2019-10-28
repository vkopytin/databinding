if (/[\?&]contacts[=&]/.test('' + window.location)) {
    require('./contactsApp');
} else if (/[\?&]todo=bb&?/.test('' + window.location)) {
    require('./todoApp');
} else if (/[\?&]todo=r&?/.test('' + window.location)) {
    require('./todoAppReact');
} else {
    require('./todoAppWithJQuery');
}