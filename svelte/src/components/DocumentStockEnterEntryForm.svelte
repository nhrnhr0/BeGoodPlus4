
<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import {Button} from "carbon-components-svelte";
    import { apiSearchPPN, apiSearchProducts } from "../api/api";
    export let providerValue; // passed from DocumentStockEnter.svelte
    let bill_name_user_selected; // bind to user input
    let ower_name_user_selected; // bind to user input
    let createNewFlag = false;
    let allow_ower_name_edit = false;
    function create_new_PPN(e) {
        console.log('bill_name_not_exist');
        console.log(e);
        bill_name_user_selected = e;
        createNewFlag = true;

    }

    function searchPPN(keyword) {
        let json = apiSearchPPN(keyword, providerValue);
        let data = json;
        console.log(data);
        return data;
    }

    function searchProducts(keyword) {
        let json = apiSearchProducts(keyword);
        let data = json;
        console.log(data);
        return data;
    }

    function clear_form() {
        bill_name_user_selected = undefined;
        createNewFlag = false;
        ower_name_user_selected = undefined;
    }

    $: {
        console.log('bill_name_user_selected: ', bill_name_user_selected);
        if (createNewFlag) {
            allow_ower_name_edit = true;
        }
        if(bill_name_user_selected == undefined) {
            allow_ower_name_edit = false;
        } else {
            allow_ower_name_edit = false;
            ower_name_user_selected = {'product_name': bill_name_user_selected.product_name};
        }
    }

</script>


<form class="new-product-form">
    <div class="fields-row">
        <div class="form-group">
            <label for="sku_product_name">שם בחשבונית</label>
            <AutoComplete onCreate={create_new_PPN}  bind:selectedItem={bill_name_user_selected} id="bill_name_search_input" loadingText="מחפש..." 
            createText="לא נמצאו תוצאות חיפוש" showLoadingIndicator=true noResultsText="צור חדש" create=true placeholder="שם בחשבונית" 
            className="autocomplete-cls" searchFunction={searchPPN} delay=200 localFiltering="{false}" labelFieldName="providerProductName"
            valueFieldName="providerProductName" >
                <div slot="item" let:item={item} let:label={label}>
                    <div class="search-item">
                        <div class="inner">
                            <div class="label">
                                {item.providerProductName} - 
                                <span>{item.product_name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </AutoComplete>
            
        </div>
        <div class="form-group">
            <label for="sku_product_name">שם אצלנו</label>
            <AutoComplete bind:selectedItem={ower_name_user_selected} disabled={!allow_ower_name_edit} id="ouer_name_search_input" loadingText="מחפש..."
                showLoadingIndicator={true} placeholder='שם אצלנו'
                className="autocomplete-cls" searchFunction={searchProducts} delay=200 localFiltering="{false}" labelFieldName="product_name"
                valueFieldName="product_name" >
                <div slot="item" let:item={item} let:label={label}>
                    <div class="search-item">
                        <div class="inner">
                            <div class="label">
                                {item.product_name}
                            </div>
                        </div>
                    </div>
                </div>
            </AutoComplete>
            <!--
            <TextInput bind:value={ouwr_name_value} labelText="שם אצלנו" placeholder="דגמח אינדאני" disabled={!allow_ower_name_edit} />
            {bill_name_user_input}-->
        </div>
        <div class="form-group">
            <!--<NumberInput label="מחיר קנייה" value={0} placeholder="23.000" disabled={allow_price_edit} />
            {JSON.stringify(bill_name_user_selected)}-->
        </div>
    </div>
    <div class="buttons-row">
        <Button disabled class="btn sub-btn">הוסף מוצר</Button>
        <Button class="btn clear-btn" kind="secondary" on:click={clear_form}>נקה</Button>
    </div>
</form>


<style lang="scss">
    .new-product-form {
        max-width: 850px;
        margin: auto;
        padding: 20px;
        .fields-row {
            background-color: var(--cds-ui-01);
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            
            .form-group {
                flex: 1;
                margin-right: 10px;
                //display: flex;
                //flex-direction: row;
                label {
                    display: block;
                    margin-bottom: 5px;

                }
                input {
                    width: 100%;
                }
            }
        }
        .buttons-row {
            margin-top: 40px;
            .btn {
                width: 100%;
                text-align: center;
                font-size: larger;
            }
            :global(.sub-btn) {
            }
        }
    }
</style>