$(document).ready(function () {

    var current_fs, next_fs, previous_fs; //fieldsets
    var opacity;
    var current = 1;
    var steps = $("fieldset").length;

    setProgressBar(current);

    $(".next").click(function () {
        var is_pass = checkInputs(current);
        if (is_pass) {
            current_fs = $(this).parent();
            next_fs = $(this).parent().next();

            //Add Class Active
            $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

            //show the next fieldset
            next_fs.show();
            //hide the current fieldset with style
            current_fs.animate({
                opacity: 0
            }, {
                step: function (now) {
                    // for making fielset appear animation
                    opacity = 1 - now;

                    current_fs.css({
                        'display': 'none',
                        'position': 'relative'
                    });
                    next_fs.css({
                        'opacity': opacity
                    });
                },
                duration: 500
            });
            setProgressBar(++current);
        }
    });

    $(".previous").click(function () {

        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        //Remove class active
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

        //show the previous fieldset
        previous_fs.show();

        //hide the current fieldset with style
        current_fs.animate({
            opacity: 0
        }, {
            step: function (now) {
                // for making fielset appear animation
                opacity = 1 - now;

                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                previous_fs.css({
                    'opacity': opacity
                });
            },
            duration: 500
        });
        setProgressBar(--current);
    });

    function setProgressBar(curStep) {
        var percent = parseFloat(100 / steps) * curStep;
        percent = percent.toFixed();
        $(".progress-bar")
            .css("width", percent + "%")
    }

    $(".submit").click(function () {
        return false;
    })

});



// -------------- form submit validation ----------------------
//const form = document.getElementById('form');
const client_name_input = document.getElementById("client_name_inp");
const private_company_input = document.getElementById("private_company_inp");
const addres_input = document.getElementById("addres_inp");
const tel_input = document.getElementById("tel_inp");
const email_input = document.getElementById("email_inp");
const contact_man_input = document.getElementById("contact_man_inp");
const cell_input = document.getElementById("cell_inp");

function checkInputs1_clientInfo() {
    // trim to remove the whitespaces
    const client_name_inputValue = client_name_input.value.trim();
    const private_company_inputValue = private_company_input.value.trim();
    const addres_inputValue = addres_input.value.trim();
    const tel_inputValue = tel_input.value.trim();
    const email_inputValue = email_input.value.trim();
    const contact_man_inputValue = contact_man_input.value.trim();
    const cell_inputValue = cell_input.value.trim();

    var error_found = false;

    if (client_name_inputValue === '') {
        setErrorFor(client_name_input, 'שם לקוח לא יכול להיות ריק');
        error_found = true;
    } else {
        setSuccessFor(client_name_input);
    }

    if (addres_inputValue == '') {
        setErrorFor(addres_input, 'כתוכת לא יכולה להיות שדה ריק')
        error_found = true;
    } else {
        setSuccessFor(addres_input);
    }

    if (tel_inputValue == '' && cell_inputValue == '') {
        setErrorFor(cell_input, 'חובה להכניס לפחות מספר טלפון או נייד');
        setErrorFor(tel_input, 'חובה להכניס לפחות מספר טלפון או נייד');
        error_found = true;
    } else {
        setSuccessFor(cell_input);
        setSuccessFor(tel_input);
    }

    if (isEmail(email_inputValue) == false) {
        setErrorFor(email_input, 'שדה אימייל ריק או לא תקין');
        error_found = true;
    } else {
        setSuccessFor(email_input);
    }

    if (contact_man_inputValue == '') {
        setErrorFor(contact_man_input, 'חובה להזין איש קשר');
        error_found = true;
    } else {
        setSuccessFor(contact_man_input);
    }

    return error_found == false;
}

function checkInputs2_products() {
    var oneItemFound = false;
    //var selectedProducts = {};

    $("#productsTable > tbody > tr").each(function () {
        trID = $(this).attr("id");

        if (trID != undefined) {
            oneItemFound = true;
            rowId = trID.substring(3);
            productInput = $("#productInput_" + rowId);
            console.log(productInput.val());
        }
    });
    return oneItemFound;
}

function checkInputs(current_fs) {

    if (current_fs == 1) {
        return checkInputs1_clientInfo();
    } else if (current_fs == 2) {
        return checkInputs2_products();
    }
}

function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    formControl.className = 'form-control error';
    small.innerText = message;
}

function setSuccessFor(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
}

function isEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}





/* auto save functionmality and autocomlete for address by google places api */
set_autosave(client_name_input, "client_name_input_atuosave");
set_autosave(private_company_input, "private_company_input_atuosave");
set_autosave(addres_input, "addres_input_atuosave");
set_autosave(tel_input, "tel_input_atuosave");
set_autosave(email_input, "email_input_atuosave");
set_autosave(contact_man_input, "contact_man_input_atuosave");
set_autosave(cell_input, "cell_input_atuosave");

