import AdminCartEditor from './AdminCartEditor.svelte';

const adminCartEditor = new AdminCartEditor({
	target: document.getElementById("admincarteditor-target"),
	props: JSON.parse(document.getElementById("admincarteditor-props").textContent),
});

export default adminCartEditor;