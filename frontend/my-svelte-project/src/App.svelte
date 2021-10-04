<script>
	
	//import AutoComplete from "simple-svelte-autocomplete";
	import StoreInfoTab from "./tabs/StoreInfoTab.svelte"
	import { writable, get } from 'svelte/store';
	import {api_endpoint} from './utils/globalStore'
	let endpoint;
	let selectedStore;
	let url = api_endpoint + '/stores/'; 
	
	async function searchStore(keyword) {
		const response = await fetch(url + encodeURIComponent(keyword) + '/');
		return await response.json();
	}
</script>



<style type="text/scss">
	main {
		text-align: center;
		display: flex;
		flex-grow: 1;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		//max-width: 240px;
		width: 100vw;
		max-width: 100vw;
		margin: 0 auto;
		h1 {
			color: #000000;
			text-transform: uppercase;
			font-size: 3em;
			font-weight: 400;
		}
		.tab {
			//border: 1px solid rgb(0, 253, 55);
			border: 1px solid black;
			width: 90%;
		}
		
	}

	main :global(.autocomplete-input.svelte-77usy.svelte-77usy) {
		text-align: right;
	}

	
	/*@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}*/
</style>


<main>
	<h1>dashboard</h1>
	<!-- <AutoComplete placeholder="חנות" searchFunction={searchStore} bind:selectedItem={selectedStore} labelFieldName="name"
		maxItemsToShowInList="10" delay=2 localFiltering=false />	-->
		<Select {searchStore} {optionIdentifier} {getSelectionLabel} {getOptionLabel} {Item} placeholder="Search for 🍺"></Select>
	<div class="tab">
		<StoreInfoTab selectedStore={selectedStore}/>
	</div>
</main>