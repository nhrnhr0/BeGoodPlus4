

<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import { apiSearchProviders ,apiLoadEnterDocData, apiSearchPPN, apiGetAllSizes, apiGetAllColors, apiGetAllVariants} from "./api/api";
    import { Grid, Row, Column,Theme, RadioButton, Form , FormGroup, Checkbox, RadioButtonGroup, Select, SelectItem, Button} from "carbon-components-svelte";
    import { Accordion, AccordionItem } from "carbon-components-svelte";
    import { TextInput,NumberInput } from "carbon-components-svelte";

import { onMount } from "svelte";
import { groupBy } from "./utils/utils";
import PivotTableComponent from "./components/PivotTableComponent.svelte";
import DocumentStockEnterEntryForm from "./components/DocumentStockEnterEntryForm.svelte";
import EditQuantityModal from "./components/EditQuantityModal.svelte";
import { editQuantityModalOpener } from "./stores/modalManager";
import { ALL_SIZES,ALL_COLORS,ALL_VARIENTS } from "./stores/globals";
    let theme = "white";
    export let id = undefined;
    let docData;
    let providerValue;
    let grouped_products = undefined;
    async function load_data_from_server() {
        let response = await apiLoadEnterDocData(id);
            docData = response;
            providerValue = response.provider_name;
            grouped_products = groupBy(docData.items, x => x.sku_ppn_name);
            console.log('docData = ', docData);
            console.log('grouped_products = ', grouped_products);
    }
    onMount(async()=> {
        console.log('id = ', id);
        let all_sizes_data = await apiGetAllSizes();
        let all_colors_data = await apiGetAllColors();
        let all_variants_data = await apiGetAllVariants();

        ALL_SIZES.set(all_sizes_data);
        ALL_COLORS.set(all_colors_data);
        ALL_VARIENTS.set(all_variants_data);
        console.log('ALL_SIZES = ', $ALL_SIZES);
        if(id){
            load_data_from_server()
        }
    });
    function searchProviders(keyword) {
        let json = apiSearchProviders(keyword);
        let data = json;
        
        console.log(data);
        return data;
    }


    function clear_form() {
        bill_name_user_selected = undefined;
    }
    let ouwr_name_value = "";
    $: {
        if (bill_name_user_selected){
            allow_ower_name_edit = true;
        }else {
            allow_ower_name_edit = true;
            ouwr_name_value = bill_name_user_selected.product_name;
        }
    }


    // ============================================================
    // ================= handle new product form ==================
    // ============================================================
    // bill_name_changed allow_search allow_ower_name_edit allow_price_edit
    let bill_name_user_selected = "";
    let allow_ower_name_edit = false;
    let allow_price_edit = false;
    let bill_name_user_input;
    
    
    /*function bill_name_changed(bill_name) {
        console.log('bill_name_changed = ', bill_name);
        if(bill_name){
            allow_ower_name_edit = true;
            allow_price_edit = true;
        }
        else{
            allow_ower_name_edit = false;
            allow_price_edit = false;
        }
    }*/

    function edit_quantity(data) {
        console.log(data);
        $editQuantityModalOpener.data = data;
        $editQuantityModalOpener.isOpen = true;
    }

</script>
<EditQuantityModal></EditQuantityModal>
<div class="document-stock-entery">
    <Theme bind:theme persist persistKey="__carbon-theme" />
    <RadioButtonGroup legendText="Carbon theme" bind:selected={theme}>
        {#each ["white", "g10", "g80", "g90", "g100"] as value}
            <RadioButton labelText={value} {value} />
        {/each}
    </RadioButtonGroup>
    {#if docData}
    <h1>מספר הכנסה למלאי {docData.id}</h1>
    <!--
        table:
        id
        provider
        date
        warehouse
    -->
        <table class="base-info table">
            <thead>
                <tr>
                    <th>מספר הכנסה</th>
                    <th>מספר חשבונית</th>
                    <th>ספק</th>
                    <th>תאריך</th>
                    <th>מחסן</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{docData.id}</td>
                    <td>{docData.docNumber}</td>
                    <td>{docData.provider_name}</td>
                    <td>{docData.created_at}</td>
                    <td>{docData.warehouse_name}</td>
                </tr>
            </tbody>
        </table>
        <table class="products-info table">
            <!--
                table:
                שם בחשבונית
                שם אצלנו
                מחיר אחרון
                מחיר קנייה נוכחית
                כמות כוללת
                פירוט צבעים מידות וריאנטים
            -->
            <thead>
                <tr>
                    <th>שם בחשבונית</th>
                    <th>שם אצלנו</th>
                    <th>מחיר אחרון</th>
                    <th>מחיר קנייה נוכחית</th>
                    <th>כמות כוללת</th>
                    <th>פירוט צבעים מידות וריאנטים</th>
                    <th>ערוך כמות</th>
                </tr>
            </thead>
            <tbody>
                {#each Array.from(grouped_products) as grou, i} 
                    <tr>
                        <td>{grou[0]}</td>
                        <td>{grou[1][0].sku_product_name}</td>
                        <td>{grou[1][0].price}</td>
                        <td>
                            <div contenteditable="true">{grou[1][0].price}</div>
                        </td>
                        <td>
                            {grou[1].reduce((acc, cur) => {
                                return acc + cur.quantity
                            }, 0)}
                        </td>
                        <td>
                            <PivotTableComponent
                                data={grou[1]}
                            />
                        </td>
                        <td>
                            <Button on:click={edit_quantity({'docId': docData.id, 'data':{'sku_ppn_id': grou[1][0].sku_ppn_id,'sku_ppn_name': grou[1][0].sku_ppn_name,'sku_product_id': grou[1][0].sku_product_id,'sku_product_name': grou[1][0].sku_product_name },})} >ערוך כמות</Button>
                        </td>
                    </tr>

                {/each}
            </tbody>
        </table>
        <DocumentStockEnterEntryForm
            providerValue={providerValue}>

        </DocumentStockEnterEntryForm>
    {/if}
</div>


<style lang="scss">
    .search-item {
        .inner {
            .label {
                span {
                    font-weight: bold;
                }
            }
        }
    }
    
    table.table {
        margin-top: 150px;
        width: 100%;
        font-size: larger;
        thead {
            tr {
                th {
                    text-align: center;
                    padding: 10px;
                    border-bottom: 1px solid #ccc;
                }
            }
        }
        tbody {
            tr {
                td {
                    text-align: center;
                    padding: 10px;
                    background-color: var(--cds-ui-03);
                }
            }
        }

    }
    /*
    .product-entery-form {
        max-width: 90%;;
        margin: auto;
        margin-top: 200px;
        padding: 30px;
        display: grid;
        grid-template-columns: 1fr 1fr;

        grid-gap: 20px;
        .entry-wraper {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            background: var(--cds-ui-03);
            .field-label {
            }
            .field-value {
            }
        }
    }*/

    

</style>