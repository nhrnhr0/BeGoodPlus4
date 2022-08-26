
<script>
import { Button, Loading } from "carbon-components-svelte";

import { onMount } from "svelte";
import { apiAddNewProductToMorder, apiDeleteMOrderItem, apiGetAllColors, apiGetAllSizes, apiGetAllVariants, apiGetMOrder, apiSaveMOrder, apiSearchProducts } from "./api/api";
import { CLOUDINARY_BASE_URL } from "./consts/consts";
import MentriesServerTable from "./MentriesServerTable.svelte";
import AutoComplete from "simple-svelte-autocomplete";
import MorderAddProductEntryPopup from "./components/popups/MorderAddProductEntryPopup.svelte";
import { morderAddProductEntryPopupStore } from "./components/popups/MorderAddProductEntryPopupStore";

    export let id;
    let updateing = false;
    //let ALL_PROVIDERS;
    let headerData = undefined;
    let serverData = undefined;
    let data = undefined;
    let selectedProduct = undefined;
    //let productsData;
    async function load_order_from_server() {
        updateing = true;
        let resp = await apiGetMOrder(id);
        console.log('resp:', resp);
        data = serverData = JSON.parse(JSON.stringify(resp));
        headerData = [{
            'created': data.created,
            'updated': data.updated,
            'id': data.id,
            'name': data.name,
            'email': data.email,
            'message': data.message,
            'phone': data.phone,
            'status': data.status,
            'client_id': data.client,
            'client_name': data.client_businessName,
            'agent': data.agent_name,
        }]
        //productsData = data.products;

        //groupedProducts = group the productsData by product field (ID: int)
        updateing = false;
    }

    let ALL_SIZES;
    let ALL_COLORS;
    let ALL_VERIENTS;
    let updateing_to_server = false;
    
    onMount(async ()=> {
        let defult_size = {
            id: null,
            size: "one size",
            code: "cc"
        }
        let defult_color = {
            id:null,
            name: "no color",
            color: "#FFFFFF00",
            code: "00"
        }
        ALL_SIZES = await apiGetAllSizes();
        ALL_COLORS = await apiGetAllColors();
        ALL_VERIENTS = await apiGetAllVariants();
        await load_order_from_server();
        //ALL_PROVIDERS = await apiGetProviders();
    });

    async function save_data() {
        // move headerData to data
        data.created = headerData[0].created;
        data.updated = headerData[0].updated;
        data.id = headerData[0].id;
        data.name = headerData[0].name;
        data.email = headerData[0].email;
        data.message = headerData[0].message;
        data.phone = headerData[0].phone;
        data.status = headerData[0].status;
        data.client = headerData[0].client_id;
        data.client_businessName = headerData[0].client_name;
        console.log('save data: ', data);
        updateing_to_server = true;
        await apiSaveMOrder(data.id, data);
        updateing_to_server = false;
        alert('saved');
    }

    async function searchProducts(keyword) {
        let json = await apiSearchProducts(keyword, true);
        let data = json;
        return data.all
    }
    
    // function autocompleteItemSelected(val) {
    //     console.log('autocompleteItemSelected: ' , val);
    //     selectedProduct = val;
    // }


    let add_product_message = '';
    let add_product_status = 'unset';
    let add_product_status_color = 'black';
    function addNewProductButtonClick(e) {
        
        e.preventDefault();
        add_product_message = '';
        add_product_status = 'sending';
        add_product_status_color = 'black';
        let sendData = {};
        console.log('looking for ', selectedProduct.id, ' in ', data.products);
        if(data.products.find(product=> product.product.id == selectedProduct.id)){
            add_product_message = 'מוצר כבר נמצא בהזמנה'
            add_product_status = 'error';
            add_product_status_color = 'red';
            return;
        }
        sendData['order_id'] = data.id;
        sendData['product_id'] = selectedProduct.id;
        console.log('data: ', sendData);
        apiAddNewProductToMorder(sendData).then((newEntry)=> {
            //e.target.reset();

            data.products.push(newEntry.data);
            data.products = [...data.products];
            selectedProduct = undefined;
            add_product_status = 'unset';
        }).catch(err=>{
            console.log(err);
            add_product_status = 'unset';
        });
        
        //productAmountEditModel.hide();
    }


    function add_entry_btn_clicked(e) {
        e.preventDefault();
        let form = e.target;
        let formData = new FormData(form);
        let formDictData = {};
        formData.forEach((value, key) => {
            formDictData[key] = value;
        });

        
        // let product = data.products.find(product=> product.id == formDictData['entry_id']);
        // if(product) {
            if(formDictData['color'] == 'undefined') {
                alert('יש לבחור צבע');
                return;
            }else if(formDictData['size'] == 'undefined') {
                alert('יש לבחור מידה');
                return;
            }
            let selected_color = parseInt(formDictData['color']);
            let selected_size = parseInt(formDictData['size']);
            let selected_verient = (formDictData['varient'] == 'undefined' || formDictData['varient'] == '')? null: parseInt(formDictData['varient']);
            let amount = parseInt(formDictData['amount'] == 'undefined' || formDictData['amount'] == ''?'0': formDictData['amount'])


            for(let i = 0; i < data.products.length; i++) {
                if(data.products[i].id == formDictData['entry_id']){ 
                    if(selected_verient == null && product.verients.length != 0) {
                        alert('יש לבחור מודל');
                        return;
                    }
                    let found = false;
                    for(let j = 0; j < data.products[i].entries.length; j++) {
                        if(data.products[i].entries[j].color == selected_color &&
                            data.products[i].entries[j].size == selected_size &&
                            data.products[i].entries[j].varient == selected_verient) {
                                found = true;
                                data.products[i].entries[j].quantity = amount;
                        }
                    }
                    if(!found) {
                        data.products[i].entries.push({
                            id:null,
                            size: selected_size,
                            color: selected_color,
                            varient: selected_verient,
                            quantity: amount
                        });
                    }
                    data.products[i].entries = [...data.products[i].entries];
                    break;
                }
            }
        }

    //         let entry = product.entries.find(entry=> entry.color == selected_color && entry.size == selected_size && entry.varient == selected_verient);
    //         if(entry) {
    //             entry.quantity = amount;
    //             console.log('entry found, update quantity');
    //         }else {
    //             product.entries.push({
    //                 id:null,
    //                 size: selected_size,
    //                 color: selected_color,
    //                 varient: selected_verient,
    //                 quantity: amount
    //             });
    //             console.log('entry not found, creating new');
    //         }
            
    //         console.log(product.entries);
    //     }else {
    //         alert('מוצר לא נמצא');
    //     }
    // }
    const STATUS_OPTIONS = [
        ['new','חדש'], ['in_progress','סחורה הוזמנה'], ['in_progress2','מוכן לליקוט',], ['in_progress3','ארוז מוכן למשלוח'],['in_progress4','בהדפסה',],['done','סופק']]