function set_autosave(selector, autosave_identifier) {
    if (sessionStorage.getItem(autosave_identifier)) {
        selector.value = sessionStorage.getItem(autosave_identifier);
    }
    selector.addEventListener("change", function () {
        sessionStorage.setItem(autosave_identifier, selector.value);
        console.log(autosave_identifier + ' saved: ' + selector.value);
    });
}

$(document).ready(function () {
    // init google map api
    var mapAutocomplete = new google.maps.places.Autocomplete(document.getElementById("addres_inp"));
    mapAutocomplete.setComponentRestrictions({
        'country': ['il']
    });
    google.maps.event.addListener(mapAutocomplete, 'place_changed', function () {
        // trigger chage event for autosave.
        // addEventListener("change") on called automaticliy on google places api input field
        addres_input.dispatchEvent(new Event('change'));
    });


    /*---------------- load all product for products select --------------------- */
    $.ajax({
        url: "/products_select/",
        success: function (result) {
            all_products = result;
            window.localStorage.setItem('all_product', JSON.stringify(all_products));
            console.log('got all products');
            $(`<button id="new_product_row_btn" class="btn btn-light" type="button" style="width: 100%;height: 100%;">הוסף מוצר</button>`).appendTo($("#new_product_td"))
            // create new table row for product
            $("#new_product_row_btn").click(() => {
                var product_index = getProductRowIdProvider(); // get uniqe id number for the row
                //var tr = $("#new_product_row_btn").closest('tr').before(markup);
                generate_new_row_table(product_index, $("#new_product_row_btn").closest('tr'))
            });
            console.log(all_products);
        }
    });
});




/** ----------------------------- products table functionality ----------------------------- */
var all_products;



function toggle_checkbox($, val) {
    if (val == true) {
        $.removeAttr("disabled");
    } else {
        $.attr("disabled", true);
    }
}

function generate_product_options(rowIndex, product, is_copy = false) {
    $("#selectedProductId_" + rowIndex).val(product.id).trigger("change");
    $("#catalogNumber_" + rowIndex).text(product.catalog).trigger("change");
    //toggle_checkbox($("#check_print_" + rowIndex), product.suport_printing);
    // toggle_checkbox($("#check_embro_" + rowIndex), product.suport_embroidery);

    if (is_copy == false) {
    
        $.ajax({
            url: "/glofa_data/" + product.id,
            success: function(result) {
                window.localStorage.setItem('glofa_data'+product.id, JSON.stringify(result))
            }
        })
        $.ajax({
            url: "/product_detail/" + product.id,
            success: function (result) {
                window.localStorage.setItem('product_detail'+product.id, JSON.stringify(result))
                ret = `<select name="size" id="size_select_${rowIndex}">`
                for (var size in result) {
                    ret += `<option value="${size}">${size}</option>`
                }
                ret += `</select>`;
                $("#size_" + rowIndex).html(ret);

                $('#size_select_' + rowIndex).on('change', function (e) {
                    var valueSelected = this.value;
                    var colors = result[valueSelected];

                    ret = `<select id="colorselector_${rowIndex}">`
                    for (var col in colors) {
                        ret += `<option value="${col}"  data-color="${colors[col].color}">${colors[col].cname} </option>`
                    }
                    ret += `</select>`
                    $("#color_" + rowIndex).html(ret);
                    $('#colorselector_' + rowIndex).colorselector();
                });

                $('#size_select_' + rowIndex).trigger("change");
            }
        });
    }
}


