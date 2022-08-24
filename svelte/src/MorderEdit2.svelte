
<script>
import { Button, Loading } from "carbon-components-svelte";

import { onMount } from "svelte";
import { apiAddNewProductToMorder, apiDeleteMOrderItem, apiGetAllColors, apiGetAllSizes, apiGetAllVariants, apiGetMOrder, apiSaveMOrder, apiSearchProducts } from "./api/api";
import { CLOUDINARY_BASE_URL } from "./consts/consts";
import MentriesServerTable from "./MentriesServerTable.svelte";
import AutoComplete from "simple-svelte-autocomplete";

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
</script>
<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css">
</svelte:head>
<!-- headerData table -->
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
                    <td>מזהה</td>
                    <td>שם</td>
                    <td>דואר אלקטרוני</td>
                    <td>הודעה</td>
                    <td>טלפון</td>
                    <td>סטטוס</td>
                    <td>שם לקוח</td>
                    <td>סוכן</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{headerData[0].id}</td>
                    <td>{headerData[0].name}</td>
                    <td>{headerData[0].email}</td>
                    <td><textarea bind:value="{headerData[0].message}"/> </td>
                    <td>{headerData[0].phone}</td>
                    <td>{headerData[0].status}</td>
                    <td>{headerData[0].client_name}</td>
                    <td>{headerData[0].agent}</td>
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
                    <td>מזהה</td>
                    <td>שם מוצר</td>
                    <td>מחיר</td>
                    <td>רקמה?</td>
                    <td>הדפסה?</td>
                    <td>חשוב להזמנה</td>
                    <td>הערות</td>
                    <td>ברקוד</td>
                </tr>
            </thead>
            <tbody>
                {#each data.products as product}
                
                <tr>
                    <td><pre>{product.id}</pre></td>
                    <td>
                        <img src="{CLOUDINARY_BASE_URL}f_auto,w_auto/{product.product.cimage}" width="25px" height="25px" loading="lazy"/>
                        {product.product.title}
                    </td>

                    <td>{product.price}</td>
                    <td>
                        <input type="checkbox" bind:value={product.embroidery} />
                        {#if product.embroidery}
                            <textarea bind:value="{product.embroideryComment}" />
                        {/if}
                    </td>
                    <td>
                        <input type="checkbox" bind:value={product.prining} />
                        {#if product.printing}
                            <textarea bind:value="{product.priningComment}" />
                        {/if}
                    </td>
                    <td><input type="checkbox" bind:value={product.ergent} /></td>
                    <td><textarea bind:value={product.comment}/></td>
                    <td>{product.pbarcode || ''}</td>
                    <td>
                        <button class="btn btn-danger" on:click="{()=> {
                                if (confirm('בטוח שברצונך למחוק את המוצר?')) {
                                    // Save it!
                                    apiDeleteMOrderItem(product.id);
                                    data.products = [...data.products.filter(item=>item.id!=product.id)];
                                } else {
                                    
                                }
                                
                        }}">מחק</button>
                        {#if product.product.show_sizes_popup}
                            <button 
                            >הוסף צבע/מידה/מודל</button>
                        {/if}
                    </td>
                </tr>
                <tr class="details">
                    <td colspan="10" >
                        {#key product.id}
                            <MentriesServerTable bind:product={product}
                            ALL_SIZES={ALL_SIZES}
                            ALL_COLORS={ALL_COLORS}
                            ALL_VERIENTS={ALL_VERIENTS}
                            />
                        {/key}
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
            
        }
    }

    table.product-table { 
        width: 100%;
        font-size: 18px;
        margin: 20px auto;
        border-collapse: collapse;
        border: 1px solid #ddd;
        thead {
            background-color: #f1f1f1;
            
        }
        tbody{
            tr {
                td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
            }
            tr.details {
                td {
                    margin:20px;
                }
                background-color: #6b656586;
            }
            
        }
    }
</style>