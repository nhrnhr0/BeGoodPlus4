

/*============ cart and form functionality start =====================*/
/*function get_last_cart() {
  var forms = myStorage.getItem('last_cart');
  if (forms == undefined)
    forms = '[]';
  return JSON.parse(forms);
}

function set_last_cart(data) {
  myStorage.setItem('last_cart', JSON.stringify(data));
}*/

function deparam(query) {
  var pairs, i, keyValuePair, key, value, map = {};
  // remove leading question mark if its there
  if (query.slice(0, 1) === '?') {
    query = query.slice(1);
  }
  if (query !== '') {
    pairs = query.split('&');
    for (i = 0; i < pairs.length; i += 1) {
      keyValuePair = pairs[i].split('=');
      key = decodeURIComponent(keyValuePair[0]);
      value = (keyValuePair.length > 1) ? decodeURIComponent(keyValuePair[1]) : undefined;
      if (Array.isArray(map[key])) {
        map[key].push(value);
      } else if (map[key] != undefined) {
        map[key] = [map[key], value];
      } else {
        map[key] = value;
      }
    }
  }
  return map;
}
/*
function cart_form_changed(data) {

  var jsdata = deparam(data);
  console.log(jsdata);
  var formUUID = jsdata.formUUID
  var last_updated_form = get_last_cart()[formUUID];
  if (last_updated_form == undefined) {
    last_updated_form = {}
  }
  if (last_updated_form?.value != data) {
    last_updated_form['id'] = formUUID;
    last_updated_form['value'] = data;
    last_updated_form['changed'] = true;
    var new_forms = get_last_cart().filter(function (val, index, arr) {
      return val.id != formUUID;
    });
    new_forms.push(last_updated_form);
    set_last_cart(new_forms);
  }
}
*/
/*
function cart_form_interval() {
  forms = get_last_cart();
  for (var i = 0; i < forms.length; i++) {
    form = forms[i];
    if (form['changed'] == true) {
      update_cart_to_server(form.value);
      form['changed'] = false;
      forms = forms.splice(i, 1);
      set_last_cart(forms);
    }
  }
}
*/

/*
function set_cart_form_change_listener(selector) {
  var form = $(selector)

  var uuid_field = form.find('[name=formUUID]');
  if (uuid_field.val() == '' || uuid_field.val() == undefined) {
    var uid = localStorage.getItem(selector + '_form_uuid');
    if (uid == undefined || uid == null) {
      localStorage.setItem(selector + '_form_uuid', uuidv4());
      uid = localStorage.getItem(selector + '_form_uuid');
    }
    uuid_field.val(uid);
  }

  fields = form.find('input')
  for (var i = 0; i < fields.length; i++) {
    var field = $(fields[i])
    value = myStorage.getItem(selector + '_input_' + field.attr('id'));
    if (value != undefined && value != null && value != '') {
      field.val(value)
    }
  }
  fields.change(function () {
    console.log('input change', $(this).val());
    myStorage.setItem(selector + '_input_' + $(this).attr('id'), $(this).val());
  });

  form.change(function () {
    data = $(selector).serialize();
    //data = JSON.stringify(data);
    //console.log('FORM CHANGED', url_field.val(), data);
    cart_form_changed(data);
    //update_cart_to_server(data);

  });
  form.submit(function (e) {
    e.preventDefault();
    data = $(selector).serialize();
    data += '&sumbited=True'

    //data = JSON.stringify(data);
    update_cart_to_server(data);


    // reset form after submit
    form.find('[name="products[]"]').remove();
    form.trigger('reset');

    fields = form.find('input')
    for (var i = 0; i < fields.length; i++) {
      var field = $(fields[i])
      value = myStorage.getItem(selector + '_input_' + field.attr('id'));
      if (value != undefined && value != null && value != '') {
        //field.val('')
        myStorage.setItem(selector + '_input_' + field.attr('id'), '');
      }
    }

    localStorage.setItem(selector + '_form_uuid', uuidv4());
    uuid_field.val(localStorage.getItem(selector + '_form_uuid'));
  });
}
*/

