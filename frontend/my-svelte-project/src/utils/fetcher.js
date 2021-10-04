import { writable } from 'svelte/store'

const cache = new Map();

export function getData(url) {
  console.log('getData:',url);
  const store = writable(new Promise(() => {}));

  if(cache.has(url)){
    store.set(Promise.resolve(cache.get(url)));
  }

  const load = async () => {
    var data ;
      const response = await fetch(url);
      data = await response.json();
      cache.set(url, data);
      store.set(Promise.resolve(data));
  }

  load();
  return store;
}