import EditDocSignature from './EditDocSignature.svelte';

const editDocSignature = new EditDocSignature({
	target: document.getElementById("editdocsignature-target"),
	props: JSON.parse(document.getElementById("editdocsignature-props").textContent),
});

export default editDocSignature;