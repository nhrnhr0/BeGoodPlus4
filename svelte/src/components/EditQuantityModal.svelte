

<script>
    import { Button, Modal } from "carbon-components-svelte";
    import { editQuantityModalOpener } from './../stores/modalManager';
    import {ALL_SIZES, ALL_COLORS, ALL_VARIENTS} from './../stores/globals';
    import { TextInput,NumberInput } from "carbon-components-svelte";
    import { Loading } from "carbon-components-svelte";
    import { DataTable } from "carbon-components-svelte";

    import { onMount } from "svelte";
    import {apiAddDocStockEnterEntery, apiDeleteDocStockEnterPPnEntry, apiGetDocStockEnterPPnEntries} from './../api/api'
    //let open = false;
    let ver_input_val, size_input_val, color_input_val,price_input_val;
    let amount = undefined;
    let existingEntries = undefined;
    export function openEditQuantityModal() {
        //open = true;
        editQuantityModalOpener.isOpen = true;

    }
    export function closeEditQuantityModal() {
        //open = false;
        $editQuantityModalOpener.isOpen = false;
    }

    $: {
        if ($editQuantityModalOpener.isOpen) {
            let docId = $editQuantityModalOpener.data.docId;
            let sku_ppn_id= $editQuantityModalOpener.data.data.sku_ppn_id;
            if(price_input_val == undefined){
                price_input_val = $editQuantityModalOpener.data.data.defult_price;
            }
            apiGetDocStockEnterPPnEntries(docId, sku_ppn_id).then(res => {
                existingEntries = res;
            });
        }else {
            existingEntries = undefined;
        }
    }

    function deleteEntry(docId, ppnId, entryId) {
        console.log('before delete: ', docId, ppnId, entryId);
        apiDeleteDocStockEnterPPnEntry(docId, ppnId, entryId).then(res => {
            console.log('res: ', res);
            existingEntries = res;
        });
    }

    function addNewEntry() {
        
        if(size_input_val && color_input_val && amount) {
            let newEntry = {
                ver: ver_input_val,
                size: size_input_val,
                color: color_input_val,
                amount: amount,
                price: price_input_val,
                sku_ppn_id: $editQuantityModalOpener.data.data.sku_ppn_id,
                doc_id: $editQuantityModalOpener.data.docId
            };
            console.log('add new entry: ', newEntry);
            apiAddDocStockEnterEntery(newEntry).then(res => {
                existingEntries = res;
            });
            //existingEntries.push(newEntry);
            //ver_input_val = undefined;
            //size_input_val = undefined;
            //color_input_val = undefined;
            //amount = undefined;
        }
    }
</script>

<!-- <Button on:click={() => (open = true)}>Create database</Button>-->

<Modal
  bind:open={$editQuantityModalOpener.isOpen}
  modalHeading="שנה כמויות"
  on:open
  on:close
  on:submit
