<script>
export let ALL_PROVIDERS;

export let ALL_COLORS_DICT;
export let ALL_SIZES_DICT;
export let ALL_VERIENTS_DICT;

export let product;

let orderd_entries = [];
$: {
  orderd_entries = product.entries.sort((a, b) => {
    // sort by:
    // ALL_COLORS_DICT[a.color]
    // ALL_SIZES_DICT[a.size]
    // ALL_VERIENTS_DICT[a.varient]
    if (ALL_COLORS_DICT[a.color].color > ALL_COLORS_DICT[b.color].color) return 1;
    if (ALL_COLORS_DICT[a.color].color < ALL_COLORS_DICT[b.color].color) return -1;
    // colors are equal
    if (ALL_SIZES_DICT[a.size].size > ALL_SIZES_DICT[b.size].size) return 1;
    if (ALL_SIZES_DICT[a.size].size < ALL_SIZES_DICT[b.size].size) return -1;
    // sizes are equal
    if (ALL_VERIENTS_DICT[a.varient]?.name == ALL_VERIENTS_DICT[b.varient]?.name) {
      return 0;
    } else if (ALL_VERIENTS_DICT[a.varient]?.name > ALL_VERIENTS_DICT[b.varient]?.name) {
      return 1;
    } else {
      return -1;
    }
  });
}
</script>

<table class="collecting-table table">
  <thead>
    <tr>
      <th> צבע </th>
      <th> מידה </th>
      <th> מודל </th>
      <th> כמות נלקחת </th>
      <th> ספק </th>
    </tr>
  </thead>
  <tbody>
    {#each orderd_entries as entry}
      <tr>
        <td>
          <div class="cell-group">
            <div class="color-box">
              <div class="inner" style="background-color: {ALL_COLORS_DICT[entry.color].color}" />
            </div>
            {ALL_COLORS_DICT[entry.color].name}
          </div>
        </td>
        <td>
          <div class="cell-group">
            {ALL_SIZES_DICT[entry.size].size}
          </div>
        </td>
        <td>
          <div class="cell-group">
            {ALL_VERIENTS_DICT[entry.varient]?.name || ""}
          </div>
        </td><td
          ><div class="cell-group split-cell">
            <div class="div">
              <input type="text" bind:value={entry.sheets_taken_quantity} />
            </div>
            <div
              class="div"
              on:click={() => {
                entry.sheets_taken_quantity = entry.quantity;
              }}
              on:keydown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  entry.sheets_taken_quantity = entry.quantity;
                }
              }}
            >
              / {entry.quantity}
            </div>
          </div>
        </td>
        <td>
          <div class="cell-group">
            <div class="temp" style="width:120px;">
              <input type="text" list="providers-{entry.id}" bind:value={entry.sheets_provider} />
              <datalist id="providers-{entry.id}">
                {#each ALL_PROVIDERS as provider}
                  <option value={provider.label} />
                {/each}
              </datalist>
            </div>
          </div>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
.collecting-table {
  //   width: 100%;
  width: min-content;
  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid #ddd;
  font-size: 14px;
  direction: rtl;
  text-align: center;
  margin: auto;
  margin-bottom: 20px;
  .split-cell {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    .div {
      width: 50%;
    }
  }

  th {
    background-color: #f2f2f2;
    padding: 8px;
  }
  td {
    padding: 8px;
    border-bottom: 1px solid #ddd;
    border: 1px solid #ddd;
  }
  .cell-group {
    display: flex;
    justify-content: center;
    align-items: center;
    // width: 100px;
    :global(.autocomplete.provider-auto-complete) {
      width: 100%;
      direction: rtl;
      text-align: right;
      min-width: 125px;
    }
  }
  input {
    // width: 50px;
    width: 100%;
    text-align: center;
  }
}

.color-box {
  display: flex;
  justify-content: start;
  align-items: center;
  width: max-content;
  .inner {
    margin-left: 15px;
    width: 20px;
    height: 20px;
  }
}
</style>
