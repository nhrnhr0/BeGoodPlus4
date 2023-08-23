<script>
import { Button, Loading } from "carbon-components-svelte";

import { onMount } from "svelte";
import {
  apiAddNewProductToMorder,
  apiDeleteMOrderItem,
  apiGetAllColors,
  apiGetAllMorderStatuses,
  apiGetAllSizes,
  apiGetAllVariants,
  apiGetMOrder,
  apiSaveMOrder,
  apiSearchProducts,
} from "./api/api";
import { CLOUDINARY_BASE_URL } from "./consts/consts";
import MentriesServerTable from "./MentriesServerTable.svelte";
import AutoComplete from "simple-svelte-autocomplete";
import MorderAddProductEntryPopup from "./components/popups/MorderAddProductEntryPopup.svelte";
import { morderAddProductEntryPopupStore } from "./components/popups/MorderAddProductEntryPopupStore";

export let id;
let updateing = false;
//let ALL_PROVIDERS;
let headerData = undefined;
let serverData = undefined;
let data = undefined;
let selectedProduct = undefined;
//let productsData;
async function get_order_from_server() {
  let resp = await apiGetMOrder(id);
  return resp;
}
async function load_order_from_server(resp = undefined) {
  updateing = true;
  if (resp == undefined) {
    resp = await get_order_from_server();
  }
  // console.log("resp:", resp);
  data = serverData = JSON.parse(JSON.stringify(resp));
  console.log("data:", data);
  headerData = [
    {
      created: data.created,
      updated: data.updated,
      id: data.id,
      name: data.name,
      email: data.email,
      message: data.message,
      phone: data.phone,
      status2: data.status2,
      status_msg: data.status_msg,
      client_id: data.client,
      client_name: data.client_businessName,
      agent: data.agent_name,
      sheets_price_prop_link: data.sheets_price_prop_link,
      sheets_order_link: data.sheets_order_link,
      export_to_suppliers: data.export_to_suppliers,
    },
  ];
  //productsData = data.products;
  console.log("headerData:", headerData);
  //groupedProducts = group the productsData by product field (ID: int)
  updateing = false;
}

let ALL_SIZES;
let ALL_COLORS;
let ALL_VERIENTS;
let ALL_STATUSES;
let updateing_to_server = false;

onMount(async () => {
  let defult_size = {
    id: null,
    size: "one size",
    code: "cc",
  };
  let defult_color = {
    id: null,
    name: "no color",
    color: "#FFFFFF00",
    code: "00",
  };
  // ALL_SIZES = await apiGetAllSizes();
  // ALL_COLORS = await apiGetAllColors();
  // ALL_VERIENTS = await apiGetAllVariants();
  // ALL_STATUSES = await apiGetAllMorderStatuses();
  let promises = [apiGetAllSizes(), apiGetAllColors(), apiGetAllVariants(), apiGetAllMorderStatuses(), get_order_from_server()];
  let results = await Promise.all(promises);
  ALL_SIZES = results[0];
  ALL_COLORS = results[1];
  ALL_VERIENTS = results[2];
  ALL_STATUSES = results[3];
  let resp = results[4];
  await load_order_from_server(resp);
  //ALL_PROVIDERS = await apiGetProviders();
});

async function save_data() {
  // move headerData to data
  data.created = headerData[0].created;
  data.updated = headerData[0].updated;
  data.id = headerData[0].id;
  data.name = headerData[0].name;
  data.email = headerData[0].email;
  data.message = headerData[0].message;
  data.phone = headerData[0].phone;
  // data.status = headerData[0].status;
  data.status2 = headerData[0].status2;
  data.status_msg = headerData[0].status_msg;
  data.client = headerData[0].client_id;
  data.client_businessName = headerData[0].client_name;
  updateing_to_server = true;
  await apiSaveMOrder(data.id, data);
  updateing_to_server = false;
  alert("saved");
}

async function searchProducts(keyword) {
  let json = await apiSearchProducts(keyword, true);
  let data = json;
  return data.all;
}

