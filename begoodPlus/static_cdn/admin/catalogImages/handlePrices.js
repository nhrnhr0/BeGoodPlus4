var cost_price = document.getElementById("id_cost_price");
        var client_price = document.getElementById("id_client_price");
        var recomended_price = document.getElementById("id_recomended_price")

        var whatsapp_text = document.getElementById("id_whatsapp_text");
        var whatsapp_container = document.getElementsByClassName("field-whatsapp_text")[0];
        whatsapp_container.appendChild(createElementFromHTML('<input style="background:#25D366;" type="button" id="open_whatsapp_btn" onclick="open_whatsapp()" value="send whatsapp"></input>'));
        var last_client_precent_div = undefined;
        var last_recomended_price_div = undefined;
        cost_price.addEventListener('input', (event) => {
            handle_change();
        });
        client_price.addEventListener('input', (event) => {
            handle_change();
        });
        recomended_price.addEventListener('input', (event) => {
            handle_change();
        });
        function handle_change() {
            var cost_price_val = cost_price.value;
            var client_price_val = client_price.value;
            var recomended_price_val = recomended_price.value;
            console.log('cost_price_val', cost_price_val)
            console.log('client_price_val', client_price_val)
            console.log('recomended_price_val', recomended_price_val)

            
            client_precent = ((client_price_val/cost_price_val)-1)*100
            client_precent_clr = client_precent > 0? "green":"red";
            var client_precent_div = createElementFromHTML(`<div id="client_price_precent" style=""><span style="color:${client_precent_clr}">(${client_precent}%)</span></div>`);
            last_client_precent_div = update_or_create_div(client_precent_div, document.getElementsByClassName('field-client_price')[0],last_client_precent_div);

            recomended_precent = ((recomended_price_val/client_price_val)-1)*100
            recomended_precent_clr = recomended_precent > 0? "green":"red";
            var recomended_price_div = createElementFromHTML(`<div id="recomended_price_precent" style=""><span style="color:${recomended_precent_clr}">(${recomended_precent}%)</span></div>`);
            last_recomended_price_div = update_or_create_div(recomended_price_div, document.getElementsByClassName('field-recomended_price')[0], last_recomended_price_div)
            
            //prcent = ((buy / sell) - 1)*100
            //precent_clr ="green" if prcent>0 else "red"
            //return mark_safe(f'<div style="direction: ltr;">{buy:.2f}₪ <span style="color:{precent_clr}">({prcent:.2f}%)</span></div>');#.format(buy, prcent))
        }
        function update_or_create_div(div, parent, last_div) {
            if(last_div != undefined){
                parent.removeChild(last_div)
            }
            last_div = div
            parent.appendChild(div)
            return div;
        }
        function createElementFromHTML(htmlString) {
            var div = document.createElement('div');
            div.innerHTML = htmlString.trim();

            // Change this to div.childNodes to support multiple top-level nodes
            return div.firstChild; 
        }
        function open_whatsapp() {
            var text = whatsapp_text.value;
            console.log('text: ', text)
            window.open(`https://wa.me?text=${encodeURIComponent(text)}`, '_blank');
            console.log('open whatsapp');
        }
        handle_change();