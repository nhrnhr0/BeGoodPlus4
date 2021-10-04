import { writable } from 'svelte/store'

export const endpoint = window.location.href.split('/')[0] + '//' + window.location.href.split('/')[2];
export const api_endpoint = endpoint + '/api';
export const modal = writable(null);
export const stockEditModal= writable(null);