// function autocompleteItemSelected(val) {
//     console.log('autocompleteItemSelected: ' , val);
//     selectedProduct = val;
// }

let add_product_message = "";
let add_product_status = "unset";
let add_product_status_color = "black";
function addNewProductButtonClick(e) {
  e.preventDefault();
  add_product_message = "";
  add_product_status = "sending";
  add_product_status_color = "black";
  let sendData = {};
  console.log("looking for ", selectedProduct.id, " in ", data.products);
  if (data.products.find((product) => product.product.id == selectedProduct.id)) {
    add_product_message = "מוצר כבר נמצא בהזמנה";
    add_product_status = "error";
    add_product_status_color = "red";
    return;
  }
  sendData["order_id"] = data.id;
  sendData["product_id"] = selectedProduct.id;
  console.log("data: ", sendData);
  apiAddNewProductToMorder(sendData)
    .then((newEntry) => {
      //e.target.reset();

      data.products.push(newEntry.data);
      data.products = [...data.products];
      selectedProduct = undefined;
      add_product_status = "unset";
    })
    .catch((err) => {
      console.log(err);
      add_product_status = "unset";
    });

  //productAmountEditModel.hide();
}

function add_entry_btn_clicked(e) {
  e.preventDefault();
  let form = e.target;
  let formData = new FormData(form);
  let formDictData = {};
  formData.forEach((value, key) => {
    formDictData[key] = value;
  });

  // let product = data.products.find(product=> product.id == formDictData['entry_id']);
  // if(product) {
  if (formDictData["color"] == "undefined") {
    alert("יש לבחור צבע");
    return;
  } else if (formDictData["size"] == "undefined") {
    alert("יש לבחור מידה");
    return;
  }
  let selected_color = parseInt(formDictData["color"]);
  let selected_size = parseInt(formDictData["size"]);
  let selected_verient = formDictData["varient"] == "undefined" || formDictData["varient"] == "" ? null : parseInt(formDictData["varient"]);
  let amount = parseInt(formDictData["amount"] == "undefined" || formDictData["amount"] == "" ? "0" : formDictData["amount"]);

  for (let i = 0; i < data.products.length; i++) {
    if (data.products[i].id == formDictData["entry_id"]) {
      if (selected_verient == null && product.verients.length != 0) {
        alert("יש לבחור מודל");
        return;
      }
      let found = false;
      for (let j = 0; j < data.products[i].entries.length; j++) {
        if (
          data.products[i].entries[j].color == selected_color &&
          data.products[i].entries[j].size == selected_size &&
          data.products[i].entries[j].varient == selected_verient
        ) {
          found = true;
          data.products[i].entries[j].quantity = amount;
        }
      }
      if (!found) {
        data.products[i].entries.push({
          id: null,
          size: selected_size,
          color: selected_color,
          varient: selected_verient,
          quantity: amount,
        });
      }
      data.products[i].entries = [...data.products[i].entries];
      break;
    }
  }
}

//         let entry = product.entries.find(entry=> entry.color == selected_color && entry.size == selected_size && entry.varient == selected_verient);
//         if(entry) {
//             entry.quantity = amount;
//             console.log('entry found, update quantity');
//         }else {
//             product.entries.push({
//                 id:null,
//                 size: selected_size,
//                 color: selected_color,
//                 varient: selected_verient,
//                 quantity: amount
//             });
//             console.log('entry not found, creating new');
//         }

//         console.log(product.entries);
//     }else {
//         alert('מוצר לא נמצא');
//     }
// }
// [('new', 'חדש'), ('in_progress', 'סחורה הוזמנה'), ('in_progress2', 'מוכן לליקוט',), (
//     'in_progress3', 'בהדפסה',), ('in_progress4', 'מוכן בבית דפוס'), ('in_progress5', 'ארוז מוכן למשלוח'), ('done', 'סופק'), ]
// const STATUS_OPTIONS = [
//   ["new", "חדש"],
//   ["price_proposal", "הצעת מחיר"],
//   ["in_progress", "סחורה הוזמנה"],
//   ["in_progress2", "מוכן לליקוט"],
//   ["in_progress3", "בהדפסה"],
//   ["in_progress4", "מוכן בבית דפוס"],
//   ["in_progress5", "ארוז מוכן למשלוח"],
//   ["done", "סופק"],
// ];

