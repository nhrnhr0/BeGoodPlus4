
import MorderEdit2 from "./MorderEdit2.svelte"

const morderEdit2 = new MorderEdit2({
    target: document.getElementById("morderedit2-target"),
    props: JSON.parse(document.getElementById("morderedit2-props").textContent),
                                        //     documentstockenter-props documentstockerenter-props
}); // documentstockenter-target  documentstockerenter-target
export default morderEdit2;