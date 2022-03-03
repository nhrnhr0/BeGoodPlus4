
<script>
    import { onMount } from 'svelte';
    import { apiSearchProducts, fetch_wraper } from './api/api';
import { ADMIN_ADD_TO_EXISTINT_CART_URL, ADMIN_GET_PRODUCT_SIZES_COLORS_MARTIX, CLOUDINARY_BASE_URL, GET_ALL_COLORS_API, GET_ALL_SIZES_API } from './consts/consts';
import AutoComplete from "simple-svelte-autocomplete";
    let all_sizes = {};
    let all_colors = {};
    export let object_id;
    onMount(async()=> {
        let sizes_request = await fetch_wraper(GET_ALL_SIZES_API);
        let colors_request = await fetch_wraper(GET_ALL_COLORS_API);
        console.log('onMount', sizes_request, colors_request);
        all_sizes = sizes_request;
        all_colors = colors_request;
    });

    let new_products = [];
    let searchValue = '';
    function size_id_to_rep(size_id){
        return all_sizes.find(size => size.id == size_id).size
    }
    function color_id_to_rep(color_id){
        return all_colors.find(color => color.id == color_id).name;
    }
    function autocompleteItemSelected(item) {
        if(item && item.id) {
            addNewProduct(item)
        }
        console.log('autocompleteItemSelected: ', new_products);
        debugger;
        /*searchValue = item.title;
        apiSearchProducts(searchValue).then(response => {
            new_products = response.data;
            console.log(new_products);
        });*/
    }
    async function searchProducts(keyword) {
            let json = await apiSearchProducts(keyword);
            let data = json;
            return data.all
        }

    function addNewProduct(item) {
		new_products = [...new_products, item];
	}

    let new_products_data = {};
    $: {
        new_products.forEach(product => {
            if(new_products_data[product.id]) {
                
            } else {
                new_products_data[product.id] = load_product_colors_and_sizes(product.id);

            }
        });
    }

    async function load_product_colors_and_sizes(product_id) {
        let response = await fetch_wraper(`${ADMIN_GET_PRODUCT_SIZES_COLORS_MARTIX}/${product_id}`);
        console.log('load_product_colors_and_sizes: ', response);
        return response;
    }
</script>

{#if object_id}
    <form action="{ADMIN_ADD_TO_EXISTINT_CART_URL}" method="POST">
        <input type="hidden" name="object_id" value="{object_id}">
        
        <div class="search-wraper">
            <AutoComplete id="search_input" on:focus loadingText="מחפש מוצרים..." createText="לא נמצאו תוצאות חיפוש" showLoadingIndicator=true noResultsText="" onChange={autocompleteItemSelected} create=true placeholder="חיפוש..." className="autocomplete-cls" searchFunction={searchProducts} delay=200 localFiltering="{false}" labelFieldName="title" valueFieldName="value" bind:value={searchValue}  >
                <div slot="item" let:item={item} let:label={label}>
                    <div class="search-item">
                        <div class="inner">
                            <img alt="{item.title}" style="height:25px;" src="{CLOUDINARY_BASE_URL}f_auto,w_auto/{item.cimage}" />
                            {@html label}
                        </div>
                    </div>
                </div>
            </AutoComplete>
    </div>
        <table class="base-table">
            <thead>
                <tr>
                    <td class="small-cell">תמונה</td>
                        <td class="small-cell">שם מוצר</td>
                        <td>צבעים מידות</td>
                </tr>
            </thead>
            <tbody>
                {#each new_products as product}
                    <tr>
                        <td class="small-cell"><img alt="{product.title}" width="50px" height="50px" src="{CLOUDINARY_BASE_URL}/{product.cimage}" /> </td>
                        <td class="small-cell">{product.title}</td>
                        <td>
                            <table class="base-table">
                                
                                    <tr>
                                        <td></td>
                                        {#each product.sizes as size_id}
                                            <td>{size_id_to_rep(size_id)}</td>
                                        {/each}
                                        <td>מחק</td>
                                    </tr>
                                    
                                    {#each product.colors as color_id}
                                        <tr>
                                            <td>{color_id_to_rep(color_id)}</td>
                                            {#each product.sizes as size_id}
                                                <td >
                                                    <input type="number" name="PROD_{product.id}_CLR_{color_id}_SIZE_{size_id}" value="0" min="0" max="100">
                                                </td>
                                            {/each}
                                            <td>
                                                <input type="checkbox" name="PROD_{product.id}_CLR_{color_id}_delete" value="1">
                                            </td>
                                        </tr>
                                    {/each}
                            </table>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        {new_products.length}
        <div class="submit-btn-wraper">
            <input class="submit-btn" type="submit" value="update cart">
        </div>
    </form>
{/if}
<style lang="scss">
    .submit-btn-wraper {
        text-align: center;
        width: 100%;
        border: 1px solid blue;
        padding: 10px;
        padding-top: 40px;
        padding-bottom: 40px;
        
    }
    .submit-btn {
            margin:auto;
            width: 200px;
            height: 40px;
            border: 1px solid blue;
            background-color: #fff;
            color: blue;
            font-size: 20px;
            cursor: pointer;
        }
    .small-cell {
        max-width: 150px;
    }
    .search-wraper {
        border:1px solid #ccc;
        margin-bottom: 240px;
        font-size: 1.5rem;
    }
    
    table.base-table {
        border: 1px solid black;
        border-collapse: collapse;
        width: 100%;
        padding-bottom: 350px;
        padding-top: 350px;
    }
    td {
        width: 100%;
    }
</style>