/*
function update_cart_to_server(data) {

  $.ajax({
    type: "POST",
    url: '/cart-change',
    data: {
      'content': data,
      'csrfmiddlewaretoken': getCookie('csrftoken'),
    },
    success: function (cart) {
      console.log('form-change success');
      console.log(cart);
      myStorage.setItem('cart', JSON.stringify(cart));
      update_cart_ui(cart);
    },
    fail: function () {
      console.log('form-change fail');
    },
    error: function () {
      console.log('form-change fail');
    },
    dataType: 'json',
  });
}*/

function remove_productUI(prodId) {

  // delete for the client UI:
  // cart modal
  //$(`#likedProductsForm :input[value=${prodId}]`).remove();
  $(`.my-slick-slide[data-prod-id=${prodId}]`).removeClass('checked');
  $(`.category-item[data-category-prod-id="${prodId}"]`).removeClass('checked');
  $(`.my-slick-slide[data-prod-id=${prodId}] + .like-btn span`).text('הוסף');
  $(`.category-item[data-category-prod-id=${prodId}] .like-btn .like-wrapper a span`).text('הוסף');

  // send to server
  //$(`#likedProductsForm #cartProductsList ul li[data-prod-id='${prodId}']`).remove();
  //$(`#likedProductsForm`).trigger('change')
}







/*============ cart and form functionality end =====================*/





// handle section 2 check-list and proggres bar amimation
/*var check_list_inputs = document.querySelectorAll('.section-3 .check-list ul li input');

function handleSection2Checkmarks(pos) {
  var pos_offset = 4800;
  var precent = 0;
  if (pos == 0) {
    precent = 0;
  }
  if (pos > 50 + pos_offset) {
    precent = 10;
    check_list_inputs[0].checked = false;
    check_list_inputs[1].checked = false;
    check_list_inputs[2].checked = false;
    check_list_inputs[3].checked = false;
    check_list_inputs[4].checked = false;
    //document.querySelector('.section-2 .check-list ul li:nth-of-type(1) input').checked = true;
  }
  if (pos >= 100 + pos_offset && pos < 200 + pos_offset) {
    precent = 20;
    check_list_inputs[0].checked = true;
    check_list_inputs[1].checked = false;
    check_list_inputs[2].checked = false;
    check_list_inputs[3].checked = false;
    check_list_inputs[4].checked = false;
    //document.querySelector('.section-2 .check-list ul li:nth-of-type(1) input').checked = true;
  } else if (pos >= 200 + pos_offset && pos < 300 + pos_offset) {
    precent = 40;
    check_list_inputs[0].checked = true;
    check_list_inputs[1].checked = true;
    check_list_inputs[2].checked = false;
    check_list_inputs[3].checked = false;
    check_list_inputs[4].checked = false;
    //document.querySelector('.section-2 .check-list ul li input').checked = false;
  } else if (pos >= 300 + pos_offset && pos < 400 + pos_offset) {
    precent = 60;
    check_list_inputs[0].checked = true;
    check_list_inputs[1].checked = true;
    check_list_inputs[2].checked = true;
    check_list_inputs[3].checked = false;
    check_list_inputs[4].checked = false;
    //document.querySelector('.section-2 .check-list ul li input').checked = false;
  } else if (pos >= 400 + pos_offset && pos < 500 + pos_offset) {
    precent = 80;
    check_list_inputs[0].checked = true;
    check_list_inputs[1].checked = true;
    check_list_inputs[2].checked = true;
    check_list_inputs[3].checked = true;
    check_list_inputs[4].checked = false;
    //document.querySelector('.section-2 .check-list ul li input').checked = false;
  } else if (pos >= 500 + pos_offset) {
    precent = 100;
    check_list_inputs[0].checked = true;
    check_list_inputs[1].checked = true;
    check_list_inputs[2].checked = true;
    check_list_inputs[3].checked = true;
    check_list_inputs[4].checked = true;
    //document.querySelector('.section-2 .check-list ul li input').checked = false;
  }
  //$('.progress-bar').css('width', precent + '%');
}*/

