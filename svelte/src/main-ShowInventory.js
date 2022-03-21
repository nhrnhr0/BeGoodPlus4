import ShowInventory from "./ShowInventory.svelte"

const showInventory = new ShowInventory({
    target: document.getElementById("showinventory-target"),
    props: JSON.parse(document.getElementById("showinventory-props").textContent),
                                        //     documentstockenter-props documentstockerenter-props
}); // documentstockenter-target  documentstockerenter-target
export default showInventory;