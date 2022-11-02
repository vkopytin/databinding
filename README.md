# databindjs
Databinding in javascript

This is my personal research project. To check that databinding is achiavable in javascript. And try to see what impact it would take on projects if used.

`$yarn add databindjs` or `$npm install databindjs`

How it is expected to integrate (Example: https://jsfiddle.net/rsjpa0o8/5/)
```javascript
import { bindTo, unbindFrom, updateLayout } from 'databindjs';

interface View extends ReturnType<typeof initialize$View> { }

function initialize$View<T>(inst: T, $el) {
    return Object.assign(inst, {
        $newTodo: $('.new-todo', $el),
        $total: $('.total', $el),
        itemsListView: new TodoListView({
            $el: $('.todo-list', $el)
        }),
        $toggleAll: $('.toggle-all', $el),
        $todoCount: $('.todo-count strong', $el),
        $todoCompleted: $('.clear-completed', $el),
        $itemWord: $('.item-word', $el),
        $itemsWord: $('.items-word', $el)
    });
}

class View {
    $el = ...
    ...
    binding = bindTo(this, () => new ViewModel(), {
        '$total.text': 'items.length', // two way to property on ViewModel
        '-$toggleAll.prop(checked)': 'remaining.length|not', // one way from source to target to property on ViewModel
        '+$newTodo.val': 'newTodoTitle', // one way from target to source to property on ViewModel
        '-$newTodo.keypress': '.bind(onKeypress)', // one way from source to target to property on View (.) comes first
        '-$todoCount.text': 'remaining.length', 
        '-$itemWord.toggleClass(hidden)': 'remaining.1|bool',
        '-$itemsWord.toggleClass(hidden)': 'remaining.1|not',
        'itemsListView.items': 'items',
        'itemsListView.filter': 'filterItems',
    });
    ...
    render() {
        this.$el.html(<...>);
        initialize$View(this, this.$el);

        updateLayout(this.binding);
    }
    ...
    remove() {
        unbindFrom(this.binding);
        this.$el.remove();
    }
}
```

This is pure JS solution to implement databinding for javascript application.

To build solution run `yarn watch`. It would build `lib/index.html` and `lib/main.js`   
To start dev server run `yarn dev`. It would run local server on https://localhost:8080/index.html by default.    

The goal is to get at least workable databinding solution. Ideally compatible to use for javascript and another frameworks (if possible)

Tasks that databind should perform (toDO):
1. [x] Monitor changes and transfer value from source to target and vice versa (two way databinding);
2. [x] Allow slightly modify value over databinding declaration. e.g when it is like simple boolean value. And need to apply against `not true` instead when property returns just `true`. Right now it is resolved over pipe declaration;
2. [ ] Convert values during transfer from one type to another. Ideally it should allow to specify custom type convertes as well;
3. [ ] Validate data before transfer. Provide validation error report. Maybe rise validation error exeption.
4. [ ] (The most tough task) Allow integration with template engines (mustachejs, undescore/template, etc) or just with pure DOM elements.

Examples of integration with:
1. [x] javascript + jquery integration;
2. [x] backbone integration;
3. [x] React (it is possible and there is a small reason - to make two way databinding (seems like it is equal just to use view model directly in JSX. A bit more JS adjustments with onChange events and listen to view model change));
4. [ ] Angular (if possible and there is a reason).

Here is the list of problems with automatic databinding.

| Term            | Description
|-----------------| ---
| Source          | view model. Source of changes.
| Target          | view (layout implementation) For the future it can be template.
| Binding monitor | an object that keeps all information needed to monitor and refresh/transfer values between target and source.

- Not clear how databinding by default should start from source to target or from target to source. Since it is all about binding to a view model, it is assumed that view model is a first source of changes. And by default, when layout is updated, all initial values come from the source to target;
- Taking into account that binding declarations are easy to define, there is possibility for binding with many properties. That could lead to too many monitors in the one solution, that would impact application load time (performance). For instance if it is expected to bind two elements that are deep in the path e.g. `target1.subarget2.subtarget3 <-> source1.subsource2.subsource3` it would create internally 6 databind monitors. Such monitor will monitor changes for particular part of the path. The most efficient way is to keep just enough binding declarations per view. In the case there are constantly groving databind declarations, maybe a good reason vould be to split such view on several sub-views with their own databinding declarations. That would improve app load performance;
- To many event listeners. Need to cleanup all events after value of the parent propery has updated.
- Need effective way to fast cleanup binding monitors when the whole view is destoryed. Ideally it should do nothing, just garbage collected by JS engine. That is a main reason why view model instance shuold be created along with databinding and view. That approach would allow just remove view and expect that databinding will be garbage collected with such view;
- When databinding are defined globally, there should be a method to unbind data when view is destroyed;
- Two bound controls could lead to a recursion. This is when one control value is based from the oposit element by relation. There should be a way to break such unexpected recursion from one side and to allow update all values according to dependent data binding declarations from another side.