>
{#if $editQuantityModalOpener.isOpen && $editQuantityModalOpener.data != undefined}
<!--כותרת: שם המוצר אצל הספק ואצלנו ומחיר אחרון-->
<div class="main">
    <div class="bx--row">
            <div class="bx--form-item2">
                    <label class="bx--label" for="product-sku_product_name">שם המוצר</label>
                    <input class="bx--text-input" id="product-sku_product_name" type="text" value={$editQuantityModalOpener.data.data.sku_product_name} disabled/>
            </div>
            <div class="bx--form-item2">
                <label for="product-sku_product_id">מזהה שלנו</label>
                <input class="bx--text-input" id="product-sku_product_id" type="text" value={$editQuantityModalOpener.data.data.sku_product_id} disabled/>
            </div>
            <div class="bx--form-item2">
                <label for="product-sku_ppn_name">שם ספק</label>
                <input class="bx--text-input" id="product-sku_ppn_name" type="text" value={$editQuantityModalOpener.data.data.sku_ppn_name} disabled/>
            </div>
            <div class="bx--form-item2">
                <label for="product-sku_ppn_id">מזהה הספק מוצר</label>
                <input class="bx--text-input" id="product-sku_ppn_id" type="text" value={$editQuantityModalOpener.data.data.sku_ppn_id} disabled/>
            </div>
        </div>
        <hr class="seperator">
        <h4>הוסף חדש</h4>
        <!--
            form:
            select size from all sizes
            select color from all colors
            select variant from all variants

        -->
        <form class="new-product-form">
            <div class="bx--form-item2">
                <label for="size">גודל</label>
                <TextInput bind:value={size_input_val} name="sizes" id="sizes-input" list="sizes_list"/>
                <datalist id="sizes_list">
                    {#each $ALL_SIZES as size}
                        <option id="clr-{size.id}" value="{size.size}"> </option>
                    {/each}
                </datalist>


            </div>
            <div class="bx--form-item2">
                <label for="color">צבע</label>
                <TextInput bind:value={color_input_val} name="sizes" id="color-input" list="color_list"/>
                <datalist id="color_list">
                    {#each $ALL_COLORS as color}
                        <option id="clr-{color.id}" value="{color.name}"></option>
                    {/each}
                </datalist>
            </div>

            <div class="bx--form-item2">
                <label for="varients">מודל</label>
                <TextInput bind:value={ver_input_val} name="varients" id="varients-input" list="varients_list"/>
                <datalist id="varients_list">
                    {#each $ALL_VARIENTS as varient}
                        <option id="clr-{varient.id}" value="{varient.name}"></option>
                    {/each}
                </datalist>
            </div>

            <div class="bx--form-item2">
                <label for="amount">כמות</label>
                <TextInput bind:value={amount} />
            </div>

            <div class="bx--form-item2">
                <label for="amount">מחיר</label>
                <TextInput bind:value={price_input_val} />
            </div>

            <div class="bx--form-item2">
                
            
            <div class="bx--form-item2">
                <Button on:click={addNewEntry}>הוסף</Button>
            </div>


        </form>

        <div class="existing-entries">
            
        </div>
        </div>
    <hr class="seperator">
    <div class="existing-entries">
        <h4>מוצרים קיימים בטופס</h4>
        {#if existingEntries}
            <!--
                [{"id":1,"quantity":2,"price":"23.000","created_at":"2022-03-16T12:29:05.761799+02:00","sku_id":"1","sku_size_id":"87","sku_size_name":"S","sku_color_id":"77","sku_color_name":"שחור","sku_verient_id":"","sku_verient_name":"","sku_ppn_id":"1","sku_ppn_name":"דגמ\"ח אמרקאי ת.חוץ+גומי","sku_product_id":"20","sku_product_name":"דגמ\"ח אינדאני"},{"id":2,"quantity":2,"price":"23.000","created_at":"2022-03-16T12:33:48.631403+02:00","sku_id":"2","sku_size_id":"88","sku_size_name":"M","sku_color_id":"77","sku_color_name":"שחור","sku_verient_id":"","sku_verient_name":"","sku_ppn_id":"1","sku_ppn_name":"דגמ\"ח אמרקאי ת.חוץ+גומי","sku_product_id":"20","sku_product_name":"דגמ\"ח אינדאני"},{"id":3,"quantity":4,"price":"23.000","created_at":"2022-03-16T12:34:24.965838+02:00","sku_id":"3","sku_size_id":"89","sku_size_name":"L","sku_color_id":"77","sku_color_name":"שחור","sku_verient_id":"","sku_verient_name":"","sku_ppn_id":"1","sku_ppn_name":"דגמ\"ח אמרקאי ת.חוץ+גומי","sku_product_id":"20","sku_product_name":"דגמ\"ח אינדאני"},{"id":4,"quantity":2,"price":"23.000","created_at":"2022-03-16T12:36:15.895973+02:00","sku_id":"4","sku_size_id":"90","sku_size_name":"XL","sku_color_id":"77","sku_color_name":"שחור","sku_verient_id":"","sku_verient_name":"","sku_ppn_id":"1","sku_ppn_name":"דגמ\"ח אמרקאי ת.חוץ+גומי","sku_product_id":"20","sku_product_name":"דגמ\"ח אינדאני"}]
            -->
            <div class="existing-entry">
                <DataTable
                    headers={[
                        { key: "id", value: "מזהה" },
                        { key: "sku_color_name", value: "צבע" },
                        { key: "sku_size_name", value: "גודל" },
                        { key: "sku_verient_name", value: "מודל" },
                        {key: 'quantity', value: 'כמות'},
                        {key: 'price', value: 'מחיר'},
                        { key: 'actions', value: 'פעולות' }
                    ]}
                    rows={existingEntries}>
                    
                    <svelte:fragment slot="cell" let:row let:cell>
                        {#if cell.key === "actions"}
                            <Button kind="danger" size="small" on:click={() => {
                                deleteEntry($editQuantityModalOpener.data.docId, row.sku_ppn_id, row.id, );
                            }}>מחק</Button>
                        {:else}
                            {cell.value}
                        {/if}

                    </svelte:fragment>
                </DataTable>

            </div>
        {:else}
            <Loading withOverlay={false} />
        {/if}
        
    </div>
{/if}
</Modal>

<style lang="scss">
    .seperator {
        margin-top: 20px;
        margin-bottom: 20px;
    }
    .main {
        .bx--row {
            flex-wrap: nowrap;
        }
        h4 {
            padding-bottom: 30px;
        }
    }
    .new-product-form {
        display:grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        flex-direction:row;
        .bx--form-item2 {
            flex:1;
        }
        
    }
    :global(.bx--modal-footer) {
            display:none;
        }
</style>