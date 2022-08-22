
<script>
import { Button, Loading } from "carbon-components-svelte";

import { onMount } from "svelte";
import { apiGetAllColors, apiGetAllSizes, apiGetAllVariants, apiGetMOrder, apiSaveMOrder } from "./api/api";
import { CLOUDINARY_BASE_URL } from "./consts/consts";
import MentriesServerTable from "./MentriesServerTable.svelte";


    export let id;
    let updateing = false;
    //let ALL_PROVIDERS;
    let headerData = undefined;
    let serverData = undefined;
    let data = undefined;
    let productsData;
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
        productsData = data.products;

        //groupedProducts = group the productsData by product field (ID: int)
        updateing = false;
    }

    let ALL_SIZES;
    let ALL_COLORS;
    let ALL_VERIENTS;
    let updateing_to_server = false;
    
    onMount(async ()=> {
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
</script>

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


    {#if productsData}
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
                {#each productsData as product}
                
                <tr>
                    <td><pre>{product.id}</pre></td>
                    <td>
                        <img src="{CLOUDINARY_BASE_URL}f_auto,w_auto/{product.product.cimage}" width="25" height="25" loading="lazy"/>
                        {product.product.title}
                    </td>

                    <td>{product.price}</td>
                    <td><input type="checkbox" bind:value={product.embroidery} /></td>
                    <td><input type="checkbox" bind:value={product.prining} /></td>
                    <td><input type="checkbox" bind:value={product.ergent} /></td>
                    <td><textarea bind:value={product.comment}/></td>
                    <td>{product.pbarcode || ''}</td>
                    <td>
                        <button>מחק</button>
                        <button>הוסף צבע/מידה/מודל</button>
                    </td>
                </tr>
                <tr class="details">
                    <td colspan="10" >
                        <MentriesServerTable product={product}
                        ALL_SIZES={ALL_SIZES}
                        ALL_COLORS={ALL_COLORS}
                        ALL_VERIENTS={ALL_VERIENTS}
                        />
                    </td>
                </tr>
                {/each}
        </table>
    {/if}

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