function new_product_btn_click() {
  var href = "/admin/catalogImages/catalogimage/add/";
  if (href.indexOf("?") === -1) {
    href += "?_popup=1";
  } else {
    href += "&_popup=1";
  }
  var win = window.open(href, "_blank", "height=500,width=800,resizable=yes,scrollbars=yes");
  win.focus();
  return false;
}

function handleImageUploadSim(e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    let image = reader.result;
    simImage = image;
  };
}
let simImage;
let SimDescriptionNew;
function addNewSimBtnClicked(e) {
  e.preventDefault();
  debugger;
  if (data == undefined) {
    data = {};
  }
  if (!data?.simulations) {
    data.simulations = [];
  }
  data.simulations.push({
    cimage: simImage,
    description: SimDescriptionNew,
  });
  data.simulations = [...data.simulations];
  simImage = "";
  SimDescriptionNew = "";
}

let current_selected_sim_idx = -1;
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" />
</svelte:head>
<!-- headerData table -->
<MorderAddProductEntryPopup {ALL_COLORS} {ALL_SIZES} {ALL_VERIENTS} />
<main>
  <!-- href to back to  /admin/morders/morder/ -->
  <a href="/admin/morders/morder/" class="back-btn">חזרה להזמנות</a>
  {#if headerData}
    <div class="created">
      נוצר ב{new Date(headerData[0].created).toLocaleString("Israel")}
    </div>
    <div class="updated">
      עודכן ב{new Date(headerData[0].updated).toLocaleString("Israel")}
    </div>
    <table class="headers-table">
      <thead>
        <tr>
          <th>מזהה</th>
          <th>שם</th>
          <th>דואר אלקטרוני</th>
          <th>הודעה</th>
          <th>טלפון</th>
          <th>סטטוס</th>
          <th>שם העסק</th>
          <th>סוכן</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="header-cell">{headerData[0].id}</td>
          <td class="header-cell">
            <input type="text" bind:value={headerData[0].name} placeholder="שם" />
          </td>
          <td class="header-cell">
            <input type="email" bind:value={headerData[0].email} placeholder="אימייל" />
          </td>
          <td class="header-cell"><textarea bind:value={headerData[0].message} placeholder="הודעה" /> </td>
          <td class="header-cell">
            <input type="phone" bind:value={headerData[0].phone} placeholder="טלפון" />
          </td>
          <td class="header-cell">
            <select class="status-select" bind:value={headerData[0].status2}>
              {#each ALL_STATUSES as opt}
                <option value={opt.id} selected={opt.name == headerData[0].status2}>{opt.name}</option>
              {/each}
            </select>
            <textarea cols="18" bind:value={headerData[0].status_msg} placeholder="הערות לסטטוס" />
          </td>
          <td class="header-cell">{headerData[0].client_name}</td>
          <td class="header-cell">{headerData[0].agent}</td>
        </tr>
      </tbody>
    </table>
  {/if}

  {#if data?.products}
    <!-- title:'id',
    title:'שם מוצר
    title:'מחיר'
    title:'רקמה?',
    title: 'הדפסה?',
    title:"פירוט",
    title:'הערות',
    title: 'ברקוד' -->
    <table class="product-table">
      <thead>
        <tr>
          <th>מזהה</th>
          <th>שם מוצר</th>
          <th>מחיר</th>
          <th colspan="2">הערות</th>
          <th>ברקוד</th>
          <th colspan="2">פעולות</th>
        </tr>
      </thead>
      <tbody>
        {#each data.products as product}
          <tr>
            <td class="cell-border">{product.product.id}</td>
            <td class="cell-border">
              <img src="{CLOUDINARY_BASE_URL}f_auto,w_auto/{product.product.cimage}" alt={product.product.title} width="25px" height="25px" loading="lazy" />
              {product.product.title}
            </td>

            <td
              class="cell-border"
              on:click={() => {
                let new_price = prompt("מחיר חדש:", product.price);
                if (new_price) {
                  product.price = new_price;
                }
              }}>{product.price}₪</td
            >

            <td class="cell-border" colspan="2"><textarea bind:value={product.comment} placeholder="הערות" /></td>
            <td class="cell-border">{product.pbarcode || ""}</td>
            <td class="cell-border" colspan="2">
              <button
                class="btn btn-danger"
                on:click={() => {
                  if (confirm("בטוח שברצונך למחוק את המוצר?")) {
                    // Save it!
                    apiDeleteMOrderItem(product.id);
                    data.products = [...data.products.filter((item) => item.id != product.id)];
                  } else {
                  }
                }}>מחק</button
              >

              {#if current_selected_sim_idx != -1}
                <button
                  type="button"
                  class="btn connect-btn"
                  class:active={data &&
                    data?.simulations &&
                    current_selected_sim_idx != -1 &&
                    data.simulations[current_selected_sim_idx].products &&
                    data.simulations[current_selected_sim_idx].products[product.id]}
                  on:click={() => {
                    //data.simulations[current_selected_sim_idx].products = {product_id: amount:Int}
                    // set data.simulations[current_selected_sim_idx].products = [...data.simulations[current_selected_sim_idx].products, newData];
                    // if it already exists, remove it
                    if (data.simulations[current_selected_sim_idx].products && data.simulations[current_selected_sim_idx].products[product.id]) {
                      delete data.simulations[current_selected_sim_idx].products[product.id];
                      data.simulations = [...data.simulations];
                    } else {
                      console.log(product);
                      debugger;
                      let total_amount = product.entries.reduce((acc, curr) => acc + curr.quantity, 0);
                      if (!data.simulations[current_selected_sim_idx].products) {
                        data.simulations[current_selected_sim_idx].products = {};
                      }
                      data.simulations[current_selected_sim_idx].products[product.id] = {
                        amount: total_amount,
                        title: product.product.title,
                        img: product.product.cimage,
                      };
                    }
                  }}>חבר מוצר להדמייה</button
                >
              {/if}
            </td>
          </tr>
          <tr class="details">
            <td colspan="6">
              {#key product.id}
                <MentriesServerTable bind:product {ALL_SIZES} {ALL_COLORS} {ALL_VERIENTS} />
              {/key}
            </td>
            <td colspan="1">
              <form class="add-entry-form" action="" method="post" on:submit={add_entry_btn_clicked}>
                <input type="hidden" name="product_id" value={product.product.id} />
                <input type="hidden" name="entry_id" value={product.id} />
                <div class="form-group">
                  <!-- <label for="color">צבע</label> -->
                  <select class="form-control" name="color" id="color">
                    <option default value="undefined">צבע</option>
                    {#each ALL_COLORS as color}
                      <option value={color["id"]}>{color["name"]}</option>
                    {/each}
                  </select>

                  <!-- <label for="size">מידה</label> -->
                  <select class="form-control" name="size" id="size">
                    <option default value="undefined">מידה</option>
                    {#each ALL_SIZES.sort((a, b) => {
                      return a.code.localeCompare(b.code);
                    }) as size}
                      <option value={size["id"]}>{size["size"]}</option>
                    {/each}
                  </select>
                  <!-- <label for="varient">מודל</label> -->
                  {#if product.verients.length != 0}
                    <select class="form-control" name="varient" id="varient">
                      <option default value="undefined">מודל</option>
                      {#each ALL_VERIENTS as varient}
                        <option value={varient["id"]}>{varient["name"]}</option>
                      {/each}
                    </select>
                  {/if}

                  <!-- <label for="amount">כמות</label> -->
                  <input class="form-control" type="number" placeholder="כמות" name="amount" id="amount" min="0" />
                </div>
                <div class="error-msg" />
                <button type="submit" class="btn btn-secondary">הוסף</button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  <div id="new-product-form">
    <h3>הוסף מוצר</h3>
    <!-- <form method="post" on:submit="{addNewProductFormSubmit}"> -->
    <div class="form-group">
      <label for="product_name">שם מוצר</label>
      <div class="search-wraper">
        <AutoComplete
          id="search_input"
          on:focus
          loadingText="מחפש מוצרים..."
          bind:selectedItem={selectedProduct}
          createText="לא נמצאו תוצאות חיפוש"
          showLoadingIndicator="true"
          noResultsText=""
          create="true"
          placeholder="חיפוש..."
          className="autocomplete-cls"
          searchFunction={searchProducts}
          delay="200"
          localFiltering={false}
          labelFieldName="title"
          valueFieldName="value"
        >
          <div slot="item" let:item let:label>
            <div class="search-item">
              <div class="inner">
                <img alt={item.title} style="height:25px;" src="{CLOUDINARY_BASE_URL}f_auto,w_auto/{item.cimage}" />
                {@html label}
              </div>
            </div>
          </div>
        </AutoComplete>
        {#if selectedProduct}
          <div class="selected-product">
            <div class="inner">
              <img alt={selectedProduct?.title} style="height:25px;" src="{CLOUDINARY_BASE_URL}f_auto,w_auto/{selectedProduct?.cimage}" />
              {@html selectedProduct?.title}
            </div>
          </div>

          <button disabled={add_product_status == "sending"} on:click={addNewProductButtonClick} class="btn btn-secondary">
            {#if add_product_status == "sending"}
              <div class="spinner-border" role="status">
                <span class="sr-only" />
              </div>
            {:else}
              הוסף
            {/if}
          </button>
          <div style="color: {add_product_status_color}">
            <pre>{add_product_message}</pre>
          </div>
        {:else}
          <button disabled>הוסף</button>
        {/if}
      </div>
    </div>
    <!-- </form> -->
    <div class="new-product-btn-wraper">
      <button class="btn btn-secondary" on:click={new_product_btn_click}> צור מוצר חדש </button>
    </div>
  </div>
  <!-- simulation -->
  <div class="table-wraper">
    <table class="simulation">
      {#each data?.simulations || [] as sim, i}
        <tr data-idx={i} class:deleted={sim.deleted}>
          <td>
            <input type="number" bind:value={sim.order} />
          </td>
          <td>
            <img src={sim.cimage} class="sim-img" />
          </td>
          <td>
            <div class="sim-description">
              <textarea name="sim-{i}" id="" cols="50" rows="5" placeholder="תיאור הדמייה" bind:value={sim.description} />
            </div>
          </td>
          <td>
            <!-- button to connect items to the sim -->
            <button
              type="button"
              on:click={() => {
                if (current_selected_sim_idx == i) {
                  current_selected_sim_idx = -1;
                } else {
                  current_selected_sim_idx = i;
                }
              }}
              class="connect-btn"
              class:active={current_selected_sim_idx == i}
            >
              קשר מוצרים
            </button>
            <!-- table of the products and thire total abount -->
            <!-- header: שם מוצר, כמות -->
            <table class="product-table simulation-table">
              <thead>
                <tr>
                  <th>שם מוצר</th>
                  <th>כמות</th>
                </tr>
              </thead>
              <tbody>
                {#each Object.keys(sim.products || {}) as product_idx}
                  <tr>
                    <td>
                      <img src="{CLOUDINARY_BASE_URL}{sim.products[product_idx].img}" width="25px" height="25px" />
                      {sim.products[product_idx].title}</td
                    >
                    <td>
                      <input type="number" bind:value={sim.products[product_idx].amount} Width="min-content" />
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table></td
          >
          <td>
            <div class="delete-action">
              <button
                type="button"
                on:click={() => {
                  sim.deleted = !sim.deleted;
                }}
              >
                {#if !sim.deleted}
                  מחק
                {:else}
                  שחזר
                {/if}
              </button>
            </div>
          </td>
        </tr>
      {/each}
      <tr>
        <td colspan="2"> הדמייה חדשה: </td>
      </tr>
      <tr>
        <td colspan="1" class="sim-image-td">
          <input type="file" id="selectedFileSim" on:change={handleImageUploadSim} accept="image/png, image/gif, image/jpeg" />
          <img width="50px" height="50px" src={simImage} class="sim-img" />
        </td>
        <td colspan="1">
          <div class="sim-description">
            <textarea name="sim-new" id="" cols="50" rows="5" placeholder="תיאור הדמייה" bind:value={SimDescriptionNew} />
          </div>
        </td>
        <td>
          <button type="button" on:click={addNewSimBtnClicked}>הוסף הדמייה</button>
        </td>
      </tr>
    </table>
  </div>
  <div class="update-btn-wraper">
    <Button
      class="update-btn"
      disabled={updateing_to_server}
      on:click={() => {
        save_data();
      }}
    >
      {#if updateing_to_server}
        <Loading withOverlay={false} />
      {:else}
        עדכן עכשיו
      {/if}
    </Button>
  </div>
</main>

<style lang="scss">
.new-product-btn-wraper {
  margin-top: 25px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.update-btn-wraper {
  position: sticky;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  :global(.update-btn) {
  }
}
form.add-entry-form {
  .form-group {
    padding: 5px;
  }
}
main {
  width: 90%;

  margin: auto;
  margin-top: 50px;
  margin-bottom: 250px;
  //border:1px solid red;
  .created {
    margin-right: 50px;
    font-size: 12px;
    color: #999;
    margin-bottom: 10px;
    margin-top: 10px;
  }
  .updated {
    margin-right: 50px;
    font-size: 12px;
    color: #999;
    margin-bottom: 10px;
    margin-top: 10px;
  }
}
table.headers-table {
  width: 100%;
  font-size: 18px;
  margin: 20px auto;
  border-collapse: collapse;
  border: 1px solid #ddd;
  thead {
    background-color: #f1f1f1;
    tr {
      th {
        border: 1px solid black;
      }
    }
  }
  tbody {
    tr {
      td.header-cell {
        border: 1px solid black !important;
        padding: 2px;
        .status-select {
          width: 100%;
        }
      }
    }
  }
}

table.product-table {
  width: 100%;
  font-size: 18px;
  margin: 20px auto;
  border-collapse: collapse;
  thead {
    background-color: #f1f1f1;
    tr {
      th {
        padding: 10px;
        background: rgba(255, 255, 255, 0.788);
        position: sticky;
        top: 0; /* Don't forget this, required for the stickiness */
        //box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);
        outline: 1px solid black;
      }
    }
  }
  .cell-border {
    border: 1px solid black;
    padding-left: 2px;
    padding-right: 2px;
    .d-flex-wraper {
      display: flex;
      justify-content: start;
      align-items: center;
      label {
        color: rgba(5, 5, 5, 0.466);
      }
    }
  }
  tr.details {
    td {
      margin: 20px;
      .add-entry-form {
        width: min-content;
        display: flex;
        flex-wrap: wrap;
        .form-group {
          display: flex;
          flex-wrap: wrap;
          select,
          input {
            width: fit-content;
            flex: 1;
            min-width: 65px;
          }
        }
      }
    }
    background-color: #a7a7a786;
  }
}

// simulation
.table-wraper {
  overflow-x: auto;
  margin-bottom: 20px;
}
table.simulation {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  margin-top: 20px;
  tr {
    border: 1px solid #ccc;
    // display: flex;
    // flex-direction: row;
    // justify-content: space-between;
    // align-items: center;

    td {
      border: 1px solid #ccc;
      // padding: 10px;
      img.sim-img {
        max-width: 350px;
        width: auto;
        height: auto;
      }
      input {
        width: 100px;
      }
      // img {
      //   // width: 100%;
      //   // height: auto;
      //   &.sim-img {
      //     // height: 100px;
      //   }
      // }

      &.sim-image-td {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }

    &.deleted {
      background-color: #f10101;
      color: #fff;
    }
  }
}

.connect-btn {
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  &.active {
    background-color: #ccc;
  }
}
</style>
