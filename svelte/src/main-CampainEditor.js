import CampainEditor from './CampainEditor.svelte';

const campainEditor = new CampainEditor({
	target: document.getElementById("campaineditor-target"),
	props: JSON.parse(document.getElementById("campaineditor-props").textContent),
});

export default campainEditor;