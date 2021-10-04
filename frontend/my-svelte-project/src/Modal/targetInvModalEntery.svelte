<script>
import {
    Modals,
    closeModal,
    openModal,
    modals
} from 'svelte-modals';
//import {fade} from 'svelte/transition'
import productModal from './productModal.svelte'
export let data;
function handleEdit() {
    openModal(productModal, {
        data: data
    });
}
</script>

<style lang="scss">
</style>

<tr>
    <td>
        {data.stock.product.name}
    </td>
    <td>
        {data.amount}
    </td>
    <td>
        {data.stock.productColor.name}
    </td>
    <td>
        {data.stock.productSize.size}
    </td>
    <td>
        {data.stock.__str__}
    </td>
    <td>
        {data.stock.provider.name}
    </td>
    <td>
        <button on:click="{handleEdit}">edit</button>
        <button>del</button>
    </td>
</tr>
