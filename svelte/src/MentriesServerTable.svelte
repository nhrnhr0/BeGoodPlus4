<script>
import { Form } from "carbon-components-svelte";
import { apiGetAllSizes } from "./api/api";

export let product;

export let ALL_SIZES;
// export let ALL_COLORS;
export let ALL_VERIENTS;
let sizes_ids_set = new Set();
let colors_ids_set = new Set();
let verients_ids_set = new Set();
let sorted_sizes = [];
let sorted_colors = [];
let sorted_verients = [];
export let ALL_COLORS_DICT = undefined;
export let ALL_SIZES_DICT = undefined;

$: {
  product.entries;
  let sizes_temp_set = new Set();
  let colors_temp_set = new Set();
  let verients_temp_set = new Set();
  // add product.colors to colors_ids_set
  if (product.product.show_sizes_popup) {
    for (let color_id of product.colors) {
      //console.log('adding color_id:', color_id);
      colors_temp_set.add(color_id);
    }

    // add product.sizes to sizes_ids_set
    for (let size_id of product.sizes) {
      //console.log('adding size_id:', size_id);
      sizes_temp_set.add(size_id);
    }

    // add product.varients to varients_ids_set
    for (let verient_id of product.verients) {
      //console.log('adding verient_id:', verient_id);
      verients_temp_set.add(verient_id);
    }
    // if a product should not have size and colors table, and entries are empty
    // insert the defult no-color one-size
  } else if (product.entries.length == 0) {
    const DEFULT_COLOR = {
      id: 76,
      name: "no color",
      color: "#FFFFFF00",
      code: "00",
    };
    const DEFULT_SIZE = {
      id: 86,
      size: "one size",
      code: "cc",
    };
    colors_temp_set.add(DEFULT_COLOR.id);
    sizes_temp_set.add(DEFULT_SIZE.id);
  }
  for (let entry of product.entries) {
    sizes_temp_set.add(entry.size);
    colors_temp_set.add(entry.color);
    verients_temp_set.add(entry.varient);
  }
  // order sizes_ids_set by code
  // sizes_ids_set: [1,2,7,3]
  // ALL_SIZES: [{id:1, code: '3'}, {id:2, code: '4'}, {id:7, code: '2'}, {id:3, code: '1'}]
  let ALL_SIZES_ordered = ALL_SIZES.sort((a, b) => {
    return a.code.localeCompare(b.code);
  });
  //console.log('ALL_SIZES_ordered:', ALL_SIZES_ordered);
  //console.log('sizes_ids_set:', sizes_ids_set);
  let sorted_sizes_temp = [];
  for (let size of ALL_SIZES_ordered) {
    if (sizes_temp_set.has(size.id)) {
      sorted_sizes_temp.push(size);
    }
  }
  sorted_sizes = [...sorted_sizes_temp.reverse()];
  //console.log('sorted_sizes:', sorted_sizes);

  sorted_colors = [...colors_temp_set];

  sorted_verients = [...verients_temp_set].filter((v) => v != null).map((ver_id) => ALL_VERIENTS.find((ver) => ver.id == ver_id));
}
function input_amount_changed(e) {
  let el = e.target;
  let size_id = el.dataset.size;
  let color_id = el.dataset.color;
  let verient_id = el.dataset.ver;
  size_id = parseInt(size_id);
  color_id = parseInt(color_id);
  verient_id = verient_id ? parseInt(verient_id) : null;
  let quantity = el.value;
  //console.log('input_amount_changed:', size_id, color_id, verient_id, quantity);
  let found = false;
  product.entries.forEach((entry) => {
    if (entry.size == size_id && entry.color == color_id && entry.varient == verient_id) {
      entry.quantity = quantity;
      found = true;
    }
  });
  if (!found) {
    product.entries.push({
      id: null,
      size: size_id,
      color: color_id,
      varient: verient_id,
      quantity: quantity,
    });
  }
  console.log("input_amount_changed", found, size_id, color_id, verient_id, quantity);
  product.entries = [...product.entries];
}

