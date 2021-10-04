<script>
    import { Modals, closeModal, openModal, modals } from 'svelte-modals';
	import { fade } from 'svelte/transition'
    import TargetInvModal from '../Modal/targetInvModal.svelte'

    import {
        getData
    } from '../utils/fetcher';
    import {
        api_endpoint,
        modal
    } from '../utils/globalStore';

    export let selectedStore;
    //let response_value;
    let response;
    $: {
        if (selectedStore) {
            console.log('selectedStore:', selectedStore)
            const url = api_endpoint + '/inventory/' + encodeURIComponent(selectedStore.currentInventory) + '/';
            response = getData(url);
        }
    }

    function handleOpen() {
		openModal(TargetInvModal, { 
			selectedStore: selectedStore,
			/*onOpenAnother: () => {
				handleOpen()
			}*/
		})
    }
</script>


<div>
    {#await $response}
        loading...
    {:then response_value} 
        {#if response_value == undefined}
            בחר חנות
            {:else}
            <table class="info">
                <thead>
                    <tr>
                        <th>שם</th>
                        <th>כמות</th>
                        <th>צבע</th>
                        <th>מידה</th>
                        <th>מקט</th>
                        <th>ספק</th>
                    </tr>
                </thead>
                <tbody id="store_tbody">
                        {#each response_value.entries as row}
                        <tr>
                            <td>
                                {row.stock.product.name}
                            </td>
                            <td>
                                {row.amount}
                            </td>
                            <td>
                                {row.stock.productColor.name}
                            </td>
                            <td>
                                {row.stock.productSize.size}
                            </td>
                            <td>
                                {row.stock.__str__}
                            </td>
                            <td>
                                {row.stock.provider.name}
                            </td>
                        </tr>
                        {/each}
                        
                    
                </tbody>
            </table>
            
<Modals>
    <div slot="backdrop" class="backdrop" transition:fade on:click={closeModal}/>
</Modals>

            <button on:click="{handleOpen}">ערוך מטרות</button>
        {/if}
    {/await}

</div>



<style lang="scss">
    .backdrop {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        background: rgba(0,0,0,0.50)
    }
</style>