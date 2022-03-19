import { writable } from "svelte/store";
import {apiGetAllSizes} from './../api/api';




export let ALL_SIZES = writable(null);
export let ALL_COLORS= writable(null);
export let ALL_VARIENTS = writable(null);
