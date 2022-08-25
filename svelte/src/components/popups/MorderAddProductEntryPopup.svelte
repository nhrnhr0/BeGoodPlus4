<script>
    import {
        morderAddProductEntryPopupStore
    } from './MorderAddProductEntryPopupStore';
    import {
        fly
    } from 'svelte/transition';
    export let ALL_COLORS;
    export let ALL_SIZES;
    export let ALL_VERIENTS;
    let modal_zIndex = 10;

    let selected_color= undefined;
    let selected_size= undefined;
    let selected_verient= undefined;
    let selected_amount = 1;
    let error_message = '';


    function closeModal() {
        morderAddProductEntryPopupStore.close();
    }

    function add_entry_btn_clicked(e) {
        e.preventDefault();
        if (selected_color == undefined) {
            error_message = 'חייב לבחור צבע';
            return;
        }else if(selected_size == undefined) {
            error_message = 'חייב לבחור מידה';
            return;
        }
        
        console.log('looking for ', selected_size, selected_color, selected_verient, selected_amount, ' in ', $morderAddProductEntryPopupStore.product.entries);
        let entry = $morderAddProductEntryPopupStore.product.entries.find(entry=> entry.size == selected_size && entry.color == selected_color && entry.varient == selected_verient);
        if(entry) {
            entry.quantity = selected_amount;
        }else {
            $morderAddProductEntryPopupStore.product.entries.push({
                size: selected_size,
                color: selected_color,
                varient: selected_verient,
                quantity: selected_amount
            });
        }
        morderAddProductEntryPopupStore.close();
    }
</script>

