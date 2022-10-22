"""begoodPlus URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


from core.views import admin_upload_docs_page, sheetsurl_to_smartbee
from catalogAlbum.views import get_albums, get_catalog_albums
from inventory.views import doc_stock_enter_provider_requests_api, get_stock_by_id_api, save_doc_stock_enter_provider_requests, unpivot_inventory_exel, upload_inventory_csv
from clientApi.views import CustomAuthToken, get_all_varients_api, get_products_info, get_products_info2
from inventory.views import add_doc_stock_enter_ppn, add_doc_stock_enter_ppn_entry, create_enter_doc, enter_doc_edit, delete_doc_stock_enter_ppn_entry, doc_stock_detail_api, doc_stock_list_api, get_all_inventory_api, get_all_warehouses_api, enter_doc_insert_inventory, enter_doc_remove_product, get_doc_stock_enter_ppn_entries, inventory_edit_entry, inventory_get_entry_history, inventory_manual_update_entry, search_ppn, search_warehouses, show_inventory_stock, get_product_inventory, doc_stock_list

from clientApi.views import get_all_colors_api, get_all_sizes_api, main_page_api
from campains.views import admin_get_all_campains, admin_get_campain_products, get_user_campains
from inventory.views import DocStockEnterViewSet, doc_stock_enter
# from mcrm.views import , admin_upload_bulk_crm_exel, upload_crm_execl, upload_crm_execl2

from msCrm.views import api_save_lead, fix_ms_crm, get_all_business_types_groups, get_all_mscrm_phone_contacts, get_crm_users_for_whatsapp, get_crm_users_numbers_in_excel, mcrm_lead_register, get_all_business_types, get_all_interests, import_mscrm_from_exel, upload_mscrm_business_select_to_intrests_exel
from core.views import api_logout, autocompleteClick, autocompleteModel, client_product_question, exel_to_providers_docx, handler404, send_product_photo, set_csrf_token, success_view, svelte_cart_form, svelte_cart_history, svelte_contact_form, test_celery_view, track_cart, verify_unique_field_by_field_excel
from catalogImages.views import AlbumImagesApiView, admin_api_get_product_cost_price, all_images_ids, catalogimage_upload_warehouse_excel, create_image_from_exel, get_main_albums_for_main_page, get_main_info, get_product_sizes_colors_martix, admin_remove_product_from_cart, admin_add_to_existing_cart, get_products_slim, get_products_viewset, get_similar_products
from clientApi.views import ColorsClientViewSet, ImageClientViewSet, SizesClientViewSet, LogoClientViewSet, get_album_images
from clientApi.views import AlbumClientViewSet
from catalogImageDetail.views import SvelteCatalogImageDetailViewSet
from morders.views import api_edit_order_add_product, api_edit_order_delete_product, api_get_order_data, api_get_order_data2, create_provider_docs, dashboard_orders_collection_smartbee, edit_morder, get_all_orders, dashboard_orders_collection_collect_save, get_order_detail_to_collect, list_orders_to_collect, load_all_provider_request_admin, morder_edit_order_add_product_entries, api_delete_order_data_item, morder_edit_order_add_product_entries_2, morder_edit_order_add_provider_entries, provider_request_update_entry_admin, request_provider_info_admin, view_morder_pdf, view_morder_stock_document


from packingType.views import SvelteApiPackingTypeViewSet
from color.views import SvelteColorsViewSet
from catalogImages.views import SvelteCatalogImageViewSet, create_mini_table, catalogimage_upload_slim_excel
from productSize.views import SvelteApiSizesViewSet
from django.contrib import admin
import debug_toolbar
#from pages.views import order_form, order_form2, order_form3,catalog_view,catalog_page, landing_page_view, my_logo_wrapper_view, catalog_page2

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, re_path
from provider.views import SvelteApiProviderViewSet, search_providers
from rest_framework import routers
from django.contrib.auth.models import User
from core.views import submit_exel_to_smartbee
from catalogImages.views import CatalogImageViewSet
from catalogAlbum.views import CatalogAlbumViewSet, catalogView_api, get_main_categories
from client.views import create_client_user, get_all_users_by_admin, whoAmI, userLogEntryView
from color.views import ColorsViewSet
from productSize.views import SizesViewSet
from smartbee.views import get_smartbee_doc
router = routers.DefaultRouter()
router.register(r'CatalogAlbums', CatalogAlbumViewSet)
router.register(r'CatalogImages', CatalogImageViewSet)
router.register(r'colors', ColorsViewSet)
router.register(r'sizes', SizesViewSet)


svelteRouter = routers.DefaultRouter()
svelteRouter.register(r'colors', SvelteColorsViewSet)
svelteRouter.register(r'sizes', SvelteApiSizesViewSet)
svelteRouter.register(r'products', SvelteCatalogImageViewSet)
svelteRouter.register(r'packing',  SvelteApiPackingTypeViewSet)
svelteRouter.register(r'providers', SvelteApiProviderViewSet)
svelteRouter.register(
    r'productTabel', SvelteCatalogImageDetailViewSet, basename='catalogImageDetail')

clientRouter = routers.DefaultRouter()
clientRouter.register(r'albums', AlbumClientViewSet)
clientRouter.register(r'images', ImageClientViewSet)
clientRouter.register(r'colors', ColorsClientViewSet)
clientRouter.register(r'sizes', SizesClientViewSet)
clientRouter.register(r'logos', LogoClientViewSet)
#router.register(r'stores', StoreList.as_view(),basename='stores')

#from customerCart.views import cart_changed
#from rest_framework.authtoken.views import obtain_auth_token
#from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView,)
urlpatterns = [
    path('sheetsurl-to-smartbee/', sheetsurl_to_smartbee),
    path('admin-upload-docs/', admin_upload_docs_page,
         name='admin_upload_docs_page'),
    path('create-image-from-exel', create_image_from_exel,
         name='create-image-from-exel'),
    #path('my-api/main/main', MainAlbumsViewSet.as_view({'get': 'list'})),
    path('get-main-page-albums/', get_main_albums_for_main_page),
    path('my-api/get-similar-products/<int:product_id>',
         get_similar_products, name='get_similar_products'),
    path('my-api/get-main-info', get_main_info, name='get_main_info'),
    path('my-api/get-product-slim', get_products_slim, name='get_producs_slim'),
    path('my-api/get-product-info', get_products_info2,
         name='get_products_info2'),
    path('my-api/get-album-images',
         AlbumImagesApiView.as_view(), name='album_images'),
    #path('my-api/get-main-albums', get_main_albums_for_main_page, name='get_main_albums_for_main_page'),
    path('api/v1/products',
         get_products_viewset.as_view({'get': 'list'}), name='get_products_viewset'),
    path('get-albums/', get_albums, name='get-albums'),
    path('get-catalog-albums/<int:id>',
         get_catalog_albums, name='get-catalog-albums'),
    path('get-catalog-albums/', get_catalog_albums, name='get-catalog-albums'),
    path('get-main-categories/', get_main_categories, name='get-main-categories'),
    path('fix-ms-crm', fix_ms_crm, name='fix-ms-crm'),
    path('api-save-lead/', api_save_lead, name='api_save_lead'),
    path('get_all_mscrm_phone_contacts/', get_all_mscrm_phone_contacts,
         name='get_all_mscrm_phone_contacts'),
    path('get-products-info', get_products_info, name='get-products-info'),
    path('create-client-user/', create_client_user, name='create-client-user'),

    path('upload-mscrm-business-select-to-intrests-exel', upload_mscrm_business_select_to_intrests_exel,
         name='upload-mscrm-business-select-to-intrests-exel'),
    path('verify-unique-field-by-field-excel',
         verify_unique_field_by_field_excel),
    path('product-question', client_product_question,
         name='client_product_question'),


    path('request-provider-info/<int:ppn_id>',
         request_provider_info_admin, name='request-provider-info'),
    path('upload-inventory-csv/', upload_inventory_csv,
         name='upload-inventory-csv'),
    path('unpivot-inventory-exel/', unpivot_inventory_exel,
         name='unpivot-inventory-exel'),
    path('create-provider-docs', create_provider_docs,
         name='create-provider-docs'),
    path('load-all-provider-request', load_all_provider_request_admin,
         name='load_all_provider_request_admin'),
    path('update-provider-request-entry', provider_request_update_entry_admin,
         name='provider_request_update_entry_admin'),
    path('product-photo', send_product_photo, name='send_product_photo'),
    path('main_page_api/', main_page_api, name='main_page_api'),
    path('admin-api/remove-product-from-cart/',
         admin_remove_product_from_cart, name='admin_remove_product_from_cart'),
    path('admin-api/get-product-sizes-colors-martix/<int:id>',
         get_product_sizes_colors_martix, name=''),
    path('admin-api/add-to-existing-cart/', admin_add_to_existing_cart,
         name='admin_add_to_existing_cart'),
    path('admin-api/get-all-campaigns/', admin_get_all_campains),
    path('admin-api/get-campaign-products/<int:campain_id>',
         admin_get_campain_products),
    path('admin-api/get_product_cost_price/<int:product_id>',
         admin_api_get_product_cost_price),
    path('test', test_celery_view),
    path('create_mini_table/<int:id>/',
         create_mini_table, name='create_mini_table'),
    #path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    #path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/get-token/', CustomAuthToken.as_view(), name='get_token'),
    path('api/get-all-users/', get_all_users_by_admin,
         name='get_all_users_by_admin'),

    path('admin/', admin.site.urls),

    # inventory:
    path('inv/enter-doc/save-doc-stock-enter-provider-requests',
         save_doc_stock_enter_provider_requests, name='save_doc_stock_enter_provider_requests'),
    path('inv/doc-stock-enter-provider-requests-api/<int:doc_stock_enter_id>',
         doc_stock_enter_provider_requests_api),
    path('inv/doc-stock-list', doc_stock_list, name='admin_doc_stock_list'),
    path('inv/doc-stock-list-api', doc_stock_list_api, name='doc_stock_list_api'),
    path('inv/doc-stock-detail-api/<int:id>',
         doc_stock_detail_api, name='doc_stock_detail_api'),
    path('inv/doc-stock-enter/<int:id>', doc_stock_enter,
         name='admin_edit_doc_stock_enter'),
    path('inv/enter-doc/<int:id>',
         DocStockEnterViewSet.as_view(), name='admin_enter_doc'),
    path('inv/enter-doc/get-doc-stock-enter-ppn-entries/',
         get_doc_stock_enter_ppn_entries, name='admin_get_doc_stock_enter_ppn_entries'),
    path('inv/enter-doc/delete-doc-stock-enter-ppn-entry',
         delete_doc_stock_enter_ppn_entry, name='admin_delete_doc_stock_enter_ppn_entry'),
    path('inv/enter-doc/add-doc-stock-enter-ppn-entry',
         add_doc_stock_enter_ppn_entry, name='admin_add_doc_stock_enter_ppn_entry'),
    path('inv/enter-doc/add-doc-stock-enter-ppn',
         add_doc_stock_enter_ppn, name='admin_add_doc_stock_enter_ppn'),
    path('inv/show-stock', show_inventory_stock),
    path('inv/get-product-inventory/', get_product_inventory,
         name='admin_get_product_inventory'),
    path('inv/create-enter-doc/', create_enter_doc,
         name='admin_create_enter_doc'),
    path('enter-doc-edit/', enter_doc_edit, name='admin_enter_doc_edit'),
    path('enter-doc-remove-product/', enter_doc_remove_product,
         name='admin_enter_doc_remove_product'),
    #path('enter-doc-insert-inventory/', enter_doc_insert_inventory, name='admin_enter_doc_insert_inventory'),
    path('get-all-warehouses-api/', get_all_warehouses_api,
         name='admin_get_all_warehouses_api'),
    path('enter-doc-insert-inventory/<int:doc_id>',
         enter_doc_insert_inventory, name='admin_enter_doc_insert_inventory'),
    path('get-all-inventory-api/', get_all_inventory_api,
         name='admin_get_all_inventory_api'),
    path('get-stock-by-id-api/<int:id>', get_stock_by_id_api,
         name='admin_get_stock_by_id_api'),
    path('inventory-edit-entry/<int:entry_id>',
         inventory_edit_entry, name='admin_inventory_edit_entry'),
    path('inventory-edit-entry/<int:entry_id>/history/',
         inventory_get_entry_history, name='admin_inventory_edit_entry_history'),
    path('inventory-manual-update-entry/<int:entry_id>',
         inventory_manual_update_entry, name='admin_inventory_manual_update_entry'),
    # orders
    path('morders/edit-order/<int:id>', edit_morder, name='admin_edit_order'),
    path('morders/api-get-order-data/<int:id>',
         api_get_order_data, name='admin_api_get_order_data'),
    path('morders/api-get-order-data2/<int:id>',
         api_get_order_data2, name='admin_api_get_order_data2'),

    path('morders/api-edit-order/add-new-product',
         api_edit_order_add_product, name="admin_api_edit_order_add_product"),
    path('morders/api-edit-order/delete-product-from-morder',
         api_edit_order_delete_product, name="admin_api_edit_order_delete_product"),
    path('morders/delete-product/<int:row_id>', api_delete_order_data_item,
         name='admin_api_delete_order_data_item'),
    path('morders/edit-order-add-product-entries', morder_edit_order_add_product_entries,
         name="morder_edit_order_add_product_entries"),
    path('morders/edit-order-add-product-entries/v2',
         morder_edit_order_add_product_entries_2, name="morder_edit_order_add_product_entries"),
    path('morders/edit-order-add-provider-entries/<int:entry_id>',
         morder_edit_order_add_provider_entries, name="morder_edit_order_add_provider_entries"),
    path('morders/view-order-pdf/<int:id>',
         view_morder_pdf, name='view_morder_pdf'),
    path('morders/view_morder_stock_document/<int:id>',
         view_morder_stock_document, name='view_morder_stock_document'),
    path('exel-to-providers-docx/', exel_to_providers_docx,
         name='exel_to_providers_docx'),
    path('exel-to-smartbee/', submit_exel_to_smartbee),
    path('morders/list-orders-to-collect', list_orders_to_collect,
         name='admin_list_orders_to_collect'),
    path('morders/get-order-detail-to-collect', get_order_detail_to_collect,
         name='admin_get_order_detail_to_collect'),
    path('dashboard/orders-collection/collect/save', dashboard_orders_collection_collect_save,
         name='admin_dashboard_orders_collection_collect_save'),
    path('dashboard/orders-collection/smartbee/<int:id>',
         dashboard_orders_collection_smartbee, name='admin_dashboard_orders_collection_smartbee'),
    path('get-smartbee-doc/<str:doc_id>',
         get_smartbee_doc, name='admin_get_smartbee_doc'),
    path('api/get-all-orders', get_all_orders, name='admin_get_all_orders'),
    path('search-ppn/', search_ppn, name='search_ppn'),
    #path('api/', include(router.urls)),

    re_path(r'get_album_images/(?P<pk>\d+)', get_album_images),
    path('client-api/', include(clientRouter.urls)),
    path('client-api/get-user-campains/', get_user_campains),

    # CRM
    path('client-api/lead-distribution/', mcrm_lead_register),
    path('crm-api/get-all-interests/', get_all_interests,
         name='crm_get_all_interests'),
    path('crm-api/get-all-business-types/', get_all_business_types,
         name='crm_get_all_business_types'),
    path('crm-api/get-all-business-types-groups/',
         get_all_business_types_groups, name='crm_get_all_business_types_groups'),
    path('crm-api/get-all-business-users-by-business-types-id',
         get_crm_users_for_whatsapp, name='crm_get_crm_users_for_whatsapp'),
    path('crm-api/get_crm_users_numbers_in_excel',
         get_crm_users_numbers_in_excel, name='crm_get_crm_users_numbers_in_excel'),
    #path('admin/crm/crmuser/upload_execl/', upload_crm_execl, name='crm_upload_execl'),
    #path('admin_upload_bulk_crm_exel', admin_upload_bulk_crm_exel, name='admin_upload_bulk_crm_exel'),
    path('admin/crm/crmuser/upload_execl2/',
         import_mscrm_from_exel, name='crm_upload_execl2'),
    path('admin/catalogImage/upload_slim_exel', catalogimage_upload_slim_excel,
         name='catalog_catalogimage_upload_slim_excel'),
    path('admin/catalogImage/upload_warehouse_excel', catalogimage_upload_warehouse_excel,
         name='catalog_catalogimage_upload_warehouse_excel'),
    path('client-api/get-all-sizes/', get_all_sizes_api),
    path('client-api/get-all-variants/', get_all_varients_api),
    path('client-api/get-all-colors/', get_all_colors_api),
    path('svelte/api/', include(svelteRouter.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/who-am-i/', whoAmI),
    path('api/logs/', userLogEntryView),
    path('api/logout/', api_logout),
    path('api/all-image-ids/', all_images_ids),

    #path('api/get-providers/', api_providers, name='admin_api_providers'),

    #path('', catalogView, name="catalogView"),

    path('catalog_api', catalogView_api, name="catalog-view-api"),
    path('search-warehouses/', search_warehouses, name='search_warehouses'),
    path('search-providers/', search_providers, name="search-providers"),
    path('search', autocompleteModel),
    path('search-click', autocompleteClick),
    path('contact-form', svelte_contact_form, name='contact-form'),
    path('cart-form', svelte_cart_form, name='svelte-cart-form'),
    path('cart-history', svelte_cart_history, name='svelte-cart-history'),
    #path('track-cart', track_cart, name='track-cart'),
    re_path('api/set_csrf_token/(?P<factory_id>.+)/$',
            set_csrf_token, name='set_csrf_token'),
    path('api/set_csrf_token/', set_csrf_token, name='set_csrf_token'),
    #path('form-change', form_changed, name='form-change'),


    #path('user-tasks', user_tasks, name='user-tasks'),
    #     path('success/', success_view, name='success'),
    re_path(r'^advanced_filters/', include('advanced_filters.urls')),

    path('404', handler404)
]
print('settings: ', settings)
if settings.DEBUG:
    urlpatterns = urlpatterns + \
        static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns = urlpatterns + \
        static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    #urlpatterns =urlpatterns +  [path('silk/', include('silk.urls', namespace='silk'))]

if settings.DEBUG:
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
