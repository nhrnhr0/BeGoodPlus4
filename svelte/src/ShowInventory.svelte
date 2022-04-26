<script>
import { onMount } from 'svelte';

    export let products;
    let uniqueId = uuidv4();
    import { uuidv4 } from './utils/utils';
    function dataInputFunction(callback) {
        for (let i = 0; i < products.length; i++) {
        
            let d = {...products,
                'צבע': products[i].sku_color_name,
                'גודל': products[i].sku_size_name,
                'וריאנט': products[i].sku_verient_name,
                'quantity': products[i].quantity,
                'price': products[i].price,
                'מזהה': products[i].id,
                'שם-מוצר': products[i].sku_product_name,
            }
            callback(d);
        }
    }
    onMount(()=> {
        setTimeout(()=> {
            var sum = window.$.pivotUtilities.aggregatorTemplates.sum;
            var numberFormat = window.$.pivotUtilities.numberFormat;
            var intFormat = numberFormat({digitsAfterDecimal: 0});
            console.log('data: =================> ', products);
            window.$(`#output-${uniqueId}`).pivotUI(
                dataInputFunction,
                {
                    rows: ['מזהה','שם-מוצר', 'צבע', 'וריאנט'],
                    cols: ["גודל"],
                    aggregator: sum(intFormat)(["quantity"]),
                    //vals: ["price", 'quantity'],
                }
            );
        }, 1000);
    })
</script>
<div class="output-wraper">
    <div class="output" id="output-{uniqueId}" ></div>
</div>


<style lang="scss">
    .output-wraper  {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        
        .output {
            width: 50%;
            thead {
                
                tr {
                    th {
                        padding: 0.5rem;
                        text-align: center;
                        border: 1px solid black;
                        width: 100%;
                    }
                }
            }
        }
    }
</style>