export const template = data => `
    <div class="editor-placeholder">
        <div class="toolbar">
            <button class="save">Save</button>
        </div>
        <div class="editor wysiwyg-editor article cke_editable cke_editable_themed cke_contents_ltr cke_show_borders" contenteditable="true">
        </div>
    </div>
    <div class="html-editor-placeholder">
        <textarea class="html-editor">
        </textarea>
    </div>
`;
