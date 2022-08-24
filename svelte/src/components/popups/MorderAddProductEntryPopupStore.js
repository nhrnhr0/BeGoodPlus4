import { writable } from "svelte/store";



let MorderAddProductEntryPopupInitialState = {
    isOpen: false,
    product:undefined
}

function createMorderAddProductEntryStore() {
    const { subscribe, set, update } = writable(MorderAddProductEntryPopupInitialState);

    return {
        subscribe,
        open: (product) => {
            update(state => ({ ...state, isOpen: true, product: product }));
        },
        close: () => {
            update(state => ({ ...state, isOpen: false, product: undefined }));
        },
        
    }
}

export const morderAddProductEntryPopupStore = createMorderAddProductEntryStore();
