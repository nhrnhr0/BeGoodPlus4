

<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import { apiSearchProviders ,apiLoadEnterDocData} from "./api/api";
    import { Grid, Row, Column,Theme, RadioButton, Form , FormGroup, Checkbox, RadioButtonGroup, Select, SelectItem, Button} from "carbon-components-svelte";
    import { Accordion, AccordionItem } from "carbon-components-svelte";
import { onMount } from "svelte";
import { groupBy } from "./utils/utils";
import PivotTableComponent from "./components/PivotTableComponent.svelte";
    let theme = "white";
    export let id = undefined;
    let docData;
    let providerValue;
    let grouped_products = undefined;
    async function load_data_from_server() {
        let response = await apiLoadEnterDocData(id);
            docData = response;
            grouped_products = groupBy(docData.items, x => x.sku_ppn_name);
            console.log('docData = ', docData);
            console.log('grouped_products = ', grouped_products);
    }
    onMount(async()=> {
        console.log('id = ', id);
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
</script>

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
                </tr>
            </thead>
            <!--
(2) ['דגמ"ח אמרקאי ת.חוץ+גומי', Array(4)]
0: "דגמ\"ח אמרקאי ת.חוץ+גומי"
1: Array(4)
0:
created_at: "2022-03-16T12:29:05.761799+02:00"
id: 1
price: "23.000"
quantity: 2
sku:
color: 77
color_name: "שחור"
created_at: "2022-03-16T12:25:30.747203+02:00"
id: 1
ppn: 1
ppn_name: "דגמ\"ח אמרקאי ת.חוץ+גומי"
product_id: "20"
product_name: "דגמ\"ח אינדאני"
size: 87
size_name: "S"
verient: null
verient_name: ""
[[Prototype]]: Object
[[Prototype]]: Object
1:
created_at: "2022-03-16T12:33:48.631403+02:00"
id: 2
price: "23.000"
quantity: 2
sku:
color: 77
color_name: "שחור"
created_at: "2022-03-16T12:33:40.446125+02:00"
id: 2
ppn: 1
ppn_name: "דגמ\"ח אמרקאי ת.חוץ+גומי"
product_id: "20"
product_name: "דגמ\"ח אינדאני"
size: 88
size_name: "M"
verient: null
verient_name: ""
[[Prototype]]: Object
[[Prototype]]: Object
2:
created_at: "2022-03-16T12:34:24.965838+02:00"
id: 3
price: "23.000"
quantity: 4
sku:
color: 77
color_name: "שחור"
created_at: "2022-03-16T12:34:19.278850+02:00"
id: 3
ppn: 1
ppn_name: "דגמ\"ח אמרקאי ת.חוץ+גומי"
product_id: "20"
product_name: "דגמ\"ח אינדאני"
size: 89
size_name: "L"
verient: null
verient_name: ""
[[Prototype]]: Object
[[Prototype]]: Object
3:
created_at: "2022-03-16T12:36:15.895973+02:00"
id: 4
price: "23.000"
quantity: 2
sku:
color: 77
color_name: "שחור"
created_at: "2022-03-16T12:36:07.526396+02:00"
id: 4
ppn: 1
ppn_name: "דגמ\"ח אמרקאי ת.חוץ+גומי"
product_id: "20"
product_name: "דגמ\"ח אינדאני"
size: 90
size_name: "XL"
verient: null
verient_name: ""
[[Prototype]]: Object
[[Prototype]]: Object
length: 4
[[Prototype]]: Array(0)
length: 2
[[Prototype]]: Array(0)
            -->
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
                            <!--
                                pivot table
                                index:  color_name, verient_name
                                column: size_name
                                value:  quantity
                            -->
                            <PivotTableComponent
                                data={grou[1]}
                            />
                            
                            <!--
                            <table class="pivot-table">
                                <thead>
                                    <tr>
                                        <th>צבע</th>
                                        <th>מידה</th>
                                        <th>כמות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each grou[1] as product}
                                        <tr>
                                            <td>{product.sku.color_name}</td>
                                            <td>{product.sku.size_name}</td>
                                            <td>{product.quantity}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                            -->
                        </td>
                    </tr>

                {/each}
                <!--
                {#each docData.items as item}
                <tr>
                    <td>{item.sku.ppn_name}</td>
                    <td>{item.sku.product_name}</td>
                    <td>{item.price}</td>
                    <td><input type="number" /></td>
                    <td>X</td>
                    <td>
                        <table >
                            <thread>
                                <tr>
                                    <th>צבע</th>
                                    <th>מידה</th>
                                    <th>ריאנט</th>
                                </tr>
                            </thread>
                            <tbody>
                                <tr>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                        </table>
                    </td>
                </tr>
                {/each}
                -->
            </tbody>
        </table>
        <!--<form class="product-entery-form">
            <div class="entry-wraper">
                <div class="field-label">
                    תאריך יצירה
                </div>
                <div class="field-value">
                    {docData.created_at}
                </div>
            </div>
            <div class="entry-wraper">
                <div class="field-label">
                    מחסן
                </div>
                <div class="field-value">
                    {docData.warehouse_name}
                </div>
            </div>
            <div class="entry-wraper">
                <div class="field-label">
                    ספק
                </div>
                <div class="field-value">
                    {docData.provider_name}
                </div>
            </div>
        </form>-->
    {/if}
</div>


<style lang="scss">

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