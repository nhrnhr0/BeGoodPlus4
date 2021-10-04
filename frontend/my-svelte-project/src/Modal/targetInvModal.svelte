<script>
  import {
    closeModal,
    closeAllModals,
    openModal,
    modals
  } from 'svelte-modals';
  import {
    fly
  } from 'svelte/transition';
  import TargetInvModalEntery from './targetInvModalEntery.svelte';
  import {
    api_endpoint
  } from '../utils/globalStore';
  import {
    getData
  } from '../utils/fetcher';
import ProductModal from './productModal.svelte';


  export let isOpen;
  export let selectedStore;

  let response;

  
  if (selectedStore) {
    console.log('selectedStore:', selectedStore)
    const url = api_endpoint + '/inventory/' + encodeURIComponent(selectedStore.targetInventory) + '/';
    response = getData(url);
  }

  function addNewProductRow() {
    console.log('addProductRow');
    openModal(ProductModal, { 
		})
  }
</script>

{#if isOpen}
      <!-- on:introstart and on:outroend are required to transition 1 at a time between modals -->
    <div role="dialog" class="modal" transition:fly={{ y: 50 }} on:introstart on:outroend>
        <div class="contents">
          {#await $response}
          loading...
      {:then response_value} 
      <h2>עריכת מטרות  <br> {selectedStore.name}</h2>
        <table class="edit">
          <thead>
              <tr>
                  <th>שם</th>
                  <th>כמות</th>
                  <th>צבע</th>
                  <th>מידה</th>
                  <th>מקט</th>
                  <th>ספק</th>
                  <th>פעולות</th>
              </tr>
          </thead>
          <tbody id="store_tbody">
                  {#each response_value.entries as row}
                    <TargetInvModalEntery data={row} />
                  {/each}
                  <button on:click={addNewProductRow}>add</button>
              
          </tbody>
      </table>
      {/await}
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