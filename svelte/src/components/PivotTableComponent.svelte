

<script>
    import { onMount } from 'svelte';
import { uuidv4 } from '../utils/utils';
    export let data = undefined;
    let uniqueId = uuidv4();
    function dataInputFunction(callback) {
        for(let i = 0; i < data.length; i++) {

            let d = {...data,
                'צבע': data[i].sku_color_name,
                'גודל': data[i].sku_size_name,
                'וריאנט': data[i].sku_verient_name,
                'quantity': data[i].quantity,
            }
            callback(d);
        }
    }
    onMount(()=> {
        setTimeout(()=> {
            var sum = window.$.pivotUtilities.aggregatorTemplates.sum;
            var numberFormat = window.$.pivotUtilities.numberFormat;
            var intFormat = numberFormat({digitsAfterDecimal: 0});
            console.log('data: =================> ', data);
            window.$(`#output-${uniqueId}`).pivot(
                dataInputFunction,
                {
                    rows: ["צבע", "וריאנט"],
                    cols: ["גודל"],
                    aggregator: sum(intFormat)(["quantity"])
                }
            );
        }, 1000);
    })
</script>
<div id="output-{uniqueId}"></div>
<style lang="scss">
    :global(.pvtTable thread tr th) {
        background-color: var(--cds-active-3)!important;
    }
    :global(.pvtTable tbody tr th) {
        background-color: var(--cds-active-3)!important;
    }
    :global(.pvtTable tbody tr th, table.pvtTable thead tr th) {
        background-color: var(--cds-active-3)!important;
    }
    /*
    .pivot-table {
        width: 100%;
        thead {
            
            tr {
                th {
                    padding: 0.5rem;
                    text-align: center;
                    border: 1px solid black;
                    width: 100%;
                    padding:10px;
                }
            }
        }
        tbody {
            tr {
                td {
                    padding: 0.5rem;
                    text-align: center;
                    border: 1px solid black;
                    width: 100%;
                    padding:10px;
                }
            }
        }
    }*/
</style>