function find_entry_quantity(size, color, verient) {
  for (let entry of product.entries) {
    if (entry.size == size && entry.color == color && entry.varient == verient) {
      return entry.quantity;
    }
  }
  return undefined;
}
function clear_sizes_entries(color_key) {
  let clear_entries = product.entries.filter((v) => v.color == color_key);
  // console.log('removing ', clear_entries, ' out of ', product.entries);
  clear_entries.forEach((cell) => {
    let query =
      `#entries-table-${product.id} .size-input[data-color='${cell.color}'][data-size='${cell.size}']` +
      (sorted_verients.length > 0 ? `[data-ver='${cell.varient}']` : "");

    let el = document.querySelector(query);
    // console.log('query: ', query, ' el ', el);
    if (el) {
      el.value = "";
      var event = new Event("change");
      el.dispatchEvent(event);
    }
    //cell.quantity = 0;
  });
  //console.log(clear_entries);
  //TODO: go over this function
  // if (productInfo?.show_sizes_popup) {
  //     if (productInfo.varients.length == 0) {
  //         let sizeKeys = Object.keys(mentries[color_key]);
  //         for (let size_index = 0; size_index < sizeKeys.length; size_index++) {
  //             mentries[color_key][sizeKeys[size_index]] = {
  //                 quantity: undefined
  //             };
  //         }
  //     } else {
  //         let sizeKeys = Object.keys(mentries[color_key]);
  //         for (let size_index = 0; size_index < sizeKeys.length; size_index++) {
  //             let verientsKeys = Object.keys(mentries[color_key][sizeKeys[size_index]]);
  //             for (let i = 0; i < verientsKeys.length; i++) {
  //                 mentries[color_key][sizeKeys[size_index]][verientsKeys[i]] = {
  //                     quantity: undefined
  //                 };
  //             }
  //             //$cartStore[product_id].mentries[color_key][sizeKeys[size_index]] = {quantity: undefined};
  //         }
  //     }
  // } else {
  //     mentries[color_key] = undefined;
  // }
}
</script>

