
var mapAutocomplete = new google.maps.places.Autocomplete(document.getElementById("addres"))
mapAutocomplete.setComponentRestrictions({'country': ['il']});

google.maps.event.addListener(mapAutocomplete, 'place_changed', function () {
  //document.getElementById('addres').value = near_place.name
});

$(document).on('change', '#addres', function (){

});
$(document).ready(function(){
  $.ajax({url: "products_select", success: function(result) {
    console.log(result);
    products = result;
    $('#magicsuggest').magicSuggest({
        data: products,
        allowFreeEntries: true,
        cls: 'rtl-support',
        maxSelection: 1,
        useZebraStyle: true,
        placeholder: 'הכנס מוצר',
        style: "text-align:right;",
        vregex: '', //<em.+>(.+)<\/em>
        renderer: function(data){
          
            return `
            <div class="text-right d-lg-flex d-xl-flex justify-content-lg-start align-items-lg-center align-items-xl-center"><img src="${data.image}" style="width: 50px;height: 50px;" />
            <div style="padding-right: 15px;">
              <p class="text-right d-xl-flex justify-content-xl-start align-items-xl-center"><strong class="d-lg-flex align-items-lg-start">${data.name}</strong></p>
              
            </div>
            </div>
            `
            //<p class="d-lg-flex align-items-lg-end" style="font-size: 10px;">${data.content} </p>
        },
        selectionRenderer: function(data){
          return  data.name;
        },
        /*width: function() {
          return $(this).width();
        },*/
      }); // magicSuggest
    }});
  });

//var $_searchQuery = $('#search-query');


/*
$.ajax({
  url: 'products_select',
  dataType: 'json',
  success: function (data) {
    products = data;
    for(var i = 0; i < products.length; i++) {
      products[i]["label"] = products[i]["name"]
      products[i]["value"] = "" + products[i]["id"]

    }
    console.log(products);



    $_searchQuery.autocomplete({
      source: products,
      appendTo: $('#search-suggestions')
    });
    $.ui.autocomplete.prototype._renderItem = function (ul, item) {
      
      
        var re = new RegExp($.trim(this.term.toLowerCase()));
        html = `<div id="${item.id} class="d-lg-flex justify-content-lg-center align-items-lg-center">
        <img src="${item.image}" style="width: 50px;height: 50px;" />
        <div>
            <p>${item.name}</p><small>${item.content}</small></div>
        </div>`;
        var t = html.replace(re, "<span style='font-weight:600;color:#5C5C5C;'>" + $.trim(this.term.toLowerCase()) +
            "</span>");
        return $("<li style='list-style:none;'></li>")
            .data("item.autocomplete", item)
            .append("<a>" + t + "</a>")
            .appendTo(ul);
    };

    $.extend($.ui.autocomplete.prototype.options, {
      open: function(event, ui) {
        $(this).autocomplete("widget").css({
                "width": ($(this).width() + "px")
            });
        }
    });
  }
});
*/
/*
$.extend($.ui.autocomplete.prototype.options, {
	open: function(event, ui) {
		$(this).autocomplete("widget").css({
            "width": ($(this).width() + "px")
        });
    }
});
*/

/*
$(document).ready(function(){
    $.ajax({
      url: 'products_select',
      dataType: 'json',
      success: function (data) {
        products = data;
        console.log(data);

        $('#productInp1').magicSuggest({
          data: data,
          allowFreeEntries: false,
          cls: 'rtl-cls',
          maxSelection: 1,
          useZebraStyle: true,
          placeholder: 'הכנס מוצר',
          style: "width=0px",
          vregex: '<strong.+>(.+)<\/strong>',
          renderer: function(data){
              return "<div class=\"text-right d-lg-flex d-xl-flex justify-content-lg-start align-items-lg-center align-items-xl-center\"><img style=\"width: 50px;height: 50px;\" src=\""+ data.image +"\">" +
              "<div>" +
                  "<p class=\"text-right d-xl-flex justify-content-xl-start align-items-xl-center\"><strong class=\"d-lg-flex align-items-lg-start\">"+ data.name +"</strong></p>" +
                  "<p class=\"d-lg-flex align-items-lg-end\" style=\"font-size: 10px\">"+ data.content +"&nbsp;</p>" +
              "</div>" +
              "</div>";
          },
          selectionRenderer: function(data){
            return  data.name;
          }
  
      });

      $('#productInp1 > div.ms-sel-ctn > input[type=text]').attr("style", "width=0px;");

      }
    });
});

const search = document.getElementById('search');
const matchList = document.getElementById('match-list')

function searchProducts(searchText) {
  console.log(products);
  let matches = products.filter(function (product) {
    const regex = new RegExp(`${searchText}`, 'gi');
    return product.name.match(regex) || product.content.match(regex);
  });

  outputHtml(matches);
}

function outputHtml(matches) {
  if(matches.length > 0) {
    const html = matches.map(match => `
    <div class="card" id="${match.id}" onClick="selectProduct(id)">
    <div class="card-body d-lg-flex align-items-lg-right">
        <div><img style="width: 50px;height: 50px;" src=${match.image}/></div>
        <div style="">
            <h4>${match.name}</h4>
            <p>${match.content}</p>
        </div>
    </div>
</div>
    `).join('');
    matchList.innerHTML = html;
  }
}

function selectProduct(productId) {
  console.log(productId);
  product = products.filter((product) => {return product.id == productId;})[0];
  console.log(product);

  $('#search').val(product.name);
  var event = new Event('input', {
    bubbles: true,
    cancelable: true,
  });

  search.dispatchEvent(event);
}
search.addEventListener('input', () => searchProducts(search.value));


var $_searchQuery = $('#search-query');
var mdata = ["india", "usa", "canada", "japan", "uk", "south africa"];

$.ui.autocomplete.prototype._renderItem = function (ul, item) {
    var re = new RegExp($.trim(this.term.toLowerCase()));
    var t = item.label.replace(re, "<span style='font-weight:600;color:#5C5C5C;'>" + $.trim(this.term.toLowerCase()) +
        "</span>");
    return $("<li></li>")
        .data("item.autocomplete", item)
        .append("<a>" + t + "</a>")
        .appendTo(ul);
};

$_searchQuery.autocomplete({
    source: mdata,
    appendTo: '#test'
});
*/