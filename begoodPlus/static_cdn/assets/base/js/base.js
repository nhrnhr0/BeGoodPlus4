const myStorage = window.localStorage;




$('#who_us_btn').click(function(e) {
    console.log(e);
    

    $('#whousModal').modal('show');
    $('#whousModal .close-modal').click(function () {
        $('#whousModal').modal('hide');
    });
});


function set_like_btn(selector, val) {
    btns = $(selector);
    btns.html(get_like_markup(val));
  }
  
  function get_like_markup(val) {
    if (val == false) {
      return (`<img src="/static/assets/catalog/imgs/icons8-plus-48.png"> הוסף`);
    } else {
      return (`<img src="/static/assets/catalog/imgs/icons8-check-mark-48.png"> הוסף`);
    }
  }
  var _modal_z_index_incrementor = 0;
  // fix category modal overlaping product modal
  $(document).on('show.bs.modal', '.modal', function (event) {
      var zIndex = _modal_z_index_incrementor++ + 1040 + (10 * $('.modal:visible').length);
      $(this).css('z-index', zIndex);
      setTimeout(function () {
          $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
      }, 0);
  });
  $(document).on('hidden.bs.modal', '.modal', function () {
      $('.modal:visible').length && $(document.body).addClass('modal-open');
  });
/*============================================================================================================== */
/*=========================================== menu functionality start ========================================= */
/*============================================================================================================== */

//var menu_btn = $('#menu .collapsible');

function toggle_menu() {
    menu.classList.toggle("active");
}

function set_menu_active(flag) {
    if (flag) {
        menu.classList.add("active");
    } else {
        menu.classList.remove("active");
    }
}

/*menu_btn.on('click', function (e) {
    toggle_menu();
});*/

/*$(window).on('click', function (e) {
    // is element other then the menu and what inside is clicked?
    if (e.target != menu_btn && menu_btn[0].contains(e.target) == false) {
        //Hide the menus if visible
        set_menu_active(false);
    } else {
    }
});*/

/*============================================================================================================== */
/*=========================================== menu functionality end =========================================== */
/*============================================================================================================== */


/* ================= icon bar functionality start ======================== */
var lastKnownScrollPosition = 0;
var ticking = false;
var side_icons = document.querySelectorAll('.icon-bar .icon');
var is_delivery_first_open = false;

function handleSideIcons(scrollPos) {
    //var icons = document.querySelectorAll('.icon-bar > div');
    if (scrollPos > 200) {
        //
        //var icons = document.querySelectorAll('.icon-bar > div');
        for (var i = 0; i < side_icons.length; i++) {
            //icons[i].style.transform =  'translateX(0px)';
            side_icons[i].classList.remove('hide');
            side_icons[i].classList.add('pick');


        }
        if (is_delivery_first_open == false) {
            var delivery = document.querySelector('.icon-bar .icon.delivery');
            delivery.classList.remove('pick');
            delivery.classList.add('show');
            setTimeout(pick_delivery_icon_in_start, 3000, delivery);
            is_delivery_first_open = true;
        }
    } else {

        for (var i = 0; i < side_icons.length; i++) {
            //icons[i].style.transform =  'translateX(-220px)';
            side_icons[i].classList.remove('show');
            side_icons[i].classList.remove('pick');
            side_icons[i].classList.add('hide');
        }
        //document.querySelector('.icon-bar > div').css('transform', 'translateX(-220px)');
    }
}

function pick_delivery_icon_in_start(delivery) {
    delivery.classList.remove('show');
    delivery.classList.add('pick');
    //is_delivery_first_open = false;
}

function collapseMenu() {
    $('#navbarSupportedContent').collapse('hide');
}
document.addEventListener('scroll', function (e) {
    lastKnownScrollPosition = window.scrollY;
    if (ticking == false) {
        window.requestAnimationFrame(function () {
            handleSideIcons(lastKnownScrollPosition);
            collapseMenu();
            /*
            if (typeof handleSection2Checkmarks !== 'undefined' && typeof handleSection2Checkmarks === 'function') {
                handleSection2Checkmarks(lastKnownScrollPosition);
            }
            */
            ticking = false;
        });

        ticking = true;
    }
});


for (var i = 0; i < side_icons.length; i++) {
    side_icons[i].addEventListener('click', (event) => {
        console.log('show');
        if (event.currentTarget.classList.contains('show')) {
            event.currentTarget.classList.remove('show');
        } else {
            event.currentTarget.classList.add('show');
        }
    });

}

/* ================= icon bar functionality end ======================== */



function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//var last_updated_forms = [];
function get_last_updated_forms() {
    var forms = myStorage.getItem('last_updated_forms');
    if (forms == undefined)
        forms = '[]';
    return JSON.parse(forms);
}