/*
function setCatalogTaskListiner() {
  var frm = $('.contact-form');
  frm.change(function () {
    console.log('update Catalog Task');
    updateCatalogTask();
  });

  var productsFrm = $('#likedProductsForm');
  productsFrm.change(function () {
    console.log('update Products Task');
    updateLikedProductsTask();
  });

  setFormAutoSave(productsFrm)
}

function updateCatalogTask(isSubmited = false) {
  var frm = $('.contact-form');
  task_id = myStorage.getItem('task_catalog_id');
  var serTaskId = '';
  if (task_id) {
    var serTaskId = `&task_id=${task_id}&submited=${isSubmited}`
  }
  serFrm = frm.serialize() + serTaskId;

  if (isSubmited) {
    isValid = frm.get(0).reportValidity();
    if (isValid == false) {
      alert('שם ופאלפון הם שדות חובה');
      return;
    }
  }

  $.ajax({
    type: "POST",
    url: '/tasks/update-contact-form',
    data: serFrm,
    success: (json) => {
      console.log(json);
      myStorage.setItem('task_catalog_id', json.task_id);
      if (json.task_id == -1) {
        frm.trigger("reset");
        resetContactFormAutoSave();
      }
      getUserTasks();
      updateProductsCart();
    },
    dataType: "json"
  });
}

function submitCatalogContactForm() {
  updateCatalogTask(isSubmited = true);
}

function submitCatalogProducts() {
  updateLikedProductsTask(isSubmited = true);
  window.location.href = window.location.href;

}
// TODO: send the ajax once and not once per input field
function updateLikedProductsTask(isSubmited = false) {
  var frm = $('#likedProductsForm');
  task_id = myStorage.getItem('task_products_id');
  var serTaskId = '';
  if (task_id) {
    //var serTaskId = '&task_id=' + task_id
    var serTaskId = `&task_id=${task_id}&submited=${isSubmited}`;
  }
  serFrm = frm.serialize() + serTaskId;
  if (isSubmited) {
    isValid = frm.get(0).reportValidity();
    if (isValid == false) {
      alert('שם פאלפון ואימייל הם שדות חובה');
      return;
    }
  }
  $.ajax({
    type: "POST",
    url: '/tasks/update-products-form',
    data: serFrm,
    success: (json) => {
      console.log(json);
      //myStorage.setItem('task_products_name',json.task_name );
      myStorage.setItem('task_products_id', json.task_id);
      if (json.task_id == -1) {
        frm.trigger("reset");
        resetFormAutoSave(frm);
        $('#cartProductsList').empty();
        getUserTasks();
      }
    },
    dataType: "json"
  });
}


function modal_add_btn_click() {

}

*/

/*
function updateClientLikedUI() {
  console.log('hey');
  liked_products = $('#likedProductsForm input[name="products[]"]');
  for (var i = 0; i < liked_products.length; i++) {
    updateClientLikedUI1(liked_products.val());
  }

}*/



// delete the product from the user form
/*
function removeClientLikeProduct(prodId) {
  var productsToRemove = $(`#likedProductsForm :input[name="products[]"]`).filter(function () {
    return this.value == prodId
  });
  productsToRemove.remove();
  removeClientLikedUI1(prodId);
  var cartId = myStorage.getItem('task_products_id');
  var serTaskId = '';
  if (cartId) {
    var serTaskId = `&cartId=${cartId}&prodId=${prodId}`
  }
  serFrm = frm.serialize() + serTaskId;

  $.ajax({
    type: "POST",
    url: `tasks/delete-user-liked-product/`,
    data: serFrm,
    success: (json) => {
      console.log('product deleted in the server', json);
    }
  });
  //setTimeout(updateLikedProductsTask, 500);

}
*/



