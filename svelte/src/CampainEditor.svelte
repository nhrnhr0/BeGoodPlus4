<script>
import { onMount } from 'svelte';
import { fly } from 'svelte/transition';
import AutoComplete from "simple-svelte-autocomplete";
import {apiSearchProducts, fetch_wraper} from './api/api.js';
import { Jumper } from 'svelte-loading-spinners'

import {deepEqual} from './utils/utils.js'
	import {GET_CAMPAIN_PRODUCTS_URL,CLOUDINARY_BASE_URL} from './consts/consts'
	export let object_id;
	let need_update = false;
	let data;
	let server_data;
	let updateing = false;
	onMount(async()=> {
		let url = GET_CAMPAIN_PRODUCTS_URL + object_id;
		console.log('url', url);
		let resp = await fetch(url)
			.then(response => response.json())
			.then(data => data);
		data = JSON.parse(JSON.stringify(resp));
		server_data = JSON.parse(JSON.stringify(resp));
		setInterval(check_server_updates, 5000);
	});
	

	function check_server_updates() {
		//console.log('check_server_updates: ', JSON.stringify(data),'======', JSON.stringify(server_data));
		console.log('data:', data);
		console.log('server_data:', server_data);
		if(deepEqual(data, server_data)) {
			console.log('equal');
			need_update = false;
		} else {
			console.log('not equal');
			need_update = true;
		}
	}


	function update_data_to_server() {
		// post the data to the server and the same api point as GET_CAMPAIN_PRODUCTS_URL
		updateing = true;
		let response = fetch_wraper(GET_CAMPAIN_PRODUCTS_URL + object_id, {
			method: 'POST',
			body: JSON.stringify(data)
		});
		console.log('response:', response);
		response.then(resp => {
			console.log('resp:', resp);
			server_data = JSON.parse(JSON.stringify(resp));
			data = JSON.parse(JSON.stringify(resp));
			updateing = false;
			need_update = false;
		});
	}

	function autocompleteItemSelected(item) {
		if(data) {
		console.log(data);
		console.log(item);
		let newProduct = {
			order: data.length,
			cimg: item.cimage,
			title: item.title,
			catalogImage: item.id,
			priceTable: [],
		}
		
			data.push(newProduct);
			console.log(data);
			data = data;
		}

	}


	let searchValue;
        async function searchProducts(keyword) {
            let json = await apiSearchProducts(keyword);
            let data = json;
            return data.all
        }

</script>

{#if object_id}
<main>
	<h1>object_id: {object_id}</h1>
	<h2>{GET_CAMPAIN_PRODUCTS_URL}</h2>
	<h3>DATA: {JSON.stringify(data)}</h3>
	<h3>server_data: {JSON.stringify(server_data)}</h3>

	<!-- 
		table of products with collumns:
			order
			product_id
			product_image
	-->
	<table class="main-table">
		<thead>
			<tr>
				<th>פעולות</th>
				<th>סדר</th>
				<th>תמונה</th>
				<th>מחירים</th>
			</tr>
		</thead>
		<tbody>
			{#if data}
			{#each data as product, j}
			<tr>
				<td>
					<button on:click|preventDefault={(e)=> {
											
						// product.priceTable[i];
						//product.priceTable = product.priceTable;
						data.splice(j, 1);
						data = data;
						
					}}>מחק</button>
				</td>
				<td>
					<input type="number" bind:value={product.order}/>
				</td>
				<td>
					<img width="50px" height="50px" src="{CLOUDINARY_BASE_URL}{product.cimg}" alt={product.title} />
					<span>{product.title}</span>
					<!-- 
						table of products with collumns:
							amount
							paymentType
							price
					-->
				</td>
				<td>
					<table>
						<thead>
							<tr>
								<th>כמות</th>
								<th>מחיר</th>
								<th>מחיר לצרכן</th>
								<th>פעולות</th>
							</tr>
						</thead>
						<tbody>
							{#each product.priceTable as price, i }
								<tr>
									
									<td>
										<input type="number" name="" id="" bind:value={price.amount}>
									</td>
									<td>
										<input type="number" name="" id="" bind:value={price.cach_price}>
									</td>
									<td>
										<input type="number" name="" id="" bind:value={price.credit_price}>
									</td>
									<td>
										<button on:click|preventDefault={(e)=> {
											
											// product.priceTable[i];
											//product.priceTable = product.priceTable;
											debugger;
											product.priceTable.splice(i, 1);
											product.priceTable = product.priceTable;
											
										}}>מחק</button>
									</td>
								</tr>
							{/each}
							<tr>
								<td>
									<button on:click|preventDefault={()=> {
											product.priceTable.push({'amount': 1, 'cach_price':1, 'credit_price':1});
											product.priceTable = product.priceTable;
										}
									}>הוסף מחיר</button>
								</td>
							</tr>
							
						</tbody>
					</table>
					
				</td>
			</tr>
			{/each}
			{/if}
			<tr>
				<td></td>
				<td colspan="1">
					<form action="">
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
					</form>
				</td>
				<td></td>
			</tr>
			
		</tbody>
		
	</table>
	
	{#if need_update}
		<button class="float-btn" transition:fly={{x:-50}} on:click|preventDefault="{update_data_to_server}">
			{#if updateing}
				<Jumper size="30" color="#FF3E00" unit="px" duration="1s"></Jumper>
			{/if}
				עדכן מידע לשרת
		</button>
	{/if}
	
</main>

{/if} <!-- end of if object_id -->

<style lang="scss">
	.float-btn {
		position: fixed;
		bottom: 10px;
		left: 10px;
		z-index: 9999;
		background: #417690;
		font-size: xx-large;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 15px 25px;
		cursor: pointer;
		box-shadow: 0 0 5px #ccc;
	}
	/*:global(.search-item) {
		.inner {
			display: flex;
			align-items: center;
			height: 25px;
			width: 100%;
			border-bottom: 1px solid #ccc;
		}
	}*/
	table, th, td {
		border: 1px solid black;
	}
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>