function onProductSelect(inputIndex, selectedProductId = null) {
    var product = $("#productInput_" + inputIndex).getSelectedItemData();
    var is_copy = false;
    // it's a copy and a original row so can't get selected data.
    if (product == -1) {
        // in copys the product's id is embedded in a heddn field
        console.log('copy from: ' + selectedProductId);
        product = all_products.products.filter((product) => {
            return product.id == selectedProductId
        })[0];
        is_copy = true;
    }

    $("#productInput_" + inputIndex).prop('disabled', true);

    generate_product_options(inputIndex, product, is_copy);
    $(`#add_print_${inputIndex}`).attr("disabled", !product.suport_printing)
    $(`#add_embro_${inputIndex}`).attr("disabled", !product.suport_embroidery)

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
        getValue: function (element) {
            return element.name;
        },
        list: {
            maxNumberOfElements: 30,
            //onSelectItemEvent
            onClickEvent: function () {
                onProductSelect(inputIndex);
            },

            match: {
                enabled: true
            }
        },

        template: {
            type: "custom",

            method: function (value, item) {
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
    var markup = `<tr id="tr_${product_index}">
        <td><input style="min-width:250px" id="productInput_${product_index}" class="" type="text" dir="rtl" style="margin-left:0px;font-family:Roboto, sans-serif;" placeholder="הכנס מוצר"></td>
        <td><div id="catalogNumber_${product_index}" ></div></td>
        <td><div id="size_${product_index}"> </div> </td>
        <td><div id="color_${product_index}"></div></td>
        <td><input id="amount_${product_index}" type="number" min="1" max="9999" value="1" class="" /></td>
        
        <td>
            <div>
                    <button type="button" data-toggle="modal" data-target="#MyModle" data-type="הדפסה" data-product-index="${product_index}" id="add_print_${product_index}" class="btn btn-success" disabled><i class="fas fa-plus"></i> הדפסה</button>
                    <button type="button" data-toggle="modal" data-target="#MyModle" data-type="רקמה"  data-product-index="${product_index}" id="add_embro_${product_index}" class="btn btn-success" disabled><i class="fas fa-plus"></i> רקמה</button>
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
    var markup = generate_row_markup(product_index); // generate html of the row
    insert_location.before(markup);

    createProductInput(product_index);

    $("#dup_btn_" + product_index).click(() => {
        dup_product_index = getProductRowIdProvider();
        generate_new_row_table(dup_product_index, $("#dup_btn_" + product_index).closest('tr'))

        //markup = generate_row_markup(dup_product_index);
        //$("#dup_btn_" + product_index).closest('tr').after(markup);
        //createProductInput(dup_product_index);
        var selectedProduct = $("#productInput_" + product_index);
        $("#productInput_" + dup_product_index).val(selectedProduct.val()); // copy the input text
        onProductSelect(dup_product_index, $("#selectedProductId_" + product_index).val()); // trigger the selected product on the coyped row
        copy_product_options(dup_product_index, product_index)

    });

    $("#del_btn_" + product_index).click(() => {
        $("#del_btn_" + product_index).closest('tr').remove();
    });

}



// handling modle events

$('#MyModle').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var addonType = button.data('type') // Extract info from data-* attributes
    var productIndex = button.data('product-index') // Extract info from data-* attributes
    var product = getProductFromIndex(productIndex);
    var size = readSizeFromProductIndex(productIndex);
    var color = readColorFromProductIndex(productIndex);
    var amount = readAmountFromProductIndex(productIndex);
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    var modalTitle = modal.find('.modal-title');
    console.log(modalTitle);
    var markup = `
    <div class="card mb-3" style="max-width: 540px;">
  <div class="row no-gutters">
    <div class="col-md-4">
      <img src="${product.image}" class="card-img" alt="${product.name}">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title"> ${product.name}</h5>
        <p class="card-text">
            <span style="display: block;">
                <span> צבע: </span>
                <span class="btn-colorselector" style="background-color: ${color.dataset.color};"></span>
                <span> ${color.innerText} </span>
            </span>
            <span style="display: block;">
                <span> גודל: </span>
                <span> ${size}</span>
            </span>
        </p>
      </div>
    </div>
  </div>
</div>
    `
    modalTitle[0].innerHTML = markup;
    //`<img src="${product.image}" />הוספת ${addonType} למוצר: ${product.name}`;

    var rows = $("#productPrintTable > tbody > tr");
    if (rows.length == 1) {
        var markup = generate_print_row_markup(0, amount);
        var row = $(markup);
        row.find(".selectpicker").selectpicker();
        
        locationTd = row.find("[name=locationTd]");
        var glofaData = JSON.parse(window.localStorage.getItem('glofa_data'+product.id));
        var images = {};
        for(var i = 0; i < glofaData.data.length; i++) {
            dat = glofaData.data[i];
            if(dat.glofaImage_id in images == false) {
                images[dat.glofaImage_id] = {'url': dat.glofaImage__image, 'image_id':dat.glofaImage_id};
            }
            (images[dat.glofaImage_id]["cords"] = 
                images[dat.glofaImage_id]["cords"] ? images[dat.glofaImage_id]["cords"]:[]).push(
                {
                    'num': dat.glofaType__num,
                    'description':dat.glofaType__description,
                    'shape': dat.shape,
                    'val': dat.cords,
                    
                }
            );
        }
        
        console.log(images);
        var glofaImagesMarkup = $(locationTd);
        glofaImagesMarkup.empty();
        Object.keys(images).forEach(function(key) {
            console.log(key, images[key]);
            image = images[key];
            area_cords = image.cords.map(function (cord) {
                return `<area target="self" alt="" title="${cord.description}" href="#" coords="${cord.val}" shape="${cord.shape}">`
            });
            glofaImagesMarkup.append(`<img name="print-image-${image.image_id}"usemap="#image-map-${image.image_id}" src="/media/${image.url}"/>
            <map name="image-map-${image.image_id}">` + 
                area_cords.join('') + 
            `</map>`);
            var glofaImage = glofaImagesMarkup.find(`[name=print-image-${image.image_id}]`);
            glofaImage.mapster({
                fillColor: 'ff000f', 
                stroke: true, 
                singleSelect: true
            });
            //glofaImagesMarkup += 
        });
        //glofaImagesMarkup += `</div>`;
        
        /*glofa_images = [...new Set(glofaData.data.map(function(a) {
            var id = a.glofaImage_id;
            var image = a.glofaImage__image; 
            return {id,image} }))]; // get all uniqe images to use
        var glofaImagesMarkup = glofa_images.map(function(image) {
                
                return(
                    `<div>
                        <img usemap="#image-map-${image.id}" src="/media/${image.image}"/>
                        <map name="image-map-${image.id}">
                            ${glofaData.map(function(gdata) {
                                if(gdata.data.glofaImage_id == image.id) {
                                    return (`<area target="" alt="" title="" href="" coords="${gdata.data.cords}" shape="rect">`)
                                }
                            })}
                            
                        </map>
                    </div>`); 
            });
            
            */
            //glofaImagesMarkup = $(glofaImagesMarkup)
        //$(locationTd).append(glofaImagesMarkup);
        $("#productPrintTable tr:last").after(row);
    }
});


function generate_print_row_markup(rowId, maxAmount) {
    var markup = `<tr id="print_row_${rowId}">
                                <td>
                                    <div class="dropdown" style="max-width:300px;">
                                    <button class="btn btn-default dropdown-toggle" type="button" name="dropdownMenuBtn" id="dropdownMenu${rowId}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                    <span>
                                        בחר לוגו
                                    </span>
                                    <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu logo-select">
                                        
                                    </ul>
                                    </div>
                                    
                                </td>
                                <td><input id="print_amount_${rowId}" type="number" min="1" max="99999" value="${maxAmount}" class=""></td>
                                <td>
                                    <select class="selectpicker" multiple data-live-search="true">
                                        <option>אדום</option>
                                        <option>כחול</option>
                                        <option>סגול</option>
                                        <option>כתום</option>
                                        <option>ירוק</option>
                                        <option>חום</option>
                                        <option>לבן</option>
                                        <option>שחור</option>
                                    </select>
                              </td>
                                <td name="locationTd" id="locationTd_${rowId}">תמונה של חולצה</td>
            </tr>`
    return markup;
}

function readSizeFromProductIndex(productIndex) {
    var sizeSelect = $(`#size_${productIndex} > select`);
    return sizeSelect.val();
}

function readAmountFromProductIndex(productIndex) {
    var amountField = $(`#amount_${productIndex}`);
    return amountField.val();
}


function readColorFromProductIndex(productIndex) {
    var colorSelect = $(`#color_${productIndex} > select`);
    return colorSelect[0][colorSelect.val()]
}

function getProductFromIndex(inputIndex) {
    var product = $("#productInput_" + inputIndex).getSelectedItemData();
    if (product == -1) {
        var selectedProductId = $("#selectedProductId_" + inputIndex).val();
        product = all_products.products.filter((product) => {
            return product.id == selectedProductId;
        })[0]
    }
    return product;
}

/** WORNING: FUNCTION CALLED WHEN ITEM CHANGE TOO  */
function onLogoSelected(item) {
    $(item).parent().parent().find("[name=dropdownMenuBtn] > span:first").html(item.outerHTML)
}

function addOptionToLogoSelects(data) {
    var {file, response} = data;
    var logoSelects = $(".logo-select");
    logoSelects.append(`<a data-file-name="${file.name}" onclick="onLogoSelected(this);" class="dropdown-item">
    <div class="logo-select-item row no-gutters" >
    <div class="col-md-4">
      <img src="${response}" class="card-img" alt="${response}">
    </div>
    <div class="col-md-8">
        ${file.name.substring(0, 20)}
    </div>
  </div>
    </a>`);
}

var dropZoneFiles = [];
Dropzone.autoDiscover = false;
$("#myAwesomeDropzone").dropzone({
    success: function (file, response) {
        dropZoneFiles.push({response, file});
        addOptionToLogoSelects(dropZoneFiles[dropZoneFiles.length-1]);
    }
});