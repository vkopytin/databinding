export const template = data => `
<div>
    <label for="complete-all-${data.vid}">Complete All</label>
    <input class="complete-all" id="complete-all-${data.vid}" type="checkbox" title="Complete all"/>
    <input class="new-title" type="text" placeholder="Enter title and press enter" size="40"/>
    <span class="filter" style="flex: 1">
        <span>Show:</span>
        <label>All<input type="radio" name="filter" value="all"/></label>
        <label>Active<input type="radio" name="filter" value="active"/></label>
        <label>Complete<input type="radio" name="filter" value="completed"/></label>
    </span>
</div>
<ul class="todo-list"></ul>
<pre class="console"></pre>
`;