function ajax_cart_contact_info(data) {
  $.ajax({
    type: "POST",
    url: '/cart/info',
    data: {
      'content': data,
      'csrfmiddlewaretoken': getCookie('csrftoken'),
    },
    success: function (data) {
      render_cart_view(data);
      if(data.redirect_to != undefined) {
        window.location = data.redirect_to;
      }
    },
    fail: function () {
      console.log('ajax_cart_contact_info fail');
    },
    error: function () {
      console.log('ajax_cart_contact_info fail');
    },
    dataType: 'json',
  });
}


/*
function updateProductsCart() {
  $.ajax({
    type: "GET",
    url: '/tasks/get-user-cart',
    //data: serFrm,
    success: (json) => {
      console.log(json);
      //myStorage.setItem('task_catalog_id',json.task_id );
      //getUserTasks();
      var productsMarkup = '<ul>';
      for (var i = 0; i < json.products_list.length; i++) {

        product = json.products_list[i];
        productsMarkup += `
          <li data-prod-id="${product.id}">
            <div>
              <img src=${product.image_thumbnail} height="50px"/>
              <span>${product.title}</span>
            </div>
            <div>
              <button type='button' data-prod-id="${product.id}" onclick="deleteLikedProductBtn(${product.id});" ><span >&times;</span></button>
            </div>
          </li>
        `
        updateClientLikedUI1(product.id);
      }
      productsMarkup += '</ul>';
      $('#cartProductsList').html(productsMarkup);
    },
    dataType: "json"
  });
}
*/

// delete the product from the user cart in the html and in the form
/*function deleteLikedProductBtn(prodId) {
  console.log('delete me');
  $(`li[data-prod-id="${prodId}"`).remove();
  removeClientLikeProduct(prodId);
}*/

/*
function loadProductsModal() {
  $('#likedProductsModal').modal('show');
  $('#likedProductsModal .close-modal').click(function () {
    $('#likedProductsModal').modal('hide');
  });
  //updateProductsCart();
}*/








var _last_cart_contact_info = undefined;
var _need_to_update_cart_contact_info = false;

function check_for_contact_info_change(ser_form, isImportant = false) {
  if (isImportant) {
    cart_info_update(ser_form);
    _last_cart_contact_info = ser_form;
    return;
  }

  if (ser_form != _last_cart_contact_info) {
    _need_to_update_cart_contact_info = true;
    _last_cart_contact_info = ser_form;
  }

}

// actual sending request to the server
function cart_info_update(info) {
  ajax_cart_contact_info(info);
}
// used with setInserval and send the periotecly if there is changes to not overload the server
function cart_info_updater() {
  if (_need_to_update_cart_contact_info) {
    cart_info_update(_last_cart_contact_info);
    _need_to_update_cart_contact_info = false;
  }
}

function set_cart_contact_change_listener(selector) {
  //last_updated_cart
  var form = $(selector);
  fields = form.find('input')
  for (var i = 0; i < fields.length; i++) {
    var field = $(fields[i])
    value = myStorage.getItem(selector + '_input_' + field.attr('id'));
    if (value != undefined && value != null && value != '') {
      field.val(value)
    }
  }
  fields.change(function () {
    console.log('input change', $(this).val());
    myStorage.setItem(selector + '_input_' + $(this).attr('id'), $(this).val());
  });

  form.change(function () {
    ser_form = $(form).serialize();
    ser_form += "&submited=false";
    check_for_contact_info_change(ser_form);
  });

  form.submit(function (e) {
    e.preventDefault();
    ser_form = $(form).serialize();
    ser_form += "&submited=true";
    check_for_contact_info_change(ser_form, true);
    //data = $(selector).serialize();
    //data += '&sumbited=True'
  });

}



/*
function update_category_cart_ui() {
  var cart = JSON.parse(myStorage.getItem('cart'));
  update_cart_ui(cart);
}*/

//setCatalogTaskListiner();
//getUserTasks();
//set_form_change_listener('#catalog-contact-form', 'catalog');

set_cart_contact_change_listener('#likedProductsForm');
setInterval(cart_info_updater, 3000);
//set_cart_form_change_listener('#likedProductsForm');
//update_cart_ui(JSON.parse(myStorage.getItem('cart')));
//setInterval(cart_form_interval, 3000);