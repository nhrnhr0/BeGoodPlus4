
import MorderEdit from "./MorderEdit.svelte"

const morderEdit = new MorderEdit({
    target: document.getElementById("morderedit-target"),
    props: JSON.parse(document.getElementById("morderedit-props").textContent),
                                        //     documentstockenter-props documentstockerenter-props
}); // documentstockenter-target  documentstockerenter-target
export default morderEdit;