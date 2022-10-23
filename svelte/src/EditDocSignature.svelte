<script>
import { onMount } from "svelte";
import {
  apiGetAllColors,
  apiGetAllSizes,
  apiGetAllVariants,
  fetch_wraper,
} from "./api/api";
import { API_EDIT_DOC_SIGNATURE } from "./consts/consts";
import SvelteMarkdown from "svelte-markdown";
import { Loading } from "carbon-components-svelte";

export let uuid;
let ALL_SIZES, ALL_COLORS, ALL_VARIENTS;
let data;
let saveing = false;

onMount(async () => {
  // request api-edit-doc-signature/<uuid:uuid>
  /**
   * {
        "uuid": "6584772a-71de-466e-95e5-1d4b7e335549",
        "client_name": "שי גארדן",
        "status": "Draft",
        "items": [
        {
        "name": "דגמ\"ח 7 כיסים מחוזק",
        "description": "* דגמ\"ח איכותי 100% כותנה\r\n*  7 כיסים כולל כיס רוכסן\r\n* מתאים לכל סוגי העבודה",
        "cimage": "https://res.cloudinary.com/ms-global/image/upload/v1660551503/site/products/photo_2022-08-15_09-49-15-removebg-preview",
        "price": "50.00",
        "show_details": true,
        "details": [
        {
        "quantity": 1,
        "color_id": 77,
        "color_name": "שחור",
        "size_id": 104,
        "size_code": "ak",
        "size_name": "46",
        "varient_id": 12,
        "varient_name": "עם גומי"
        },
        {
        "quantity": 1,
        "color_id": 81,
        "color_name": "אפור כהה",
        "size_id": 104,
        "size_code": "ak",
        "size_name": "46",
        "varient_id": 12,
        "varient_name": "עם גומי"
        }
        ]
        },
        {
        "name": "מגף איגל",
        "description": "* עור מעובד איכותי וייצוגי\r\n* אפשרות לרמות הגנה שונות\r\n* 02 -- נעל קלה עם תפרים מחוזקים מתאימה לכל סוגי העבודות \r\n* S3 – כיפת מגן מברזל, שכבת נירוסטה לאורך הסוליה",
        "cimage": "https://res.cloudinary.com/ms-global/image/upload/v1635672269/site/products/%D7%9E%D7%92%D7%A3_%D7%90%D7%99%D7%92%D7%9C_DMqWwOX_Mkw9lcY_BvEiz4P_Cjtf4wS_sK7Cy0d_sgRVKb3.png",
        "price": "100.00",
        "show_details": true,
        "details": [
        {
        "quantity": 1,
        "color_id": 77,
        "color_name": "שחור",
        "size_id": 105,
        "size_code": "al",
        "size_name": "47",
        "varient_id": 1,
        "varient_name": "02"
        }
        ]
        }
        ]
        }
  */
  let tempData = await fetch_wraper(`${API_EDIT_DOC_SIGNATURE}/${uuid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  ALL_SIZES = await apiGetAllSizes();
  apiGetAllColors().then((res) => {
    ALL_COLORS = res;
  });
  apiGetAllVariants().then((res) => {
    ALL_VARIENTS = res;
  });
  tempData.items.forEach((item) => {
    item.details_pivot = create_pivot_table(item.details);
  });

  data = tempData;
});
$: {
  console.log("$:", data?.items);
  (data?.items || []).forEach((item) => {
    item.details_pivot = create_pivot_table(item.details);
  });
}
function create_pivot_table(details) {
  console.log("create_pivot_table", details);
  /*data = {{
        "quantity": 1,
        "color_id": 77,
        "color_name": "שחור",
        "size_id": 104,
        "size_code": "ak",
        "size_name": "46",
        "varient_id": 12,
        "varient_name": "עם גומי"
        },
        {
        "quantity": 1,
        "color_id": 81,
        "color_name": "אפור כהה",
        "size_id": 104,
        "size_code": "ak",
        "size_name": "46",
        "varient_id": 12,
        "varient_name": "עם גומי"
        }}*/
  let pivot_table = {};
  /*
  example output table:
        color | varient   | 45
        שחור | עם גומי | 1
        אפור כהה | עם גומי | 1
    */
  console.log(details);
  let sizes_set = new Set();
  let colors_set = new Set();
  let varients_set = new Set();

  details.forEach((detail) => {
    sizes_set.add(detail.size_id);
    colors_set.add(detail.color_id);
    varients_set.add(detail.varient_id);
  });
  let sizes = Array.from(sizes_set);
  // order sizes by size.code
  sizes.sort((a, b) => {
    let size_a = ALL_SIZES.find((size) => size.id === a);
    let size_b = ALL_SIZES.find((size) => size.id === b);
    return size_b.code.localeCompare(size_a.code);
  });
  let colors = Array.from(colors_set);

  let varients = Array.from(varients_set);
  pivot_table["sizes"] = sizes;
  pivot_table["colors"] = colors;
  pivot_table["varients"] = varients;
  return pivot_table;
}

function handleQuantityChange(e) {
  let quantity = e.target.value;
  let color_id = e.target.dataset.color;
  let size_id = e.target.dataset.size;
  let varient_id = e.target.dataset.varient;
  let item_name = e.target.dataset.item;
  let item = data.items.find((item) => item.name === item_name);
  console.log(
    "looking for details",
    color_id,
    size_id,
    varient_id,
    " in ",
    item.details
  );
  let detail = item.details.find(
    (detail) =>
      detail.color_id == color_id &&
      detail.size_id == size_id &&
      detail.varient_id == varient_id
  );
  quantity = parseFloat(quantity);
  detail.quantity = quantity;
  data = { ...data };
}

function handleImageUpload(e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  let item_id = e.target.dataset.item;
  let item = data.items.find((item) => item.id == item_id);

  reader.onload = function (e) {
    let image = e.target.result;

    item.cimage = image;
    console.log("image", image);
    data = { ...data };
  };
  reader.readAsDataURL(file);
}

function submit_btn_clicked(e) {
  saveing = true;
  // e.preventDefault();
  console.log("submitting data", data);
  fetch_wraper(`${API_EDIT_DOC_SIGNATURE}/${uuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      saveing = false;
      if (res.status === "ok") {
        //reload
        window.location.reload();
      } else {
        alert("המסמך לא נשמר בהצלחה");
      }
      // if (res.status === 200) {
      //   alert("המסמך נשמר בהצלחה");
      // } else {
      //   alert("התרחשה שגיאה בשמירת המסמך");
      // }
    })
    .catch((err) => {
      saveing = false;
      alert("התרחשה שגיאה בשמירת המסמך");
    });
}
</script>

{#if data}
  <main>
    <h1>סיכום עיסקה</h1>
    <form action="POST">
      <div>
        <label for="client_name">שם הלקוח</label>
        <input
          type="text"
          name="client_name"
          id="client_name"
          bind:value={data.client_name}
        />
      </div>
      <div>
        <label for="status">סטטוס</label>
        <select name="status" id="status" bind:value={data.status}>
          <option value="Draft">טיוטה</option>
          <option value="Published">פומבי</option>
          <option value="Signed">נחתם</option>
        </select>
      </div>
      <table class="items">
        <thead>
          <tr>
            <th> תמונה </th>
            <th> שם </th>
            <th> כמות כוללת </th>
            <th> מחיר ליח </th>
            <th> תיאור </th>
            <th> פירוט </th>
          </tr>
        </thead>
        <tbody>
          {#each data.items as item}
            <tr>
              <td
                on:click={document
                  .querySelector(`#selectedFile-${item.id}`)
                  .click()}
              >
                <input
                  type="file"
                  id="selectedFile-{item.id}"
                  style="display: none;"
                  data-item={item.id}
                  on:change={handleImageUpload}
                />
                <img
                  width="50px"
                  height="50px"
                  src={item.cimage}
                  alt={item.name}
                />
              </td>
              <td>
                <input type="text" bind:value={item.name} />
              </td>

              <td>
                {item.details.reduce(
                  (acc, detail) => acc + (detail.quantity || 0),
                  0
                )}
              </td>
              <td
                on:click={(e) => {
                  // prompt to change price
                  let new_price = prompt("הכנס מחיר חדש", item.price);
                  if (new_price != null) {
                    item.price = new_price;
                  }
                }}
              >
                {item.price}₪
              </td>
              <td
                class="description-td"
                class:editing={item.edit_description}
                on:click={() => {
                  if (
                    item.edit_description == undefined ||
                    item.edit_description == false
                  ) {
                    if (
                      item.edit_description_timestamp &&
                      Date.now() - item.edit_description_timestamp < 150
                    ) {
                    } else {
                      item.edit_description = true;
                    }
                  }
                  setTimeout(() => {
                    document.querySelector(`#description-${item.id}`).focus();
                  }, 0);
                }}
              >
                <div class="description-wraper">
                  <SvelteMarkdown source={item.description} />
                  {#if item?.edit_description}
                    <div class="editing-wraper">
                      <textarea
                        id="description-{item.id}"
                        bind:value={item.description}
                        rows="5"
                        cols="50"
                        on:blur={() => {
                          item.edit_description = false;
                          item.edit_description_timestamp = Date.now();
                        }}
                      />
                      <!-- <button
                      on:click={(e) => {
                        item.edit_description = false;
                        e.stopPropagation();
                        e.preventDefault();
                      }}>סיום</button -->
                      >
                    </div>
                  {/if}
                </div>
              </td>
              <td class="borderless" colspan="2">
                <!-- button of eye svg, binded to item.show_details bool -->
                <button
                  type="button"
                  on:click={() => (item.show_details = !item.show_details)}
                >
                  {#if item.show_details}
                    <img
                      src="/static/shown-icon.png"
                      width="50px"
                      height="50px"
                    />
                  {:else}
                    <img
                      src="/static/hidden-icon.png"
                      width="50px"
                      height="50px"
                    />
                  {/if}
                </button>
              </td>
              <td
                colspan="3"
                class="details-td"
                class:blured={!item.show_details}
              >
                {#if item.details_pivot}
                  <table class="details">
                    <thead>
                      <tr>
                        <th colspan="2"> צבע / מודל</th>
                        {#each item.details_pivot["sizes"] as size_id}
                          <th>
                            {ALL_SIZES.find((v) => v.id == size_id)?.size}</th
                          >
                        {/each}
                      </tr>
                    </thead>
                    <tbody>
                      {#each item.details_pivot["colors"] as color_id}
                        {#each item.details_pivot["varients"] as varient}
                          <tr>
                            <td>
                              {item.details.find((v) => v.color_id == color_id)
                                .color_name}
                            </td>
                            <td>
                              {item.details.find((v) => v.varient_id == varient)
                                ?.varient_name || ""}
                            </td>
                            {#each item.details_pivot["sizes"] as size_id}
                              <td>
                                <!-- {#if item.details.find((v) => v.color_id == color_id && v.size_id == size_id && v.varient_id == varient)} -->
                                <input
                                  type="number"
                                  step="1"
                                  value={item.details.find(
                                    (v) =>
                                      v.color_id == color_id &&
                                      v.size_id == size_id &&
                                      v.varient_id == varient
                                  )?.quantity || ""}
                                  data-color={color_id}
                                  data-size={size_id}
                                  data-varient={varient}
                                  data-item={item.name}
                                  on:change={handleQuantityChange}
                                />
                                <!-- {/if} -->
                              </td>
                            {/each}
                          </tr>
                        {/each}
                        <!-- <td>
                            {item.details.find((v) => v.color_id == color_id)
                              .varient_name}
                          </td>
                          {#each item.details_pivot["sizes"] as size_id}
                            <td>
                              <div class="cell-wraper">
                                <input
                                  type="number"
                                  data-item={item.name}
                                  data-color={color_id}
                                  data-size={size_id}
                                  value={item.details.find(
                                    (v) =>
                                      v.color_id == color_id &&
                                      v.size_id == size_id
                                  ).quantity}
                                  on:change={handleQuantityChange}
                                />
                              </div>
                            </td>
                          {/each} -->
                      {/each}
                    </tbody>
                  </table>
                  {#if ALL_COLORS && ALL_SIZES && ALL_VARIENTS}
                    <div class="add-new-detail">
                      <select class="color-select">
                        <option value="">בחר צבע</option>
                        {#each ALL_COLORS as color}
                          <option value={color.id}>{color.name}</option>
                        {/each}
                      </select>
                      <select class="size-select">
                        <option value="">בחר מידה</option>
                        {#each ALL_SIZES as size}
                          <option value={size.id}>{size.size}</option>
                        {/each}
                      </select>
                      <select class="varient-select">
                        <option value="">בחר מודל</option>
                        {#each ALL_VARIENTS as varient}
                          <option value={varient.id}>{varient.name}</option>
                        {/each}
                      </select>

                      <input
                        type="number"
                        step="1"
                        value=""
                        class="quantity-input"
                      />

                      <button
                        type="button"
                        on:click={(e) => {
                          // get the closest .color-select and .size-select and .varient-select
                          const color_select = e.target
                            .closest(".add-new-detail")
                            .querySelector(".color-select");
                          const varient_select = e.target
                            .closest(".add-new-detail")
                            .querySelector(".varient-select");
                          const size_select = e.target
                            .closest(".add-new-detail")
                            .querySelector(".size-select");
                          // get the value of the selected option
                          const color_id = color_select.value;
                          const varient_id = varient_select.value;
                          const size_id = size_select.value;

                          // if color is not selected, or size is not selected alert the user and return
                          if (!color_id || !size_id) {
                            alert("יש לבחור צבע ומידה");
                            return;
                          }

                          // get the closest .quantity-input
                          const quantity_input = e.target
                            .closest(".add-new-detail")
                            .querySelector(".quantity-input");
                          // get the value of the input
                          const quantity = quantity_input.value;
                          // if quantity is not a number, alert the user and return
                          if (isNaN(quantity)) {
                            alert("יש להזין מספר");
                            return;
                          }

                          // if the detail already exists, update the quantity
                          if (
                            item.details.find(
                              (v) =>
                                v.color_id == color_id &&
                                v.size_id == size_id &&
                                v.varient_id == varient_id
                            )
                          ) {
                            item.details.find(
                              (v) =>
                                v.color_id == color_id &&
                                v.size_id == size_id &&
                                v.varient_id == varient_id
                            ).quantity += quantity;
                          } else {
                            //color_id :  81 color_name :  "אפור כהה" id :  98 quantity :  1 size_code :  "ak" size_id :  104 size_name :  "46" varient_id :  12 varient_name :  "עם גומי"
                            // add the new detail to the item
                            const curr_size = ALL_SIZES.find(
                              (v) => v.id == size_id
                            );
                            const curr_color = ALL_COLORS.find(
                              (v) => v.id == color_id
                            );
                            const curr_varient = ALL_VARIENTS.find(
                              (v) => v.id == varient_id
                            );
                            item.details.push({
                              id: null,
                              color_id: parseInt(color_id),
                              color_name: curr_color.name,
                              size_id: parseInt(size_id),
                              size_name: curr_size.size,
                              size_code: curr_size.code,
                              varient_id:
                                varient_id == null ||
                                varient_id == "" ||
                                varient_id.toString() == "NaN"
                                  ? ""
                                  : parseInt(varient_id),
                              varient_name: curr_varient?.name,
                              quantity: parseInt(quantity),
                            });
                          }
                          debugger;
                          item.details = [...item.details];
                        }}
                      >
                        הוסף פריט חדש
                      </button>
                    </div>
                  {/if}
                  <!-- all colos all variants all sizes -->
                {/if}
              </td>
            </tr>
            <tr class="details-tr" />
          {/each}
        </tbody>
      </table>
    </form>
    <button disabled={saveing} class="submit-btn" on:click={submit_btn_clicked}>
      {#if saveing}
        שומר...
      {:else}
        שמירה
      {/if}
    </button>
  </main>
{/if}

<style lang="scss">
.submit-btn {
  border: none;
  position: sticky;
  bottom: 10px;
  right: 0px;

  height: 50px;
  width: 200px;
  background-color: #eaa852;

  font-size: 1.5em;
  font-weight: bold;
  color: #000;

  // disabled
  &:disabled {
    background-color: #ccc;
  }
}

table.details {
  thead {
    tr {
      th {
        text-align: center;
        border-bottom: 1px solid rgb(85, 85, 85);
        border-left: 1px solid rgb(85, 85, 85);
        max-width: 95px;
        &:last-child {
          border-left: none;
        }
      }
    }
  }
  tbody {
    tr {
      td {
        input {
          &:not(:placeholder-shown) {
            //border:1px solid pink;
            background: #f5f5f5;
            color: black;
          }

          /* webkit solution */
          ::-webkit-input-placeholder {
            text-align: center;
          }
          /* mozilla solution */
          input:-moz-placeholder {
            text-align: center;
          }
          &:focus {
            background-color: rgb(37, 37, 37);
            color: white;
            &:placeholder {
              color: white;
            }
          }

          //border: 1px solid rgb(85, 85, 85);
          //   min-width: 48px;
          width: 90%;
          //width: max-content;
          text-align: center;
          //border: 1px solid #777777;
          //border:none;
          //border-right: 1px solid rgb(85, 85, 85);
          //border-left: 1px solid rgb(85, 85, 85);

          //border-radius: 5px;
          background: none;
          padding: 5px;
          border: none;
          margin: auto;
          &:focus {
            outline: none;
          }
        }
      }
    }
  }
}
main {
  position: relative;
  h1 {
    text-align: center;
  }
  direction: rtl;
  text-align: right;
  form {
    display: flex;
    flex-direction: column;
    div {
      display: flex;
      flex-direction: row;
      label {
        margin-bottom: 0.5rem;
      }
      input {
        margin-bottom: 1rem;
      }
    }
    table {
      //   margin-top: 50px;
      //   margin-bottom: 50px;
      border-collapse: collapse;
      border: 1px solid black;
      thead {
        tr {
          th {
            border: 1px solid black;
          }
        }
      }
      tbody {
        tr {
          td {
            border: 1px solid black;
          }
        }
      }
    }

    table.items {
      tr {
        position: relative;
        td.borderless {
          border: none;
        }

        td.details-td {
          position: relative;
          &.blured {
            &::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 0;
            }
          }
        }

        td.description-td {
          margin: 5px;
          padding: 5px;
          .description-wraper {
            max-width: 300px;
            overflow: scroll;
            text-overflow: ellipsis;
            white-space: nowrap;
            :global(ul) {
              margin-block-start: 0.3em;
              margin-block-end: 0.3em;
            }
          }
          .editing-wraper {
            position: absolute;
            top: -100%;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 100;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          &.editing {
            max-width: 100%;
            overflow: visible;
            white-space: normal;
          }
        }
      }
      //strip:
      tr:nth-child(odd) {
        background-color: #f2f2f2;
      }
    }
  }
}
</style>
