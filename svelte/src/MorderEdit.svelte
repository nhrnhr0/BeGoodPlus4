

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
        updateing = false;
    }
    
    onMount(async ()=> {
        await load_order_from_server();
        headersTable = new Tabulator("#headers-table", {
            data:headerData,
            autoColumns:true,
            layout:"fitDataStretch",
            textDirection:"rtl", 
            
        });

        productsTable = new Tabulator("#products-table", {
            data:productsData,
            //autoColumns:true,
            layout:"fitDataStretch",
            textDirection:"rtl",
            history:true,
            height:"100%",
            columnDefaults:{
                tooltip:true,
            },
            columns: [
                {title:'id', field:'id', visible:false},
                {title:'שם מוצר', field:'product_name', visible:true},
                {title:'מזהה מוצר', field:'product', visible:true},
                {title:'מחיר' , field:'price', visible:true, formatter:"money", formatterParams:{symbol:"₪", decimal:".", thousands:","},editor:true},
                {title:'רקמה?', field: 'embroidery', hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true},
                {title: 'הדפסה?', field: 'prining', hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true},
                {title: 'דחוף?', field: 'ergent', hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true},
                {title:"פירוט",tooltip:false, field:"entries", formatter:function(cell, formatterParams, onRendered){
                //create and style holder elements
                var holderEl = document.createElement("div");
                var tableEl = document.createElement("div");

                holderEl.style.boxSizing = "border-box";
                holderEl.style.padding = "10px 30px 10px 10px";
                holderEl.style.borderTop = "1px solid #333";
                holderEl.style.borderBotom = "1px solid #333";
                holderEl.style.background = "#ddd";

                tableEl.style.border = "1px solid #333";
                holderEl.appendChild(tableEl);
                cell.getElement().appendChild(holderEl);
                //console.log(JSON.stringify(cell));
                let data = cell.getData().entries;
                console.log(data);
                //define the table once the cell has been rendered
                onRendered(function(){
                    
                    createPivot(data, tableEl);
                    
                });

                //return the element that holds the table
                return holderEl;
                }
            },
            ]
        });
        //create a custom formatter for the sub table
        
        /*productsTable = new Tabulator("#products-table", {
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
            }
        });*/
        console.log('data:', data);
    });


    function createPivot(data,tableEl) {
        var sum = window.$.pivotUtilities.aggregatorTemplates.sum;
        var numberFormat = window.$.pivotUtilities.numberFormat;
        var intFormat = numberFormat({digitsAfterDecimal: 0});
        let pvt = window.$(tableEl).pivot(
        data, {
            rows: ["color_name", "varient_name"],
            cols: ["size_name"],
            aggregator: sum(intFormat)(["quantity"]),
            rendererOptions: {
            table: {
                clickCallback: function (e, value, filters, pivotData) {
                    let size_name = filters['size_name'];
                    let color_name = filters['color_name'];
                    let varient_name = filters['varient_name'];
                    for(let i = 0; i< data.length; i++) {
                        if (data[i].size_name == size_name &&
                            data[i].color_name == color_name &&
                            data[i].varient_name == varient_name) {
                            console.log(data[i]);   
                            data[i].quantity = value+1;
                            createPivot(data, tableEl);
                            break;
                    }
                    
                    console.log('filters: ',filters);
                }
                }
            }
        }})
    }
</script>

<main>
    <div id="headers-table">
        
    </div>
    <hr>
    <div id="products-table"></div>
    {#if updateing}
        <Loading withOverlay={false} />
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
