import DocumentStockEnter from "./DocumentStockEnter.svelte";

const documentStockEnter = new DocumentStockEnter({
    target: document.getElementById("documentstockenter-target"),
    props: JSON.parse(document.getElementById("documentstockenter-props").textContent),
                                        //     documentstockenter-props documentstockerenter-props
}); // documentstockenter-target  documentstockerenter-target
export default documentStockEnter;