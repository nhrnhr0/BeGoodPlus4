import DocumentStockList from "./DocumentStockList.svelte";

const documentStockList = new DocumentStockList({
    target: document.getElementById("documentstocklist-target"),
    props: JSON.parse(document.getElementById("documentstocklist-props").textContent),
                                        //     documentstockenter-props documentstockerenter-props
}); // documentstockenter-target  documentstockerenter-target
export default documentStockList;