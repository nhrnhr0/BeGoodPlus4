

<script>
import { onMount } from "svelte";
import { Loading } from "carbon-components-svelte";
import { apiGetMOrder,apiGetProviders,apiSaveMOrder } from "./api/api";
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import {Button} from "carbon-components-svelte";
import { MultiSelect } from "carbon-components-svelte";

    let updateing = false;
    let updateing_to_server = false;
    let headersTable;
    let productsTable;
    let data;
    let serverData;
    let headerData;
    let productsData;
    let groupedProducts;
    let showUpdateButton = false;
    //Tabulator.registerModule([FormatModule, EditModule]);
    function productCellEdited(cell) {
        /*
        console.log('edited: ', cell);
        debugger;
        let newRowData = cell.getData()
        apiUpdateMOrderProductRow(newRowData);
        */
    }
    export let id;
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
        }]
        productsData = data.products;

        //groupedProducts = group the productsData by product field (ID: int)
        updateing = false;
    }


    /*let multiSelectProviderEditor = function(cell, onRendered, success, cancel, editorParams) {
        let editor = document.createElement("ul");
        editor.classList.add("editor-list");
        let values = cell.getValue()//
        if (values != undefined) {
            values = values.split(",");
        }else {
            values = [];
        }
        const providers = [
            {id:1, name: 'זיווה מדים'},
            {id:2, name: 'צול'},
            {id:3, name: 'חנוכה'},
            {id:4, name: 'חנוכה מקומית'},
            {id:5, name: 'חנוכה מקומית מסחרית'},
            {id:6, name: 'חנוכה מקומית מסחרית מקומית'},
            {id:7, name: 'חנוכה מקומית מסחרית מקומית מקומית'},

        ]
        providers.forEach(provider => {
            let item = document.createElement("li");
            item.classList.add("editor-item");
            item.innerHTML = provider.name;
            item.setAttribute('data-id', provider.id);
            item.setAttribute('data-name', provider.name);
            item.addEventListener("click", function() {
                console.log('click: ', this);
                let value = this.getAttribute('data-name');
                let index = values.indexOf(value);
                if (index === -1) {
                    values.push(value);
                } else {
                    values.splice(index, 1);
                }
                //cell.setValue(values.join(","));
                //successFunc();
            });
            editor.appendChild(item);
        });
        onRendered(function() {
            editor.focus();
            editor.style.css = "100%";
        });
        function successFunc() {
            success(values.join(","));
        }
        editor.addEventListener("change", successFunc);
        editor.addEventListener("blur", successFunc);
        return editor;
    }*/

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
    
    function multiSelectProviderFormatter(cell, formatterParams, onRendered) {
        let value = cell.getValue();
        let values
        if(value != undefined) {
            // if is array do nothing
            // if string, split by comma
            if(typeof value == 'string') {
                values = value.split(",");
            } else {
                values = value;
            }
        }else {
            values = [];
        }
        let html = "<select class=\"\"  data-placeholder='סמן ספקים' multiple=\"multiple\">";
        ALL_PROVIDERS.forEach(provider => {
            /* values = 
                0: {value: '32', label: 'אחים אשכנזי'}
                1: {value: '33', label: "אורית אוביץ'"}
                2: {value: '34', label: 'קשת'}
                3: {value: '35', label: 'ארטוס'}
                4: {value: '36', label: 'צעצועי מיכל'}
                5: {value: '37', label: 'טכנו י.ש'}
                6: {value: '38', label: 'קראוס'}
                7: {value: '39', label: 'רוי'}
                8: {value: '41', label: 'סיינט'}
            */
            // provider = {value: '32', label: 'אחים אשכנזי'}
            let selected = values.find(v => v == provider.value) != undefined? "selected" : "";
            //let selected = values.indexOf(parseInt(provider.value)) > -1 ? "selected" : "";
            html += `<option value="${provider.value}" ${selected}>${provider.label}</option>`;
        });
        html += "</select>";
        let $el = window.$(html)//.get(0);
        //window.multiSelect.refresh();
        onRendered(function() {
                
            $el.select2({
                placeholder: 'This is my placeholder',
                allowClear: true,
                dropdownAutoWidth: true,
                width: '100%',
                closeOnSelect: true,
            });
            $el.on('change', function (e) {
                console.log('change: ', e);
                let value = $el.val();
                console.log('value: ', value);
                console.log('cell value before: ', cell.getValue());
                cell.setValue(value);
            });
            //el.select2('open');
            //window.multiSelect.refresh();
        });
        //window.$(el).chosen({})
        return $el.get(0);
    }
    let ALL_PROVIDERS;
    onMount(async ()=> {
        await load_order_from_server();
        ALL_PROVIDERS = await apiGetProviders();
        console.log('ALL_PROVIDERS:', ALL_PROVIDERS);
        headersTable = new Tabulator("#headers-table", {
            data:headerData,
            //autoColumns:true,
            layout:"fitDataStretch",
            textDirection:"rtl", 
            columns: [
                {title:'תאריך יצירה', field:'created'},
                {title:'תאריך שינוי', field:'updated'},
                {title:'id', field:'id'},
                {title:'שם', field:'name'},
                {title:'אימייל', field:'email'},
                {title:'הודעה', field:'message',editor:true},
                {title: 'טפלון', field: 'phone'},
                {title: 'סטטוס', field: 'status', editor:"select", editorParams:{values:['new', 'done'],multiselect:false}},
                {title: 'שם לקוח', field: 'client_name'},
            ]
        });

        productsTable = new Tabulator("#products-table", {
            data:productsData,
            //autoColumns:true,
            layout:"fitDataStretch",
            textDirection:"rtl",
            history:true,
            height:"100%",
            historyUndo:true,
            columnDefaults:{
                tooltip:true,
            },
            columns: [
                {title:'id', field:'id', visible:false},
                {title:'שם מוצר', field:'product_name', visible:true},
                {title:'מזהה מוצר', field:'product', visible:true},
                {title:'מחיר' , field:'price', visible:true, formatter:"money", formatterParams:{symbol:"₪", decimal:".", thousands:","},editor:true},
                {title:'רקמה?', field: 'embroidery', hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true, cellEdited:function(cell){productCellEdited(cell)}},
                {title: 'הדפסה?', field: 'prining', hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true, cellEdited:function(cell){productCellEdited(cell)}},
                {title: 'דחוף?', field: 'ergent', hozAlign:"center", formatter:"tickCross", sorter:"boolean", editor:true, cellEdited:function(cell){productCellEdited(cell)}},
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
                {title:'הערות', field:'comment', visible:true, editor:"textarea"},
                {title:'ספקים', field:'providers', visible:true, formatter:multiSelectProviderFormatter},
                ]
            });
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
                            let newQuantity = prompt("הזן כמות", data[i].quantity);
                            //let text;
                            if (newQuantity == null || newQuantity == "") {
                                //text = "User cancelled the prompt.";
                            } else {
                                //text = "Hello " + person + "! How are you today?";
                                data[i].quantity = parseInt(newQuantity);

                                createPivot(data, tableEl);
                            }
                            
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
    {#if updateing}
        <Loading withOverlay={false} />
    {:else}
        <div id="headers-table"></div>
        <hr>
        <div id="products-table"></div>
            <Button class="update-btn" disabled={updateing_to_server} on:click={()=>{save_data()}}>
                {#if updateing_to_server}
                    <Loading withOverlay={false} />
                {:else}
                    עדכן עכשיו
                {/if}
            </Button>
    {/if}
</main>

<style lang="scss">
    :global(.update-btn) {
        position: fixed;
        bottom: 10px;
        left: 10px;
        z-index: 1;

    }
    main {
        padding-top: 35px;
        width: 90%;
        margin: auto;
    }


    // <div class="tabulator-cell" tabulator-field="providers"
    :global(div.tabulator-cell[tabulator-field="providers"]) {
        overflow-y: scroll;
        /*:global(span.select2-container) {
            width: 100%;
        }*/
    }
</style>
