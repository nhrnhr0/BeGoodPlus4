

<script>
    import { Button, Modal } from "carbon-components-svelte";
    import { editQuantityModalOpener } from './../stores/modalManager';
    import {ALL_SIZES, ALL_COLORS, ALL_VARIENTS} from './../stores/globals';
    import { TextInput,NumberInput } from "carbon-components-svelte";
import { onMount } from "svelte";
    //let open = false;
    let amount = undefined;

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
            alert('i opened');
        }else {
            alert('i closed');
        }
    }
</script>

<!-- <Button on:click={() => (open = true)}>Create database</Button>-->

<Modal
  bind:open={$editQuantityModalOpener.isOpen}
  modalHeading="שנה כמויות"
  primaryButtonText="Confirm"
  secondaryButtonText="Cancel"
  on:click:button--secondary={closeEditQuantityModal}
  on:open
  on:close
  on:submit
>
{#if $editQuantityModalOpener.isOpen && $editQuantityModalOpener.data != undefined}
<!--כותרת: שם המוצר אצל הספק ואצלנו ומחיר אחרון-->
<div class="bx--grid">
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
        <!--
            form:
            select size from all sizes
            select color from all colors
            select variant from all variants

        -->
        <form class="new-product-form">
            <div class="bx--form-item2">
                <label for="size">גודל</label>
                <TextInput name="sizes" id="sizes-input" list="sizes_list"/>
                <datalist id="sizes_list">
                    {#each $ALL_SIZES as size}
                        <option id="clr-{size.id}" value="{size.size}"> </option>
                    {/each}
                </datalist>


            </div>
            <div class="bx--form-item2">
                <label for="color">צבע</label>
                <TextInput name="sizes" id="color-input" list="color_list"/>
                <datalist id="color_list">
                    {#each $ALL_COLORS as color}
                        <option id="clr-{color.id}" value="{color.name}"></option>
                    {/each}
                </datalist>
            </div>

            <div class="bx--form-item2">
                <label for="varients">מודל</label>
                <TextInput name="varients" id="varients-input" list="varients_list"/>
                <datalist id="varients_list">
                    {#each $ALL_VARIENTS as varient}
                        <option id="clr-{varient.id}" value="{varient.name}"></option>
                    {/each}
                </datalist>
            </div>

            <div class="bx--form-item2">
                <label for="amount">כמות</label>
                <NumberInput type="number" bind:value={amount} />
            </div>
            <div class="bx--form-item2">
                <Button >הוסף</Button>
            </div>
        </form>
        </div>

    <div class="existing-entries">

    </div>
{/if}
</Modal>

<style lang="scss">
    .seperator {
        margin-top: 20px;
        margin-bottom: 20px;
    }
    .bx--grid {
        .bx--row {
            flex-wrap: nowrap;
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
</style>