</script>
<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css">
</svelte:head>
<!-- headerData table -->
<MorderAddProductEntryPopup 
    ALL_COLORS={ALL_COLORS}
    ALL_SIZES={ALL_SIZES}
    ALL_VERIENTS={ALL_VERIENTS}
/>
<main>
    {#if headerData}
    <div class="created">
        נוצר ב{new Date(headerData[0].created).toLocaleString('Israel')}
    </div>
    <div class="updated">
        עודכן ב{new Date(headerData[0].updated).toLocaleString('Israel')}
    </div>
        <table class="headers-table">
            <thead>
                <tr>
                    <th>מזהה</th>
                    <th>שם</th>
                    <th>דואר אלקטרוני</th>
                    <th>הודעה</th>
                    <th>טלפון</th>
                    <th>סטטוס</th>
                    <th>שם לקוח</th>
                    <th>סוכן</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="header-cell">{headerData[0].id}</td>
                    <td class="header-cell">{headerData[0].name}</td>
                    <td class="header-cell">{headerData[0].email}</td>
                    <td class="header-cell"><textarea bind:value="{headerData[0].message}" placeholder="הודעה"/> </td>
                    <td class="header-cell">{headerData[0].phone}</td>
                    <td class="header-cell">
                        <select bind:value="{headerData[0].status}">
                            {#each STATUS_OPTIONS as opt}
                                <option value="{opt[0]}" selected={opt[0] == headerData[0].status} >{opt[1]}</option>
                            {/each}
                        </select>
                    </td>
                    <td class="header-cell">{headerData[0].client_name}</td>
                    <td class="header-cell">{headerData[0].agent}</td>
                </tr>
            </tbody>
        </table>
    {/if}


    {#if data?.products}
    <!-- title:'id',
    title:'שם מוצר
    title:'מחיר'
    title:'רקמה?',
    title: 'הדפסה?',
    title:"פירוט",
    title:'הערות',
    title: 'ברקוד' -->
        <table class="product-table">
            <thead>
                <tr>
                    <th>מזהה</th>
                    <th>שם מוצר</th>
                    <th>מחיר</th>
                    <th>רקמה?</th>
                    <th>הדפסה?</th>
                    <th>חשוב להזמנה</th>
                    <th>הערות</th>
                    <th>ברקוד</th>
                    <th colspan="2">פעולות</th>
                </tr>
            </thead>
            <tbody>
                {#each data.products as product}
                
                <tr>
                    <td class="cell-border">{product.product.id}</td>
                    <td class="cell-border">
                        <img src="{CLOUDINARY_BASE_URL}f_auto,w_auto/{product.product.cimage}" alt="{product.product.title}" width="25px" height="25px" loading="lazy"/>
                        {product.product.title}
                    </td>

                    <td class="cell-border" on:click="{()=>{
                        let new_price = prompt('מחיר חדש:' , product.price);
                        product.price = new_price;
                    }}">{product.price}₪</td>
                    <td class="cell-border">
                        <div class="d-flex-wraper">
                            <input type="checkbox" bind:checked={product.embroidery} />
                            {#if product.embroidery}
                                <textarea bind:value="{product.embroideryComment}" placeholder="תיאור רקמה" />
                            {/if}
                        </div>
                    </td>
                    <td class="cell-border">
                        <div class="d-flex-wraper">
                            <input type="checkbox" bind:checked={product.prining} />
                            {#if product.prining}
                                <textarea bind:value="{product.priningComment}" placeholder="תיאור הדפסה" />
                            {/if}
                        </div>
                    </td>
                    <td class="cell-border">
                        <div class="d-flex-wraper">
                            <input type="checkbox" bind:value={product.ergent} />
                        </div>
                    </td>

                    <td class="cell-border"><textarea bind:value={product.comment} placeholder="הערות" /></td>
                    <td class="cell-border">{product.pbarcode || ''}</td>
                    <td class="cell-border" colspan="2">
                        <button class="btn btn-danger" on:click="{()=> {
                                if (confirm('בטוח שברצונך למחוק את המוצר?')) {
                                    // Save it!
                                    apiDeleteMOrderItem(product.id);
                                    data.products = [...data.products.filter(item=>item.id!=product.id)];
                                } else {
                                    
                                }
                                
                        }}">מחק</button>
                    </td>
                </tr>
                <tr class="details">
                    <td colspan="9" >
                        {#key product.id}
                            <MentriesServerTable bind:product={product}
                            ALL_SIZES={ALL_SIZES}
                            ALL_COLORS={ALL_COLORS}
                            ALL_VERIENTS={ALL_VERIENTS}
                            />
                        {/key}
                    </td>
                    <td colspan="1">
                        <form class="add-entry-form" action="" method="post" on:submit="{add_entry_btn_clicked}">
                            <input type="hidden" name="product_id" value={product.product.id} />
                            <input type="hidden" name="entry_id" value={product.id} />
                            <div class="form-group">
                            <!-- <label for="color">צבע</label> -->
                            <select class="form-control" name="color" id="color" >
                                <option default value=undefined>בחר צבע</option>
                                {#each ALL_COLORS as color}
                                <option value={color['id']}>{color['name']}</option>
                                {/each}
                            </select>

                            <!-- <label for="size">מידה</label> -->
                                <select class="form-control" name="size" id="size" >
                                    <option default value=undefined>בחר מידה</option>
                                    {#each ALL_SIZES.sort((a, b) => {
                                        return a.code.localeCompare(b.code);
                                    }) as size}
                                    <option value={size['id']}>{size['size']}</option>
                                    {/each}
                                </select>
                            <!-- <label for="varient">מודל</label> -->
                            {#if product.verients.length != 0}
                                <select class="form-control" name="varient" id="varient" >
                                    <option default value=undefined>בחר מודל</option>
                                    {#each ALL_VERIENTS as varient}
                                    <option value={varient['id']}>{varient['name']}</option>
                                    {/each}
                                </select>
                            {/if}
                            
                            <!-- <label for="amount">כמות</label> -->
                            <input class="form-control" type="number" placeholder="כמות" name="amount" id="amount" />
                        </div>
                    <div class="error-msg"></div>
                    <button type="submit" class="btn btn-primary">הוסף</button>
                </form>
                    </td>
                </tr>
                {/each}
        </table>
    {/if}
    <div id="new-product-form">
        <h3>הוסף מוצר</h3>
        <!-- <form method="post" on:submit="{addNewProductFormSubmit}"> -->
            <div class="form-group">
                <label for="product_name">שם מוצר</label>
                <div class="search-wraper">
                    <AutoComplete id="search_input" on:focus loadingText="מחפש מוצרים..." bind:selectedItem={selectedProduct} createText="לא נמצאו תוצאות חיפוש" showLoadingIndicator=true noResultsText="" create=true placeholder="חיפוש..." className="autocomplete-cls" searchFunction={searchProducts} delay=200 localFiltering="{false}" labelFieldName="title" valueFieldName="value">
                        <div slot="item" let:item={item} let:label={label}>
                            <div class="search-item">
                                <div class="inner">
                                    <img alt="{item.title}" style="height:25px;" src="{CLOUDINARY_BASE_URL}f_auto,w_auto/{item.cimage}" />
                                    {@html label}
                                </div>
                            </div>
                        </div>
                    </AutoComplete>
                {#if selectedProduct}
                    <div class="selected-product">
                        <div class="inner">
                            <img alt="{selectedProduct?.title}" style="height:25px;" src="{CLOUDINARY_BASE_URL}f_auto,w_auto/{selectedProduct?.cimage}" />
                            {@html selectedProduct?.title}
                        </div>
                    </div>
                
                    <button disabled={add_product_status== 'sending'} on:click="{addNewProductButtonClick}" class="btn btn-secondary" >
                        {#if add_product_status == 'sending'}
                            <div class="spinner-border" role="status">
                                <span class="sr-only"></span>
                            </div>
                        {:else}
                            הוסף
                        {/if}
                    </button>
                    <div style="color: {add_product_status_color}"><pre>{add_product_message}</pre></div>
                {:else}
                    <button disabled>הוסף</button>
                {/if}
                </div>
            </div>
        <!-- </form> -->
    </div>

    <Button class="update-btn" disabled={updateing_to_server} on:click={()=>{save_data()}}>
        {#if updateing_to_server}
            <Loading withOverlay={false} />
        {:else}
            עדכן עכשיו
        {/if}
    </Button>
</main>
<style lang="scss">
    form.add-entry-form {
        .form-group {
            padding:5px
        }
    }
    main {
        width: 90%;
        
        margin: auto;
        margin-top: 50px;
        //border:1px solid red;
        .created {
        margin-right: 50px;
            font-size: 12px;
            color: #999;
            margin-bottom: 10px;
            margin-top: 10px;
        }
        .updated {
            margin-right: 50px;
            font-size: 12px;
            color: #999;
            margin-bottom: 10px;
            margin-top: 10px;
        }
    }
    table.headers-table { 
        width: 100%;
        font-size: 18px;
        margin: 20px auto;
        border-collapse: collapse;
        border: 1px solid #ddd;
        thead {
            background-color: #f1f1f1;
            tr{
                th {
                    border:1px solid black;
                }
            }
        }
        tbody {
            tr {
                td.header-cell {
                    border:1px solid black!important;;
                    padding:2px;
                }
            }
        }
    }

    table.product-table { 
        width: 100%;
        font-size: 18px;
        margin: 20px auto;
        border-collapse: collapse;
        thead {
            background-color: #f1f1f1;
            tr{
                th {
                    border:1px solid rgb(128, 124, 124);
                    padding:10px;
                }
            }
        }
        .cell-border {
            border:1px solid black;
            padding-left: 2px;
            padding-right: 2px;
            .d-flex-wraper {
                display: flex;
                justify-content: start;
                align-items: center;
            }
        }
        tr.details {
            td {
                margin:20px;
            }
            background-color: #a7a7a786;
        }
    }
</style>