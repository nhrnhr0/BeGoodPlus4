


import { writable } from 'svelte/store';

export let editQuantityModalOpener = writable(
    {
        isOpen: false,
        data: null,
    });

