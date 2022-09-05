
import MyMorderEdit from "./MyMorderEdit.svelte"

const myMorderEdit = new MyMorderEdit({
    target: document.getElementById("mymorderedit-target"),
    props: JSON.parse(document.getElementById("mymorderedit-props").textContent),
                                        //     documentstockenter-props documentstockerenter-props
}); // documentstockenter-target  documentstockerenter-target
export default myMorderEdit;