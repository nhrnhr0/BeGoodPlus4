


<script>
import { Form } from "carbon-components-svelte";
import { apiGetAllSizes } from "./api/api";

    export let product;
    
    export let ALL_SIZES;
    export let ALL_COLORS;
    export let ALL_VERIENTS;
    let sizes_ids_set = new Set();
    let colors_ids_set = new Set();
    let verients_ids_set = new Set();
    let sorted_sizes = [];
    let sorted_colors = [];
    let sorted_verients = [];
    let ALL_COLORS_DICT = undefined;
    let ALL_SIZES_DICT = undefined;
    $: {
        ALL_COLORS;
        if(ALL_COLORS) {
            let ALL_COLORS_DICT_temp = {};
            ALL_COLORS.forEach(color => {
                ALL_COLORS_DICT_temp[color.id] = color;
            });
            ALL_COLORS_DICT = ALL_COLORS_DICT_temp;
        }
    }
    $: {
        ALL_SIZES;
        if(ALL_SIZES) {
            let ALL_SIZES_DICT_temp = {};
            ALL_SIZES.forEach(size => {
                ALL_SIZES_DICT_temp[size.id] = size;
            });
            ALL_SIZES_DICT = ALL_SIZES_DICT_temp;
        }
    }

    $: {
        product.entries;
        let sizes_temp_set = new Set();
        let colors_temp_set = new Set();
        let verients_temp_set = new Set();
        // add product.colors to colors_ids_set
        for (let color_id of product.colors) {
            console.log('adding color_id:', color_id);
            colors_temp_set.add(color_id);
        }

        // add product.sizes to sizes_ids_set
        for (let size_id of product.sizes) {
            console.log('adding size_id:', size_id);
            sizes_temp_set.add(size_id);
        }

        // add product.varients to varients_ids_set
        for (let verient_id of product.verients) {
            console.log('adding verient_id:', verient_id);
            verients_temp_set.add(verient_id);
        }

        for (let entry of product.entries) {
            sizes_temp_set.add(entry.size);
            colors_temp_set.add(entry.color);
            verients_temp_set.add(entry.verient);
        }
        // order sizes_ids_set by code
        // sizes_ids_set: [1,2,7,3]
        // ALL_SIZES: [{id:1, code: '3'}, {id:2, code: '4'}, {id:7, code: '2'}, {id:3, code: '1'}]
        let ALL_SIZES_ordered = ALL_SIZES.sort((a, b) => {
            return a.code.localeCompare(b.code);
        });
        console.log('ALL_SIZES_ordered:', ALL_SIZES_ordered);
        console.log('sizes_ids_set:', sizes_ids_set);
        let sorted_sizes_temp = [];
        for (let size of ALL_SIZES_ordered) {
            if (sizes_temp_set.has(size.id)) {
                sorted_sizes_temp.push(size);
            }
        }
        sorted_sizes = [...sorted_sizes_temp.reverse()];
        console.log('sorted_sizes:', sorted_sizes);

        sorted_colors = [...colors_temp_set];
    }
    function input_amount_changed(e) {
        let el = e.target;
        let size_id = el.dataset.size;
        let color_id = el.dataset.color;
        let verient_id = el.dataset.verient;
        let quantity = el.value;
        console.log('input_amount_changed:', size_id, color_id, verient_id, quantity);
        let found = false;
        product.entries.forEach(entry => {
            if (entry.size == size_id && entry.color == color_id && entry.verient == verient_id) {
                entry.quantity = quantity;
                found = true;
            }
        });
        if (!found) {
            product.entries.push({
                id: null,
                size: size_id,
                color: color_id,
                varient: verient_id,
                quantity: quantity
            });
        }
    }

    function find_entry_quantity(size, color, verient) {
        for (let entry of product.entries) {
            if (entry.size == size && entry.color == color && entry.verient == verient) {
                return entry.quantity;
            }
        }
        return undefined;
    }
</script>
{#if ALL_COLORS_DICT && ALL_SIZES_DICT && product}
<table class="entries-table">
    <thead>
        <tr>
                <th class="sticky-col const-size-cell">צבע</th>
                {#if product.verients.length != 0}
                    <th class="const-size-cell">מודל</th>
                {/if}
                {#each sorted_sizes as size}
                    <th>
                        {size.size}
                    </th>
                {/each}
            
        </tr>
    </thead>
    <tbody>
        {#each sorted_colors as color, color_idx}
            <tr>
                <td class="sticky-col">
                <div class="color-box" ><div class="inner" style="background-color: {ALL_COLORS_DICT[color].color}"></div>{ALL_COLORS_DICT[color].name}</div>
                </td>
                {#if product.verients.length != 0}
                <td>
                    {#each product.verients as varient }
                    <div class="varient-box cls-cell">
                    {varient.name}
                    </div>
                    {/each}
                    
                </td>
                {/if}
                {#each product.sizes as size}
                <td class="size-cell">
                    
                    {#if product.verients.length == 0}
                        <div class="cell-wraper">
                        <input on:change="{input_amount_changed}" value={find_entry_quantity(size, color, null)} class="size-input cls-cell" style="border: 2px solid {ALL_COLORS_DICT[color].color}" data-color="{color}" data-size="{size}" data-ver={null} type="number" placeholder="{ALL_SIZES_DICT[size].size}"  min="0" max="9999" >
                        </div>
                    {:else}
                    
                        {#each product.verients as {id, name}, idx}
                        <div class="cell-wraper">
                        <input on:change="{input_amount_changed}" value={find_entry_quantity(size, color, id)} style="border: 2px solid {ALL_COLORS_DICT[color].color}" id="input_entery_{product.id}_{size}_{color}_{id}" data-color="{color}" data-size="{size}" data-ver={id} class="size-input cls-cell" type="number" placeholder="{ALL_SIZES_DICT[size].size} ({name})" min="0" max="9999" >
                        </div>
                        {/each}
                    
                    {/if}
                    
                </td>
                
                {/each}
                <td class="delete-cell-style">
                <button class="remove-button">
                    <svg xmlns="http://www.w3.org/2000/svg"   width="16px" height="16px" viewBox="0 0 32 36"><path fill="currentColor" d="M30.9 2.3h-8.6L21.6 1c-.3-.6-.9-1-1.5-1h-8.2c-.6 0-1.2.4-1.5.9l-.7 1.4H1.1C.5 2.3 0 2.8 0 3.4v2.2c0 .6.5 1.1 1.1 1.1h29.7c.6 0 1.1-.5 1.1-1.1V3.4c.1-.6-.4-1.1-1-1.1zM3.8 32.8A3.4 3.4 0 0 0 7.2 36h17.6c1.8 0 3.3-1.4 3.4-3.2L29.7 9H2.3l1.5 23.8z"/></svg>
                </button>
                </td>
            </tr>
            
        {/each}
    </tbody>
</table>
{/if}

<style lang="scss">
    table.entries-table {
        thead {
            tr {
                th {
                    text-align: center;
                }
            }
        }
        width: auto;
        margin: auto;
        border-collapse: collapse;
        border-spacing: 0;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 10px;
        input {
            font-weight: bold;
            font-size: 1em;
            text-align: center;
        }
    }
</style>