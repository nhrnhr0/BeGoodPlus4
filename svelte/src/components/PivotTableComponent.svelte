

<script>
    import { onMount } from 'svelte';
    export let data = undefined;
    onMount(()=> {
        setTimeout(()=> {
            debugger;
            window.$("#output").pivot(
                data,
                {
                    rows: ["sku_color_name", "sku_verient_name"],
                    cols: ["sku_size_name"],
                    vals: ['id','quantity'],
                }
            );
        }, 1000);
    })
</script>
<div id="output"></div>
<style lang="scss">
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
    }
</style>