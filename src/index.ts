if (/[\?&]contacts[=&]/.test('' + window.location)) {
    require('./contactsApp');
} else if (/[\?&]todo[=&]/.test('' + window.location)) {
    require('./todoApp');
} else {
    require('./todoAppWithJQuery');
}