{#if $morderAddProductEntryPopupStore.isOpen && $morderAddProductEntryPopupStore.product != undefined}
    <div id="singleAmountPopup" style="z-index: {modal_zIndex};" class="modal active">
        <div class="overlay" style="z-index: {modal_zIndex+5};" on:click={closeModal}>
            {#if $morderAddProductEntryPopupStore.isOpen}
            <div class="modal_content" in:fly="{{ y: 200, duration: 200 }}" on:click|stopPropagation="{()=>{}}" style="z-index: {modal_zIndex+10};">
                <div class="modal-header">
                    <button title="Close" on:click={closeModal} class="close-btn right">x</button>
                    <div class="modal-title">ערוך משתנים ל {$morderAddProductEntryPopupStore.product.product.title}</div>
                    <button title="Close" on:click={closeModal} class="close-btn left">x</button>
                    
                </div>
                <div class="modal-body">
                    <input type="hidden" name="product_id" value={$morderAddProductEntryPopupStore.product.product.id} />
                    <input type="hidden" name="entry_id" value={$morderAddProductEntryPopupStore.product.entry_id} />
                        <div class="form-group">
                        <label for="color">צבע</label>
                            <select bind:value={selected_color} class="form-control" name="color" id="color" >
                                <option default value=undefined>בחר צבע</option>
                                {#each ALL_COLORS as color}
                                <option value={color['id']}>{color['name']}</option>
                                {/each}
                            </select>

                        <label for="size">מידה</label>
                            <select bind:value={selected_size} class="form-control" name="size" id="size" >
                                <option default value=undefined>בחר מידה</option>
                                {#each ALL_SIZES.sort((a, b) => {
                                    return a.code.localeCompare(b.code);
                                }) as size}
                                <option value={size['id']}>{size['size']}</option>
                                {/each}
                            </select>

                        <label for="varient">מודל</label>
                            <select bind:value={selected_verient} class="form-control" name="varient" id="varient" >
                                <option default value=undefined>בחר מודל</option>
                                {#each ALL_VERIENTS as varient}
                                <option value={varient['id']}>{varient['name']}</option>
                                {/each}
                            </select>
                        
                        <label for="amount">כמות</label>
                            <input bind:value={selected_amount} class="form-control" type="number" name="amount" id="amount" />
                        </div>
                        {#if error_message != ''}
                            {error_message}
                        {/if}
                    <button on:click={add_entry_btn_clicked} type="submit" class="btn btn-primary">שמור</button>
                </div>
            </div>
            {/if}
            </div>
        </div>
    {/if}



    <style lang="scss">
        @mixin bg-gradient {
    background-color: #edce6a;
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxsaW5lYXJHcmFkaWVudCBpZD0idnNnZyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxMDAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjAlIj48c3RvcCBzdG9wLWNvbG9yPSIjZjlmMjk1IiBzdG9wLW9wYWNpdHk9IjEiIG9mZnNldD0iMCIvPjxzdG9wIHN0b3AtY29sb3I9IiNlMGFhM2UiIHN0b3Atb3BhY2l0eT0iMSIgb2Zmc2V0PSIwLjI1Ii8+PHN0b3Agc3RvcC1jb2xvcj0iI2Y5ZjI5NSIgc3RvcC1vcGFjaXR5PSIxIiBvZmZzZXQ9IjAuNSIvPjxzdG9wIHN0b3AtY29sb3I9IiNlMGFhM2UiIHN0b3Atb3BhY2l0eT0iMSIgb2Zmc2V0PSIwLjc1Ii8+PHN0b3Agc3RvcC1jb2xvcj0iI2Y5ZjI5NSIgc3RvcC1vcGFjaXR5PSIxIiBvZmZzZXQ9IjEiLz48L2xpbmVhckdyYWRpZW50PjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjdnNnZykiIC8+PC9zdmc+);
    background-image: -webkit-gradient(linear, 100% 0%, 0% 0%, color-stop(0, rgb(249, 242, 149)), color-stop(0.25, rgb(224, 170, 62)), color-stop(0.5, rgb(249, 242, 149)), color-stop(0.75, rgb(224, 170, 62)), color-stop(1, rgb(249, 242, 149)));
    /* Android 2.3 */
    background-image: -webkit-repeating-linear-gradient(right, rgb(249, 242, 149) 0%, rgb(224, 170, 62) 25%, rgb(249, 242, 149) 50%, rgb(224, 170, 62) 75%, rgb(249, 242, 149) 100%);
    /* IE10+ */
    background-image: repeating-linear-gradient(to left, rgb(249, 242, 149) 0%, rgb(224, 170, 62) 25%, rgb(249, 242, 149) 50%, rgb(224, 170, 62) 75%, rgb(249, 242, 149) 100%);
    background-image: -ms-repeating-linear-gradient(right, rgb(249, 242, 149) 0%, rgb(224, 170, 62) 25%, rgb(249, 242, 149) 50%, rgb(224, 170, 62) 75%, rgb(249, 242, 149) 100%);
}
.modal {
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 990;
  &.active {
    display:block;
  }
}

.modal .overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 995;
  background: rgba(0,0,0,0.45);
}

.modal .modal_content {
  overscroll-behavior: contain;
  

  z-index: 999;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80%;
  overflow: auto;
  background: #fff;
  box-shadow: 0 1px 5px rgba(0,0,0,0.7);
  border-radius: 4px;
  width: 85%;
  text-align: center;
  .modal-header {
    @include bg-gradient();
    //background: #ffd880;
    padding-top: 0px;
    padding-bottom: 0px;
    display: flex;
    justify-content: space-between;
    .header-logo {
      height: 35px;
      margin: auto;
    }

    .modal-title {
      font-weight: 700;
      font-size: 2.5em;

    }
  }
  .modal-body {
    min-height: 150px;
    background: url('https://res.cloudinary.com/ms-global/image/upload/w_auto,f_auto/v1634461664/msAssets/wall_bg_az5xzl');
    background: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url('https://res.cloudinary.com/ms-global/image/upload/w_auto,f_auto/v1634461664/msAssets/wall_bg_az5xzl');
    background-position: center;
    //background: linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) ),url('../imgs/catalogBg1.jpeg');
    overflow: hidden;
    text-align: right;
  }



  .modal-fotter {
    @include bg-gradient();
    //max-height: 10%;
    display: flex;
    flex-direction: row;

    .header-logo {
      height: 35px;
    }

    .modal-title {
      font-weight: 700;
      font-size: 2.5em;
    }
  }
}
    </style>