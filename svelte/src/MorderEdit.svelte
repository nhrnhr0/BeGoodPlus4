

<script>
import { onMount } from "svelte";
import { Loading } from "carbon-components-svelte";
import { apiGetMOrder } from "./api/api";
import {TabulatorFull as Tabulator} from 'tabulator-tables';

    let updateing = false;
    let headersTable;
    let productsTable;
    let data;
    let headerData;
    let productsData;
    let groupedProducts;
    //Tabulator.registerModule([FormatModule, EditModule]);

    export let id;
    async function load_order_from_server() {
        updateing = true;
        let resp = await apiGetMOrder(id);
        console.log('resp:', resp);
        data = JSON.parse(JSON.stringify(resp));
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
        }]
        productsData = data.products;

        //groupedProducts = group the productsData by product field (ID: int)
        let groupedProductsTemp = productsData.reduce(function(r, a) {
            r[a.product] = r[a.product] || [];
            r[a.product].push(a);
            return r;
        }, Object.create(null));
        groupedProducts = Object.keys(groupedProductsTemp).map(function(key) {
            let ret;
            let value = groupedProductsTemp[key];
            console.log('value:', value);
            ret = {
                'id': key,
                'name': value[0].product_name,
                'entries': value,
            }
            return ret;

        });
        
        updateing = false;
        console.log('groupedProducts:', groupedProducts);
    }
    
    onMount(async ()=> {
        await load_order_from_server();
        headersTable = new Tabulator("#headers-table", {
            data:headerData,
            autoColumns:true,
            layout:"fitDataStretch",
            textDirection:"rtl", 
            
        });
        //create a custom formatter for the sub table
        
        productsTable = new Tabulator("#products-table", {
            data:groupedProducts,
            layout:"fitDataStretch",
            height: 1000,
            columns:[
                {field: "id" , title: "product id", width:150},
                {field: "name" , title: "product name", width:150},
            ],
            rowFormatter:function(row){
                 //create and style holder elements
                var holderEl = window.$("<div></div>").get(0);
                var tableEl = window.$("<div></div>").get(0);

                
                holderEl.style.boxSizing = "border-box";
                holderEl.style.padding = "10px 30px 10px 10px";
                holderEl.style.borderTop = "1px solid #333";
                holderEl.style.borderBotom = "1px solid #333";
                

                tableEl.style.border = "1px solid #333";

                /*holderEl.css({
                    "box-sizing":"border-box",
                    "padding":"10px 30px 10px 10px",
                    "border-top":"1px solid #333",
                    "border-bottom":"1px solid #333",
                    "background":"#ddd",
                })

                tableEl.css({
                    "border":"1px solid #333",
                })*/

                holderEl.append(tableEl);

                row.getElement().append(holderEl);
                var sum = window.$.pivotUtilities.aggregatorTemplates.sum;
                var numberFormat = window.$.pivotUtilities.numberFormat;
                var intFormat = numberFormat({digitsAfterDecimal: 0});
                window.$(tableEl).pivot(
                    row.getData().entries, {
                        rows: ["color_name", "varient_name"],
                        cols: ["size_name"],
                        aggregator: sum(intFormat)(["quantity"]),
                    }
                )
                /*let subtable = new Tabulator(tableEl, {
                    data:row.getData().entries,
                    layout:"fitDataStretch",
                    height: 300,
                    autoColumns:true,
                });*/
                //return tableEl.outerHTML;
            }
        });
        console.log('data:', data);
    });
</script>

<main>
    <div id="headers-table">
        
    </div>
    <hr>
    <div id="products-table"></div>
    {#if updateing}
        <Loading />
    {:else}
    {/if}
</main>

<style lang="scss">
    main {
        padding-top: 35px;
        width: 90%;
        margin: auto;
    }
</style>
