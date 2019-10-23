# databinding
DataBinding in javascript

This is pure JS solution to implement databinding for javascript application.

To start solution run ```yarn watch```

The goal is to build fully working databinding solution that is compatible to use for javascript and another frameworks (if possible)

Right now there are several examples:
1. javascript + jquery integration
2. backbone integration

Try to integrate with
- [ ] React
- [ ] Angular

Here is the list of problems with automatic databinding.

Source - view model. Source of changes.
Target - view (layout implementation) For the future it can be template.
Binding monitor - an object that keeps all information needed to monitor and refresh/transfer values between target and source.

- Not clear how databinding by default should start from source to target or from target to source. Since it is all about binding to a view model, it is assumed that view model is a first source of changes. And by default, when layout is updated, all initial values come from the source to target.
- Taking into account that binding declarations are easy to define, there is possibility for binding to many elements. That could lead to too many monitors in the one solution, that would impact application load time. For instance if it is expected to bind two element that are deep in the path e.g. target1.subarget2.subtarget3 <-> source1.subsource2.subsource3 it would create internally 6 databind monitors. Such monitor will monitor changes for particular part of the path.
