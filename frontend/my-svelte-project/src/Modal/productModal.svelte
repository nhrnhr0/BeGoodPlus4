<script>
import {
    closeModal,
    closeAllModals,
    openModal,
    modals
} from 'svelte-modals';
import AutoComplete from "simple-svelte-autocomplete";
import {
    bind
} from 'svelte/internal';
import {
    fly
} from 'svelte/transition';
import {endpoint,api_endpoint } from './../utils/globalStore'
export let data;
export let isOpen;
let newData = data || {};

async function searchProduct(keyword) {
	let url = api_endpoint + '/products_search/';
	const response = await fetch(url + encodeURIComponent(keyword) + '/');
	return await response.json();
}
let selectedProduct;

</script>

{#if isOpen}
<!-- on:introstart and on:outroend are required to transition 1 at a time between modals -->
<div role="dialog" class="modal" transition:fly={{ y: 50 }} on:introstart on:outroend>
    <div class="contents">
        <form>
            <div class="form-group">
                <label for="name">שם: </label>
                <AutoComplete placeholder="חנות" searchFunction={searchProduct} bind:selectedItem={selectedProduct} labelFieldName="name"
		            delay="50" localFiltering=false >
                </AutoComplete>
            </div>
        </form>
    </div>
</div>
{/if}

    <style>
.modal {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    /* allow click-through to backdrop */
    pointer-events: none;
}

.contents {
    min-width: 240px;
    border-radius: 6px;
    padding: 16px;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: auto;
}
</style>
