export const template = data => `
<div class="row">
    <div class="column editor-placeholder">
        <div class="region">
            <div class="toolbar">
                <button class="save">Save</button>
            </div>
            <div class="editor wysiwyg-editor article cke_editable cke_editable_themed cke_contents_ltr cke_show_borders" contenteditable="true">
            </div>
        </div>
    </div>
    <div class="column html-editor-placeholder region">
        <textarea class="html-editor">
        </textarea>
    </div>
</div>
`;