{#if ALL_COLORS_DICT && ALL_SIZES_DICT}
  {#if sorted_verients.length == 0 && sorted_colors.length == 1 && sorted_sizes.length == 1}
    <div class="single-input-wraper">
      <input
        on:change={input_amount_changed}
        value={find_entry_quantity(sorted_sizes[0].id, sorted_colors[0], null)}
        class="size-input cls-cell"
        style="border: 2px solid {ALL_COLORS_DICT[sorted_colors[0]]?.color};"
        data-color={sorted_colors[0]}
        data-size={sorted_sizes[0].id}
        data-ver={null}
        type="number"
        placeholder={ALL_SIZES_DICT[sorted_sizes[0].id].size}
        min="0"
        max="9999"
      />
    </div>
  {:else}
    <table class="entries-table" id="entries-table-{product.id}">
      <thead>
        <tr>
          <th class="sticky-col const-size-cell">צבע</th>
          {#if sorted_verients.length != 0}
            <th class="const-size-cell">מודל</th>
          {/if}
          {#each sorted_sizes as size}
            <th>
              {size.size}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each sorted_colors as color, color_idx}
          <tr>
            <td class="sticky-col">
              {#if color}
                <div class="color-box">
                  <div class="inner" style="background-color: {ALL_COLORS_DICT[color].color}" />
                  {ALL_COLORS_DICT[color].name}
                </div>
              {:else}
                <div>-</div>
              {/if}
            </td>

            {#if sorted_verients.length != 0}
              <td>
                {#each sorted_verients as varient}
                  <div class="varient-box cls-cell">
                    {varient?.name || ""}
                  </div>
                {/each}
              </td>
            {/if}
            {#each sorted_sizes as size_obj}
              <td class="size-cell">
                <!-- sorted_verients <pre>{JSON.stringify(sorted_verients)}</pre> -->
                {#if sorted_verients.length == 0}
                  <div class="cell-wraper">
                    <input
                      on:change={input_amount_changed}
                      value={find_entry_quantity(size_obj.id, color, null)}
                      class="size-input cls-cell"
                      style="border: 2px solid {ALL_COLORS_DICT[color]?.color};"
                      data-color={color}
                      data-size={size_obj.id}
                      data-ver={null}
                      type="number"
                      placeholder={ALL_SIZES_DICT[size_obj.id].size}
                      min="0"
                      max="9999"
                    />
                  </div>
                {:else}
                  {#each sorted_verients as ver, idx}
                    <div class="cell-wraper">
                      <input
                        on:change={input_amount_changed}
                        value={find_entry_quantity(size_obj.id, color, ver?.id || null)}
                        style="border: 2px solid {ALL_COLORS_DICT[color]?.color}"
                        data-color={color}
                        data-size={size_obj.id}
                        data-ver={ver?.id || null}
                        class="size-input cls-cell"
                        type="number"
                        placeholder="{ALL_SIZES_DICT[size_obj.id].size}({ver?.name || ''})"
                        min="0"
                        max="9999"
                      />
                    </div>
                  {/each}
                {/if}
              </td>
            {/each}

            <td class="total-cell">
              {#if sorted_verients.length == 0}
                <div class="center-text">
                  {product.entries
                    .filter((v) => v.color == color)
                    .reduce((acc, curr) => {
                      return acc + parseInt(curr.quantity || "0");
                    }, 0)}
                </div>
              {:else}
                {#each sorted_verients as ver, idx}
                  <div class="center-text">
                    ({product.entries
                      .filter((v) => v.color == color && v.varient == ver.id)
                      .reduce((acc, curr) => {
                        return acc + parseInt(curr.quantity || "0");
                      }, 0)})
                  </div>
                {/each}
              {/if}
            </td>

            <td class="delete-cell-style">
              <button class="remove-button" on:click={clear_sizes_entries(color)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 32 36"
                  ><path
                    fill="currentColor"
                    d="M30.9 2.3h-8.6L21.6 1c-.3-.6-.9-1-1.5-1h-8.2c-.6 0-1.2.4-1.5.9l-.7 1.4H1.1C.5 2.3 0 2.8 0 3.4v2.2c0 .6.5 1.1 1.1 1.1h29.7c.6 0 1.1-.5 1.1-1.1V3.4c.1-.6-.4-1.1-1-1.1zM3.8 32.8A3.4 3.4 0 0 0 7.2 36h17.6c1.8 0 3.3-1.4 3.4-3.2L29.7 9H2.3l1.5 23.8z"
                  /></svg
                >
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <td />
        <!--colors filler -->
        <!--verient filler -->
        {#if product.verients.length > 0}
          <td />
        {/if}
        {#each sorted_sizes as size}
          <td class="total-cell">
            {product.entries
              .filter((v) => v.size == size.id)
              .reduce((acc, curr) => {
                return acc + parseInt(curr.quantity || "0");
              }, 0)}
          </td>
        {/each}

        <td class="total-cell full-total">
          {product.entries.reduce((acc, curr) => {
            return acc + parseInt(curr.quantity || "0");
          }, 0)}
        </td>
      </tfoot>
    </table>
  {/if}
  <!-- {:else}
        <div class="single-input-wraper">
            <label for="single-amount-input">כמות: </label>
            <input name="single-amount-input" class="size-input cls-cell" tpye="number" placeholder="כמות" data-color="{76}" data-size="{86}" data-ver={null} on:change="{input_amount_changed}" value={find_entry_quantity(108, 76, null)} />
        </div>
    {/if} -->
{/if}

<style lang="scss">
.center-text {
  padding: 4px;
  font-weight: bold;
  text-align: center;
}
.total-cell {
  font-weight: 700;
  background-color: #5f5f5fe0;
  outline: 1px solid black;
  padding: 3px;
  margin: 2px;
  text-align: center;
  color: white;
  &.full-total {
    background-color: #8a8989e0;
  }
}
.single-input-wraper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.size-input {
  &::placeholder {
    color: rgb(207, 205, 205);
    opacity: 0.5;
  }
}
table.entries-table {
  font-size: 12px;
  thead {
    tr {
      th {
        text-align: center;
      }
    }
  }
  width: auto;
  margin: auto;
  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  input {
    font-weight: bold;
    font-size: 12px;
    text-align: center;
  }

  border: 1px solid #777777;
  //width: 100%;
  margin: auto;
  border-spacing: 0;
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
      th.size-header {
        text-align: center;
        border-bottom: 1px solid rgb(85, 85, 85);
        border-left: 1px solid rgb(85, 85, 85);

        &:last-child {
          border-left: none;
        }
      }
    }
  }
  tbody {
    tr {
      td {
        .varient-box {
          font-weight: bold;
          width: 100%;
          text-align: center;

          background: none;
          padding: 5px;
        }
        &.size-cell {
          & .cell-wraper {
            display: grid;
            grid-template-columns: 1fr;
            border: 1px solid black;
            max-width: 95px;
          }
          input.size-input:first-child {
            &:last-child {
              border-left: none;
            }
          }
          input.size-input {
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
            min-width: 48px;
            width: 100%;
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
            &.has-focus-error {
              &:hover {
                background-color: #2b2a2a;
              }
            }
            &:focus {
              outline: none;
            }
            /*&::-webkit-outer-spin-button,
                    &::-webkit-inner-spin-button {
                      -webkit-appearance: none;
                      margin: 0;
                    }*/
          }
        }
        .remove-button {
          background: none;
          border: none;
          padding: 0;
          margin: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          svg {
            width: 16px;
            height: 16px;
            fill: #777777;
          }
          &:hover {
            svg {
              path {
                color: #cc0000;
              }
            }
          }
        }
        .color-box {
          display: flex;
          justify-content: start;
          align-items: center;
          width: max-content;
          .inner {
            margin-left: 15px;
            width: 25px;
            height: 25px;
          }
        }
      }
    }
  }
}
</style>
