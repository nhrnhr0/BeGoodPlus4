

<script>
import { onMount } from "svelte";
    let data;
    let server_data;
    let updateing = false;

    export let id;
    function load_order_from_server() {
        updateing = true;
        apiGetMOrder(id).then(resp => {
            console.log('resp:', resp);
            data = JSON.parse(JSON.stringify(resp));
            server_data = JSON.parse(JSON.stringify(resp));
            updateing = false;
            //setInterval(check_server_updates, 500);
        });
    }
    onMount(()=> {
        load_order_from_server();
    })
</script>

<main>
    {#if updateing}
        <Loading />
    {:else}
        
    {/if}
    שלום {id}
</main>

<style lang="scss">
    main {
        padding-top: 35px;
        width: 90%;
        margin: auto;
    }
</style>