function set_last_updated_forms(data) {
    myStorage.setItem('last_updated_forms', JSON.stringify(data));
}

function contact_form_changed(data, isImportant=false) {
    var jsdata = JSON.parse(data);
    console.log(jsdata);
    var formUUID = jsdata.find((e) => {
        return (e.name == 'formUUID')
    }).value;
    var last_updated_form = get_last_updated_forms()[formUUID];
    if (last_updated_form == undefined) {
        last_updated_form = {}
    }
    if (last_updated_form && last_updated_form.value != data) {
        last_updated_form['id'] = formUUID;
        last_updated_form['value'] = data;
        last_updated_form['changed'] = true;
        var new_forms = get_last_updated_forms().filter(function (val, index, arr) {
            return val.id != formUUID;
        });
        new_forms.push(last_updated_form);
        set_last_updated_forms(new_forms);
    }
    
    if(isImportant) {
        contact_form_interval();
    }

}

function contact_form_interval() {
    forms = get_last_updated_forms();
    for (var i = 0; i < forms.length; i++) {
        form = forms[i];
        if (form['changed'] == true) {
            update_contact_to_server(form.value);
            form['changed'] = false;
            forms = forms.splice(i, 1);
            set_last_updated_forms(forms);
        }
    }
}



function set_form_change_listener(selector, url) {
    var form = $(selector)

    var url_field = form.find('[name=url]');
    url_field.val(url);

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
        data = $(selector).serializeArray();
        data = JSON.stringify(data);
        console.log('FORM CHANGED', url_field.val(), data);
        contact_form_changed(data);
        //update_contact_to_server(data);

    });
    form.submit(function (e) {
        e.preventDefault();
        data = $(selector).serializeArray();

        // change submited to be true
        for (var i = 0; i < data.length; i++) {
            if (data[i]["name"] == "sumbited") {
                data[i]["value"] = 'True'
            }
        }
        data = JSON.stringify(data);
        console.log('FORM submited', url_field.val(), data);
        //update_contact_to_server(data);
        contact_form_changed(data, true);


        // reset form after submit
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

function update_contact_to_server(data) {
    $.ajax({
        type: "POST",
        url: '/form-change',
        data: {
            'content': data,
            'csrfmiddlewaretoken': getCookie('csrftoken'),
        },
        success: function (response) {
            console.log('render_user_tasks', response.data);
            render_user_tasks(response.data);
            if(response.redirect_to != undefined) {
                
                window.location = response.redirect_to;
            }
        },
        fail: function () {
            console.log('form-change fail');
        },
        error: function () {
            console.log('form-change fail');
        },
        dataType: 'json',
    });
}







function openCart() {
    console.log('openCart');
    $('#likedProductsModal').modal('show');
    $('#likedProductsModal .close-modal').click(function () {
        $('#likedProductsModal').modal('hide');
    });
    /*var products_elem = $('#likedProductsModal #cartProductsList');
    products_elem.empty();

    var products_markup = '<ul>';

    var cart = JSON.parse(myStorage.getItem('cart'));
    console.log(cart);
    products = cart.products;
    for(var i = 0; i < products.length; i++) {
        products_markup  += `<li data-prod-id="${products[i].id}"><img src="${products[i].image}"/>${products[i].id} -> ${products[i].title} <button type="button" onclick="remove_product(${products[i].id})">X</button></li>`
    }
    products_markup += '</ul>';
    products_elem.html(products_markup);
    */
}





function openProductModal(prodId, albumId, delay = 0) {


    //var isAdded = e.currentTarget.dataset.isAdded;
    console.log('openProductModal', prodId, albumId, delay);
    albums = getAllAlbums();
    var album = undefined;
    var albumArrIdx = -1;
    if (albumId == -1) {
        [album, albumArrIdx] = getAlbumFormProdId(prodId)
    } else {
        album = albums.find((val, idx, obj) => {
            albumArrIdx = idx;
            return val.id == albumId
        });
    }
    var prodArrIdx = -1;
    var img = album.images_list.find((val, idx) => {
        prodArrIdx = idx;
        return val.id == prodId
    });

    var colorMarkup = ``
    for (var i = 0; i < img.colors_list.length; i++) {
        var col = img.colors_list[i];
        colorMarkup += `<div class="color-box" title="${col.name}" alt="${col.name}" style="background:${col.color};"></div>`;
    }

    var sizeMarkup = ``;
    for (var i = 0; i < img.sizes_list.length; i++) {
        var size = img.sizes_list[i];
        sizeMarkup += `<div class="size-box">${size.size}</div>`;
    }

    //$('#catalogModal .modal-title').text(album.title);
    $('#catalogModal .modal-title').html(`
    <button data-album-id="${album.id}" onclick="openCategoryModal(${album.id})"
        class="title btn btn-outline-dark">${album.title}</button>
        `);
    $('#catalogModal .modal-body').html(`
    <div class="inner-body">

        <div class="product-detail">
            <div class="product-title">${img.title}</div>
            <hr>
            <div class="product-properties">
                <div class="product-color-wraper">
                    <div class="product-color ">${colorMarkup}</div>
                </div>
                <div class="product-size-wraper">
                    <div class="product-size">${sizeMarkup}</div>
                </div>
            </div>
            <hr>
            
            <!-- <div class="product-description">${img.description.replace(/(?:\r\n|\r|\n)/g, '<br>') }</div> -->
            <div class="product-description">${marked(img.description)}</div>
            
        </div>
        <div class="img-wraper" onclick="openImageProductModal(${img.id})"><img id="catalog-image-${img.id}" src="${img.image_thumbnail}"/></div>
    </div>
    <div class="inner-footer">
    </div>
    `);


    var modalNextBtn = $('#modal-next-btn');
    var modalPrevBtn = $('#modal-prev-btn');
    var nextElementStr =
        `[name=slick-slider-${album.id}] .my-slick-slide[data-my-slide-index=${prodArrIdx+1}]`;
    var prevElementStr =
        `[name=slick-slider-${album.id}] .my-slick-slide[data-my-slide-index=${prodArrIdx-1}]`;
    var nextElement = $(nextElementStr);
    var prevElement = $(prevElementStr);


    var nextProduct = album.images_list[prodArrIdx + 1];
    var prevProduct = album.images_list[prodArrIdx - 1];
    if (nextProduct) {
        modalNextBtn.attr('onClick',
            `openProductModal(${album.images_list[prodArrIdx+1].id}, ${album.id}, 0)`
            //`$('${nextElementStr}').click();`
        );

        modalNextBtn.data('hide-me', 'no');
        modalNextBtn.css('visibility', 'visible');
    } else {
        // no more next, so hide next button
        modalNextBtn.data('hide-me', 'yes');
        modalNextBtn.css('visibility', 'hidden');
    }

    if (prevProduct) {
        modalPrevBtn.attr('onClick',
            `openProductModal(${album.images_list[prodArrIdx-1].id}, ${album.id}, 0)`
            //`$('${prevElementStr}').click();`

        );
        modalPrevBtn.data('hide-me', 'no');
        modalPrevBtn.css('visibility', 'visible');
    } else {
        // no more prev, so hide prev button
        modalPrevBtn.data('hide-me', 'yes');
        modalPrevBtn.css('visibility', 'hidden');
    }


    /*$('#modal-prev-btn').click(function (e) {
    
        $(`.my-slick-slide[data-my-slide-index=${prodArrIdx-1}]`)
            .click();
    //        openProductModal(prodId,albumId, z0);
    });*/

    $('#modal-add-btn').val(prodId);
    var cart_item = $(`#cartProductsList ul li[data-prod-id=${prodId}]`);
    if(cart_item.length != 0) {
        $('#modal-add-btn').prop('disabled', true);
        set_like_btn('#modal-add-btn span', true);
        //$('#modal-add-btn span').text('נוסף להצעת מחיר');
        $('#modal-add-btn').addClass('isAdded');
    }else {
        $('#modal-add-btn').prop('disabled', false);
        set_like_btn('#modal-add-btn span', false);
        //$('#modal-add-btn span').text('הוסף להצעת מחיר');
        $('#modal-add-btn').removeClass('isAdded');
    }
    
    /*slider = $(`.my-slick-slide[data-prod-id=${prodId}]`);
    if (slider.hasClass('checked')) {
        $('#modal-add-btn').prop('disabled', true);
        set_like_btn('#modal-add-btn span', true);
        //$('#modal-add-btn span').text('נוסף להצעת מחיר');
        $('#modal-add-btn').addClass('isAdded');
    } else {
        $('#modal-add-btn').prop('disabled', false);
        set_like_btn('#modal-add-btn span', false);
        //$('#modal-add-btn span').text('הוסף להצעת מחיר');
        $('#modal-add-btn').removeClass('isAdded');
    }*/
    setTimeout(() => {
        $('#catalogModal').modal('show');
        $('#catalogModal .close-modal').click(function () {
            $('#catalogModal').modal('hide');
        });
    }, delay);
}



// get the first album id that has image id = prodId
function getAlbumFormProdId(prodId) {
    var albums = getAllAlbums();
    for (var i = 0; i < albums.length; i++) {
        for (var j = 0; j < albums[i].images_list.length; j++) {
            if (albums[i].images_list[j].id == prodId) {
                return [albums[i], i];
            }
        }
    }
}












/*
function set_autosave(selector, autosave_identifier) {
    if (sessionStorage.getItem(autosave_identifier)) {
        selector.value = sessionStorage.getItem(autosave_identifier);
    }
    selector.addEventListener("change", function () {
        autosave_functionality(autosave_identifier, selector);
    });
}

function autosave_functionality(autosave_identifier, selector) {
    sessionStorage.setItem(autosave_identifier, selector.value);
    console.log(autosave_identifier + ' saved: ' + selector.value);
}


function setContactFormAutoSave() {
    setFormAutoSave($('#contact-form'));
}
function setFormAutoSave(formSelector) {
    frm = formSelector;
    var taskName = frm.find('#taskName').val();

    for (var i = 2; i < frm[0].length; i++) {
        set_autosave(frm[0][i], taskName + '_' + frm[0][i].id);
    }
}

function resetFormAutoSave(formSelector) {
    frm = formSelector;
    var taskName = frm.find('#taskName').val();

    for (var i = 2; i < frm[0].length; i++) {
        sessionStorage.setItem(taskName + '_' + frm[0][i].id, '')
    }
}
function resetContactFormAutoSave() {
    resetFormAutoSave($('#contact-form'));
}
*/
/** contact form submit */
/* TODO: this function dose not clean the autosave data... */
/*
function submitForm() {
    console.log('send form');
    var frm = $('#contact-form');
    var formIsFull = true;
    frm[0].reportValidity();
    frm.find('input').each(function () {
        if ($(this).prop('required') && $(this).val() == '') {
            console.log('form is not full');
            formIsFull = false;
        } else {
            console.log('field full');
        }
    });
    if (!formIsFull) {
        return false;
    }
    frm.submit(); // Submit the form
    var taskName = frm.find('#taskName').val();
    for (var i = 2; i < frm[0].length; i++) {
        $(frm[0][i]).val('');
        $(frm[0][i]).change();
        $(frm[0][i]).trigger('change');
        autosave_functionality(taskName + '_' + frm[0][i].id, frm[0][i]);
    }
    
    frm.reset(); // Reset all form data
    return false; // Prevent page refresh
}*/

/* set tasks in navbar: */
/*
function displayTasks() {
    var dropMenu = $('.navbar .dropdown .dropdown-menu');
    var tasks = getClientTasks();
    if (tasks != undefined) {
        var markup = ``;
        var keys = Object.keys(tasks);
        for (var i = 0; i < keys.length; i++) {

            markup += `<li><a class="dropdown-item" onclick="${tasks[keys[i]].onclick}" href="${tasks[keys[i]].url}">${tasks[keys[i]].msg}</a></li>`
        }
        dropMenu.empty();
        dropMenu.html(markup);
    }
}*/

$(function () {
    $(document).ready(function () {

        $('.menu-wraper').focusout(function () {
            collapseMenu();

        });


        /*
        if (window.location.hash == '#contact-form') {
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight);
            }, 500);
        }

        getUserTasks();*/

    });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function remove_product(prodId) {
    ajax_product_del(prodId);
    if(typeof remove_productUI ==='function') {
        remove_productUI(prodId);
    }
  }
  


function ajax_refresh_cart() {
    $.ajax({
        type: "POST",
        url: '/cart/view',
        data: {
            'csrfmiddlewaretoken': getCookie('csrftoken'),
        },
        success: function (data) {
            render_cart_view(data);
        },
        fail: function () {
            console.log('form-change fail');
        },
        error: function () {
            console.log('form-change fail');
        },
        dataType: 'json',
    });
}



var last_updated_cart = undefined;
function render_cart_view(data) {
    console.log(data);
  if (last_updated_cart != undefined) {
    var last_updated_time = last_updated_cart['timestemp']
    last_updated_time = Date.parse(last_updated_time);
    var curr_updated_time = Date.parse(data['timestemp']);
    if (curr_updated_time >= last_updated_time) {
      last_updated_cart = data;
    } else {
      console.error('packets get in wierd order');
      console.error('last_updated_cart: ', last_updated_cart);
      console.error('new data: ', data);
    }
  } else {
    last_updated_cart = data;
  }
  update_cart_ui(last_updated_cart);
}

function openCategoryModal(albumId) {

    //updateLikedProductsTask();
    $('#catalogModal .close-modal').click();
    //updateProductsCart();
    var albums = getAllAlbums();
    var albumIndex = albums.findIndex((val, idx, obj) => {
      return val.id == albumId
    });
    var album = albums[albumIndex];
    /*
    var nextAlbum = albums[(albumIndex + 1) % albums.length];
    var prevIndex;
    if (albumIndex == 0) {
      prevIndex = albums.length
    } else {
      prevIndex = albumIndex
    }
    prevIndex -= 1;
    var prevAlbum = albums[prevIndex];
    */
    var categoryDescription =album.description;
    var categoryFotter = album.fotter;
    var bodyMarkup = `<h4 class="category-description">${marked(categoryDescription)}</h4>`
  
    var imagesMarkup = '<div class="category-items">'
    for (var i = 0; i < album.images_list.length; i++) {
      img = album.images_list[i];
      imagesMarkup += `
        <div class="category-item" data-category-prod-id="${img.id}">
          <div class="category-item-img-wraper">
            <img class="product-image" width="250px" height="250px" onclick="$('.my-slick-slide[data-prod-id=${img.id}]').click();" src="${img.image_thumbnail}" alt="${img.description}" />
            <div class="img-title">${img.title}</div>
          </div>
          <div>
            <div onclick="categoryLikeBtnClicked(${img.id})" class="like-btn" name="like-btn">
              <div class="like-wrapper">
                <a name="like-btn">
                <span name="like-btn">
                  ${get_like_markup(false)}
                </span></a>
              </div>
            </div>
          </div>
        </div>
        `
    }
    imagesMarkup += '</div>'
    bodyMarkup += imagesMarkup;
    bodyMarkup += `<h4 class="category-fotter">${marked(categoryFotter)}</h4>`
  
    /*
      var buttonsMarkup = `
      <button class="btn btn-primary" onclick="openCategoryModal(${prevAlbum.id})" value=${prevAlbum.id}>${prevAlbum.title}</button>
        <button class="btn btn-primary" onclick="openCategoryModal(${nextAlbum.id})" value=${nextAlbum.id}>${nextAlbum.title}</button>  
      `*/
    var buttonsMarkup = ``;
    /*
    for (var i = 0; i < albums.length; i++) {
      currAlbum = albums[i];
      if (albumIndex == i) {
        buttonsMarkup += `<button class="btn btn btn-dark" onclick="openCategoryModal(${currAlbum.id})" value=${currAlbum.id}>${currAlbum.title}</button>`
      } else {
        buttonsMarkup += `<button class="btn btn-outline-dark" onclick="openCategoryModal(${currAlbum.id})" value=${currAlbum.id}>${currAlbum.title}</button>`
      }
    }*/
    
    buttonsMarkup += `
    <nav class="navbar navbar-expand">
        <div class="container-fluid">
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#categoryNavbarNavDropdown" aria-controls="categoryNavbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="categoryNavbarNavDropdown">
                <ul class="navbar-nav align-self-end flex-wrap" id="categoryNav">
                `
    for (var i = 0; i < albums.length; i++) { 
        currAlbum = albums[i];
        if(albumIndex == i) {
            buttonsMarkup += `<li class="nav-item">
            <a class="nav-link" href="#"><button class="btn btn-outline" onclick="openCategoryModal(${currAlbum.id})" value=${currAlbum.id}>${currAlbum.title}</button></a>
            </li>`
        }
        else{
            buttonsMarkup += `<li class="nav-item">
            <a class="nav-link" href="#"><button class="btn btn-dark" onclick="openCategoryModal(${currAlbum.id})" value=${currAlbum.id}>${currAlbum.title}</button></a>
            </li>`
        }
        /*
        buttonsMarkup += `<li class="nav-item">
                    <a class="nav-link" href="#">
                        <button class="btn btn btn-dark" onclick="openCategoryModal(${currAlbum.id})" value=${currAlbum.id}>${currAlbum.title}</button>
                    </a>
                </li>
                `
                */
    }
    buttonsMarkup += `
                <li class="nav-item dropdown d-none">
                    <a class="btn btn-secondary dropdown-toggle" href="#"  role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                    </ul>
                </li>
            </ul>
        </div>
        </div>
    </nav>
        `
    
  
    $('#categoryModal .modal-title').text(album.title);
    $('#categoryModal .modal-body').html(bodyMarkup).scrollTop(0);
    //$('#categoryModal .modal-footer').html(buttonsMarkup);
    $('#categoryModal .modal-header .modal-header-links').html(buttonsMarkup);
    $('#categoryModal').modal('show');
    autocollapseCategoryHeaders();
    $('#categoryModal .close-modal').click(function () {
      $('#categoryModal').modal('hide');
    });
  
    update_cart_ui(last_updated_cart);
  }
  
  
  function categoryLikeBtnClicked(prodId) {
    addClientLikeProduct(prodId);
    flyToCart($(`#categoryModal .modal-body`).find(`div[data-category-prod-id='${prodId}'] .product-image`));
  }



  $(window).on('resize', function () {
    autocollapseCategoryHeaders();
});

  function autocollapseCategoryHeaders() {
    console.log('autocollapseCategoryHeaders');
    autocollapse('#categoryNav', 80);

  }
  
  var autocollapse = function (menu,maxHeight) {
    var nav = $(menu);
    var navHeight = nav.innerHeight();
    if (navHeight >= maxHeight) {
        
        $(menu + ' .dropdown').removeClass('d-none');
        $(".navbar-nav").removeClass('w-auto').addClass("w-100");
        
        while (navHeight > maxHeight) {
            //  add child to dropdown
            var children = nav.children(menu + ' li:not(:last-child)');
            var count = children.length;
            $(children[count - 1]).prependTo(menu + ' .dropdown-menu');
            navHeight = nav.innerHeight();
        }
        $(".navbar-nav").addClass("w-auto").removeClass('w-100');
        
    }
    else {
        
        var collapsed = $(menu + ' .dropdown-menu').children(menu + ' li');
      
        if (collapsed.length===0) {
          $(menu + ' .dropdown').addClass('d-none');
        }
      
        while (navHeight < maxHeight && (nav.children(menu + ' li').length > 0) && collapsed.length > 0) {
            //  remove child from dropdown
            collapsed = $(menu + ' .dropdown-menu').children('li');
            $(collapsed[0]).insertBefore(nav.children(menu + ' li:last-child'));
            navHeight = nav.innerHeight();
        }

        if (navHeight > maxHeight) { 
            autocollapse(menu,maxHeight);
        }
    }
}
function update_cart_ui(cart) {
    if (cart == undefined) {
      //TODO: think about clearing old data
      return;
    }
    if (cart.status == "submited") {
      $('#cartProductsList').empty();
      if(typeof removeClientLikedUIAll==='function') {
        removeClientLikedUIAll();
      }
    }
    var products = cart.products;
    update_cart_modal(cart);
    //update_cart_counter(cart);
    if(typeof updateClientLikedUI1 === 'function') {
        for (var i = 0; i < products.length; i++) {
            updateClientLikedUI1(products[i].id);
        }
    }
  }



  function updateClientLikedUI1(prodId) {
    //TODO: category-item checked is not working becose the category modal is dynamicly generated
  
    // update button UI in the catalog page
    $(`.my-slick-slide[data-prod-id=${prodId}]`).addClass('checked');
    $(`.category-item[data-category-prod-id="${prodId}"]`).addClass('checked');
    set_like_btn(`.my-slick-slide[data-prod-id=${prodId}] + .like-btn span`, true);
    set_like_btn(`.category-item[data-category-prod-id=${prodId}] .like-btn .like-wrapper a span`, true);
    /*
    $(`.my-slick-slide[data-prod-id=${prodId}] + .like-btn span`).html(`
      <img src="{%static 'assets/catalog/imgs/icons8-check-mark-48.png'%}"> הוסף
    הוסף להצעת מחיר
    `);
    $(`.category-item[data-category-prod-id=${prodId}] .like-btn .like-wrapper a span`).html(`
    <img src="{%static 'assets/catalog/imgs/icons8-check-mark-48.png'%}"> הוסף
  הוסף להצעת מחיר
  `);*/
  
    // update button UI in the product's modal
    $('#modal-add-btn').prop('disabled', true);
    set_like_btn('#modal-add-btn span', true);
    $('#modal-add-btn').addClass('isAdded');
  }
  
  function removeClientLikedUI1(prodId) {
    $(`.my-slick-slide[data-prod-id=${prodId}]`).removeClass('checked');
    $(`.category-item[data-category-prod-id="${prodId}"]`).removeClass('checked');
    set_like_btn(`.my-slick-slide[data-prod-id=${prodId}] + .like-btn span`, false);
    set_like_btn(`.category-item[data-category-prod-id=${prodId}] .like-btn .like-wrapper a span`, false);
    /*
    $(`.my-slick-slide[data-prod-id=${prodId}] + .like-btn span`).html(`
    <img src="{%static 'assets/catalog/imgs/icons8-plus-48.png'%}"> הוסף
  הוסף להצעת מחיר
  `);
    $(`.category-item[data-category-prod-id=${prodId}] .like-btn .like-wrapper a span`).html(`
    <img src="{%static 'assets/catalog/imgs/icons8-plus-48.png'%}"> הוסף
  הוסף להצעת מחיר
  `);*/
  }
  
  function removeClientLikedUIAll() {
    $(`.my-slick-slide`).removeClass('checked');
    $(`.category-item`).removeClass('checked');
  
  
    set_like_btn('.my-slick-slide + .like-btn span', false);
    set_like_btn('.category-item .like-btn .like-wrapper a span', false);
    /*
    $(`.my-slick-slide + .like-btn span`).html(`
    <img src="{%static 'assets/catalog/imgs/icons8-plus-48.png'%}"> הוסף
  הוסף להצעת מחיר
  `); 
    $(`.category-item .like-btn .like-wrapper a span`).html(`
    <img src="{%static 'assets/catalog/imgs/icons8-plus-48.png'%}"> הוסף
  הוסף להצעת מחיר
  `);*/
  }
  
  
  function openImageProductModal(prodId) {
    var albums = getAllAlbums();
    var product = undefined;
    for (var i = 0; i < albums.length; i++) {
      for (var j = 0; j < albums[i].images_list.length; j++) {
        if (albums[i].images_list[j].id == prodId) {
          product = albums[i].images_list[j];
          break;
        }
      }
      if (product != undefined) {
        break;
      }
    }
  
  
  
    $('#ImageProductsModal .modal-title').text(product.title);
    $('#ImageProductsModal .modal-body').html(`
      <img class="img-fluid" src=${product.image} />
    `);
    //$('#ImageProductsModal .modal-footer').html('');
    $('#ImageProductsModal').modal('show');
    $('#ImageProductsModal .close-modal').click(function () {
      $('#ImageProductsModal').modal('hide');
    });
  }

/*  function update_cart_counter(cart) {

  }
*/
  function update_cart_modal(cart) {
    var cart_markup = `<ul>`;
    for (var i = 0; i < cart.products.length; i++) {
      cart_markup +=
        `<li data-prod-id="${cart.products[i].id}">
        <div class="cart-item" onclick="openProductModal(${cart.products[i].id}, -1,0);">
          <img class="cart-item-image" src="${cart.products[i].image}"/>
          <div class="cart-item-title">
          ${cart.products[i].title}
          </div>
        </div>
          <button type="button" onclick="remove_product(${cart.products[i].id})">X</button>
        </li>`
    }
    cart_markup += `</ul>`
  
    $('#cartProductsList').html(cart_markup)
    $('#cart-btn .cart-counter').html(cart.products.length);
  }




  

var _ajax_product_count = 0;

function ajax_product_del(prodId) {
  _ajax_product_count += 1;
  $('body').addClass('waiting');
  $.ajax({
    type: "POST",
    url: '/cart/del',
    data: {
      'content': prodId,
      'csrfmiddlewaretoken': getCookie('csrftoken'),
    },
    success: function (data) {
      _ajax_product_count -= 1;
      if (_ajax_product_count == 0) {
        $('body').removeClass('waiting');
      }
      //updateClientLikedUI1(prodId);
      console.log(data);
      render_cart_view(data);
      /*console.log('form-change success');
      console.log(cart);
      myStorage.setItem('cart', JSON.stringify(cart));
      update_cart_ui(cart);*/
    },
    fail: function () {
      console.log('form-change fail');
    },
    error: function () {
      console.log('form-change fail');
    },
    dataType: 'json',
  });
}
function addClientLikeProduct(prodId) {
    ajax_product_add(prodId);
  }
  function flyToCart(img) {
    var eltoDrag = img;
    target = $('.cart');
    shake =true;
    var imgclone = eltoDrag.clone()
        .offset({
            top: eltoDrag.offset().top,
            left: eltoDrag.offset().left
        })
        .css({
            'opacity': '0.5',
            'position': 'absolute',
            'height': eltoDrag.height() / 2,
            'width': eltoDrag.width() / 2,
            'z-index': '999999'
        })
        .appendTo($('body'))
        .animate({
            'top': target.offset().top + 10,
            'left': target.offset().left + 15,
            'height': eltoDrag.height() / 2,
            'width': eltoDrag.width() / 2
        }, 1000, 'easeInOutExpo');
  
    if (shake) {
        setTimeout(function () {
            target.effect("shake", {
                times: 2
            }, 200);
        }, 1500);
    }
  
  
    imgclone.animate({
        'width': 0,
        'height': 0
    }, function () {
        $(this).detach()
    });
  }
  
function ajax_product_add(prodId) {
    _ajax_product_count += 1;
    $('body').addClass('waiting');
    $.ajax({
      type: "POST",
      url: '/cart/add',
      data: {
        'content': prodId,
        'csrfmiddlewaretoken': getCookie('csrftoken'),
      },
      success: function (data) {
        _ajax_product_count -= 1;
        if (_ajax_product_count == 0) {
          $('body').removeClass('waiting');
        }
        //updateClientLikedUI1(prodId);
        console.log(data);
        render_cart_view(data);
        /*console.log('form-change success');
        console.log(cart);
        myStorage.setItem('cart', JSON.stringify(cart));
        update_cart_ui(cart);*/
      },
      fail: function () {
        console.log('form-change fail');
      },
      error: function () {
        console.log('form-change fail');
      },
      dataType: 'json',
    });
  }

function render_user_tasks(data) {
    var tasks_markup = '';
    for(var i = 0; i < data.length; i++) {
        if(data[i].url == 'catalog') {
            tasks_markup += `<li> <button type="button" onclick="handle_user_task_click('catalog')"> לא סיימת למלא טופס יצירת קשר בדף הקטלוג </button> </li>`;
        }else if(data[i].url == 'main') {
            tasks_markup += `<li> <button type="button" onclick="handle_user_task_click('main')"> לא סיימת למלא טופס יצירת קשר בדף הראשי </button> </li>`;
        }else if(data[i].url == 'businessOwner') {
            tasks_markup += `<li> <button type="button" onclick="handle_user_task_click('businessOwner')"> לא סיימת למלא טופס יצירת קשר בדף בעל עסק </button> </li>`;
        }else if(data[i].url == 'technology') {
            tasks_markup += `<li> <button type="button" onclick="handle_user_task_click('technology')"> לא סיימת למלא טופס יצירת קשר בבניית אתרים </button> </li>`;
        }else if(data[i].url == 'technology2') {
            tasks_markup += `<li> <button type="button" onclick="handle_user_task_click('technology2')"> לא סיימת למלא טופס יצירת קשר בבניית אתרים </button> </li>`;
        }
    }
    $('#navbarDropdownList').html(tasks_markup);
    $('#navbarDropdown').attr('data-content', data.length);
    $('#navbarDropdown').addClass('notify');
    setTimeout(function () {
        $('#navbarDropdown').removeClass('notify');
    }, 1000)
}

function handle_user_task_click(taskName, e) {
console.log(e);
    if(taskName == 'catalog') {
        sessionStorage.setItem('catalog_user_task', "true");
        window.location.href = '/testCatalog';
    }
    else if(taskName == 'main') {
        sessionStorage.setItem('main_user_task', "true");
        window.location.href = '/test';
    }
    else if(taskName == 'businessOwner') {
        //sessionStorage.setItem('businessOwner_user_task', "true");
        openBuisnessModal();
    }else if(taskName == 'technology') {
        sessionStorage.setItem('technology_user_task', "true");
        window.location.href = '/technology';
    }else if(taskName == 'technology2') {
        sessionStorage.setItem('technology2_user_task', "true");
        window.location.href = '/technology';
    }
}

function ajax_user_tasks() {
    $.ajax({
      type: "POST",
      url: '/user-tasks',
      data: {
        'csrfmiddlewaretoken': getCookie('csrftoken'),
      },
      success: function (data) {
        console.log('ajax_user_tasks', data);
        render_user_tasks(data.data)
      },
      fail: function () {
        console.log('ajax_user_tasks fail');
      },
      error: function () {
        console.log('ajax_user_tasks fail');
      },
      dataType: 'json',
    });
}

function handle_user_tasks() {
    if(sessionStorage.getItem("main_user_task") != undefined){
        sessionStorage.removeItem("main_user_task");
        setTimeout(function() {
            document.querySelector("#contactForm").scrollIntoView();
        },50);
    }
    
    else if(sessionStorage.getItem("catalog_user_task") != undefined){
        sessionStorage.removeItem("catalog_user_task");
        setTimeout(function() {
            document.querySelector("#catalog-contact-form").scrollIntoView();
        },50);
    }

    else if(sessionStorage.getItem("technology_user_task") != undefined){
        sessionStorage.removeItem("technology_user_task");
        setTimeout(function() {
            const yOffset = -100; 
            var element = document.querySelector("#websites-contact-form");
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
        },50);
    }

    else if(sessionStorage.getItem("technology2_user_task") != undefined){
        sessionStorage.removeItem("technology2_user_task");
        setTimeout(function() {
            const yOffset = -100; 
            var element = document.querySelector("#websites-contact-form-2");
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});
        },50);
    }
}

function openBuisnessModal() {
    $('#buisnessModal').modal('show');
    $('#buisnessModal .close-modal').click(function () {
        $('#buisnessModal').modal('hide');
    });
}
function iOS() {

    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
      'Mac',
      'MacIntel'
    ].includes(navigator.platform) || (navigator.userAgent.includes("Mac"));
  }
function fix_IOS_Layout() {
    if(iOS()) {
        console.log('IOS');
        var categoryModal = document.getElementById('categoryModal');
        categoryModal.querySelector('.modal-content .modal-header').style.height = '100%';
        categoryModal.querySelector('.modal-content .modal-header .modal-header-links').style.height = '100%';
        categoryModal.querySelector('.modal-content .modal-footer').style.height = '100%';
    }
    else {
        console.log('not IOS');
    }
}
ajax_user_tasks();
ajax_refresh_cart();
set_form_change_listener('#contact-form', 'businessOwner');
setInterval(contact_form_interval, 10000);
handle_user_tasks();
fix_IOS_Layout();