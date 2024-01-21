import CollectingTable from './CollectingTable.svelte';

const collectingTable = new AdminCartEditor({
    
	target: document.getElementById("collectingtable-target"),
	props: JSON.parse(document.getElementById("collectingtable-props").textContent),
});

export default collectingTable;