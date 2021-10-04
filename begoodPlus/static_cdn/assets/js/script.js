var all_products;

date_input = document.getElementById("date_inp");
client_name_input = document.getElementById("client_name_inp");
private_company_input = document.getElementById("private_company_inp");
addres_input = document.getElementById("addres_inp");
tel_input = document.getElementById("tel_inp");
email_input = document.getElementById("email_inp");
contact_man_input = document.getElementById("contact_man_inp");
cell_input = document.getElementById("cell_inp");
first_next = document.getElementById("firstNext");

set_autosave(date_input,"date_input_atuosave");
set_autosave(client_name_input,"client_name_input_atuosave");
set_autosave(private_company_input,"private_company_input_atuosave");
set_autosave(addres_input, "addres_input_atuosave");
set_autosave(tel_input, "tel_input_atuosave");
set_autosave(email_input, "email_input_atuosave");
set_autosave(contact_man_input, "contact_man_input_atuosave");
set_autosave(cell_input, "cell_input_atuosave");

function set_autosave(selector, autosave_identifier) {
    if (sessionStorage.getItem(autosave_identifier)) {
        selector.value = sessionStorage.getItem(autosave_identifier);
    }
    selector.addEventListener("change", function() {
        sessionStorage.setItem(autosave_identifier, selector.value);
        console.log(autosave_identifier + ' saved: ' + selector.value);
    });
}

$( document ).ready(function() {
    // init google map api
    var mapAutocomplete = new google.maps.places.Autocomplete(document.getElementById("addres_inp"));
    mapAutocomplete.setComponentRestrictions({'country': ['il']});
    google.maps.event.addListener(mapAutocomplete, 'place_changed', function () {
        // trigger chage event for autosave.
        // addEventListener("change") on called automaticliy on google places api input field
        addres_input.dispatchEvent(new Event('change'));
    });

    // set date:
    var date = Date();
    $('#date').attr("placeholder",date)


    $.ajax({
        url: "products_select",
        success: function(result) {
            all_products = result
            console.log('got all products');
            $(`<button id="new_product_row_btn" class="btn btn-light" type="button" style="width: 100%;height: 100%;">הוסף מוצר</button>`).appendTo($("#new_product_td"))
            // create new table row for product
            $("#new_product_row_btn").click(()=> {
                var product_index = getProductRowIdProvider(); // get uniqe id number for the row
                //var tr = $("#new_product_row_btn").closest('tr').before(markup);
                generate_new_row_table(product_index,$("#new_product_row_btn").closest('tr'))
            });
            console.log(all_products);

        }
    });
});

first_next.addEventListener("click", function(e) {
    e.preventDefault(); 
    checkInputs();
});

function checkInputs() {
    const client_name_input_value       = client_name_input.value.trim();
    const private_company_input_value   = private_company_input.value.trim();
    const addres_input_value            = addres_input.value.trim();
    const tel_input_value               = tel_input.value.trim();
    const email_input_value             = email_input.value.trim();
    const contact_man_input_value       = contact_man_input.value.trim();
    const cell_input_value              = cell_input.value.trim();
    if(client_name_input_value == '') {
        setErrorFor(client_name_input, "לא יכול להיות ריק")
    }else {
        setSuccessFor(client_name_input)
    }
    //if()
}

function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    small.innerText = message;
    formControl.className = 'form-control error';
}

function setSuccessFor(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
}
function toggle_checkbox($, val) {
    if(val == true) {
        $.removeAttr("disabled");
    }else {
        $.attr("disabled", true);
    }
}

function generate_product_options(rowIndex, product, is_copy = false) {
    $("#selectedProductId_"+ rowIndex).val(product.id).trigger("change");
    $("#catalogNumber_" + rowIndex).text(product.catalog).trigger("change");
    toggle_checkbox($("#check_print_" + rowIndex), product.suport_printing);
    toggle_checkbox($("#check_embro_" + rowIndex), product.suport_embroidery);
                
    if(is_copy == false) {
                $.ajax({
                    url: "product_detail/" + product.id, 
                success: function(result){
                    ret = `<select name="size" id="size_select_${rowIndex}">`
                    for(var size in result) {
                        ret += `<option value="${size}">${size}</option>`
                    }
                    ret += `</select>`;
                    $("#size_" + rowIndex).html(ret);
    
                    $('#size_select_' + rowIndex).on('change', function (e) {
                        var valueSelected = this.value;
                        var colors = result[valueSelected];
    
                        ret = `<select id="colorselector_${rowIndex}">`
                        for(var col in colors) {
                            ret += `<option value="${col}"  data-color="${colors[col].color}">${colors[col].cname} </option>`
                        }
                        ret += `</select>`
                        $("#color_" + rowIndex).html(ret);
                        $('#colorselector_' + rowIndex).colorselector();
                    });
    
                    $('#size_select_' + rowIndex).trigger("change");
                }});
    }
}

function onProductSelect(inputIndex, selectedProductId=null) {
    var product = $("#productInput_" + inputIndex).getSelectedItemData();
    var is_copy = false;
    // it's a copy and a original row so can't get selected data.
    if(product == -1) { 
        // in copys the product's id is embedded in a heddn field
        console.log('copy from: ' + selectedProductId);
        product = all_products.products.filter((product) => {return product.id == selectedProductId})[0];
        is_copy = true;
    }

    $("#productInput_" + inputIndex).prop('disabled', true);
    generate_product_options(inputIndex, product, is_copy);
    
    
    
}

function createProductInput(inputIndex) {
    
    var options = {
        /*url: function(phrase) {
            console.log("products_select/" + phrase);
            return "products_select/" + phrase;
        },*/
        data: all_products,
        listLocation: "products",
        matchResponseProperty: "inputPhrase",
        getValue: function(element) {
            return element.name;
        },
        list: {
            maxNumberOfElements: 30,
            //onSelectItemEvent
            onClickEvent: function() {
                onProductSelect(inputIndex);
            },
            
            match: {
                enabled: true
            }
        },
    
        template: {
            type: "custom",
            
            method: function(value, item) {
                return `<div class="d-lg-flex justify-content-lg-end"><img style="padding-left: 25px;" src="${item.image}" width="100px" height="75px" />
                        <div>
                            <h4>${value}</h4><span>${item.content.substring(0,100).padEnd(100)}</span></div>
                        </div>`;
            }
        }
    };
    

    $("#productInput_" + inputIndex).easyAutocomplete(options);
}

var _product_row_id_count = 0;
function getProductRowIdProvider() {
    return _product_row_id_count++;
}

function generate_row_markup(product_index) {
    var markup =    `<tr>
        <td><input style="min-width:270px" id="productInput_${product_index}" class="form-control" type="text" dir="rtl" style="margin-left:0px;font-family:Roboto, sans-serif;" placeholder="הכנס מוצר"></td>
        <td><div id="catalogNumber_${product_index}" ></div></td>
        <td><div id="size_${product_index}"> </div> </td>
        <td><div id="color_${product_index}"></div></td>
        <td><input id="amount_${product_index}" type="number" min="1" max="9999" value="1" class="form-control" /></td>
        
        <td>
            <div>
                <div class="form-check"><input type="checkbox" class="form-check-input" id="check_print_${product_index}" /><label class="form-check-label" for="check_print_${product_index}" style="padding-right: 15px;margin-right: 0;">תפירה</label></div>
                <div class="form-check"><input type="checkbox" class="form-check-input" id="check_embro_${product_index}" /><label class="form-check-label" for="check_embro_${product_index}" style="margin-right: 19.5px;">רקמה</label></div>
            </div>
        </td>
        
        <td>
            <div dir="rtl" class="btn-group" role="group">
                <button class="btn btn-ligth" id="dup_btn_${product_index}" name="dup_btn" value="${product_index}" style="border-radius: 0 !important;border: 1px solid black;" type="button"><i title="שכפל" class="fas fa-copy"></i></button>
                <button class="btn btn-ligth" id="del_btn_${product_index}" name="del_btn" value="${product_index}" style="border-radius: 0 !important;border: 1px solid black;" type="button"><i title="מחק" class="far fa-trash-alt"></i></button>
            </div>
        </td>

        <input id="selectedProductId_${product_index}" type="hidden" />
    </tr>`
    return markup;
}

function copy_product_options(dup_id, orig_id) {
    dup_size = $("#size_select_" + orig_id).clone().prop("id", "size_select_" + dup_id).val($("#size_select_" + orig_id).val());
    $("#size_" + dup_id).html(dup_size);
    
    dup_color = $("#colorselector_" + orig_id).clone().prop("id", "colorselector_" + dup_id).val($("#colorselector_" + orig_id).val());
    $("#color_" + dup_id).html(dup_color);
    $('#colorselector_' + dup_id).colorselector();
    
    $("#amount_" + dup_id).val($("#amount_" + orig_id).val());
    
    $("#check_print_" + dup_id).replaceWith($("#check_print_" + orig_id).clone().prop("id", "check_print_" + dup_id));
    $("#check_embro_" + dup_id).replaceWith($("#check_embro_" + orig_id).clone().prop("id", "check_embro_" + dup_id));
}

function generate_new_row_table(product_index, insert_location) {
    var markup =    generate_row_markup(product_index); // generate html of the row
    insert_location.before(markup);

    createProductInput(product_index);

    $("#dup_btn_" + product_index).click(() => {
        dup_product_index = getProductRowIdProvider();
        generate_new_row_table(dup_product_index, $("#dup_btn_" + product_index).closest('tr'))

        //markup = generate_row_markup(dup_product_index);
        //$("#dup_btn_" + product_index).closest('tr').after(markup);
        //createProductInput(dup_product_index);
        var selectedProduct =   $("#productInput_" + product_index);
        $("#productInput_" + dup_product_index).val(selectedProduct.val()); // copy the input text
        onProductSelect(dup_product_index, $("#selectedProductId_" + product_index).val()); // trigger the selected product on the coyped row
        copy_product_options(dup_product_index, product_index)

    });

    $("#del_btn_" + product_index).click(() => {
        $("#del_btn_" + product_index).closest('tr').remove();
    });

}