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
from catalogImageDetail.views import SvelteCatalogImageDetailViewSet
from packingType.views import SvelteApiPackingTypeViewSet
from color.views import SvelteColorsViewSet
from catalogImages.views import SvelteCatalogImageViewSet, create_mini_table
from productSize.views import SvelteApiSizesViewSet
from dashboard.views import InventoryList, StoreList, products_search
from websites.views import websites_page_view
from django.contrib import admin
#from pages.views import order_form, order_form2, order_form3,catalog_view,catalog_page, landing_page_view, my_logo_wrapper_view, catalog_page2
                        
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, re_path
from provider.views import SvelteApiProviderViewSet
from rest_framework import routers
from product.views import ProductViewSet
from category.views import CategoryViewSet
from productImages.views import ProductImageViewSet
from catalogImages.views import CatalogImageViewSet
from catalogAlbum.views import CatalogAlbumViewSet
from product.views import products_select_all, products_select, product_detail
from freeFlow.views import FfStoreViewSet
from color.views import ColorsViewSet
from productSize.views import SizesViewSet
router = routers.DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'productImages', ProductImageViewSet)
router.register(r'CatalogAlbums', CatalogAlbumViewSet)
router.register(r'CatalogImages', CatalogImageViewSet)

router.register(r'freeFlowStores', FfStoreViewSet)
router.register(r'colors', ColorsViewSet)
router.register(r'sizes', SizesViewSet)


svelteRouter = routers.DefaultRouter()
svelteRouter.register(r'colors',SvelteColorsViewSet)
svelteRouter.register(r'sizes', SvelteApiSizesViewSet)
svelteRouter.register(r'products', SvelteCatalogImageViewSet)
svelteRouter.register(r'packing',  SvelteApiPackingTypeViewSet)
svelteRouter.register(r'providers', SvelteApiProviderViewSet)
svelteRouter.register(r'productTabel', SvelteCatalogImageDetailViewSet)


#router.register(r'stores', StoreList.as_view(),basename='stores')

from provider.views import api_providers
from packingType.views import api_packing_types
from productSize.views import api_product_sizes
from productColor.views import api_product_colors
from stock.views import add_multiple_stocks
from clientLikedImages.views import add_liked_images
from clientImages.views import upload_user_image
from glofa_types.views import glofa_data
from freeFlow.views import freeFlowView, freeFlowChangeLanguage
from core.views import admin_subscribe_view, mainView,autocompleteModel, autocompleteClick, form_changed #saveBaseContactFormView
from leadsCampains.views import landingPageFormSubmit
from catalogAlbum.views import catalogView_api, catalogView#,catalog_timer
from myUserTasks.views import updateContactFormUserTaskView, getUserTasksView,updateProductsFormUserTaskView,getUserCartView,delUserLikedProductView
from myLogo.views import my_logo_view
from core.views import user_tasks, success_view
from websites.views import websites_page_view
from product.serializers import BarcodeList
#from customerCart.views import cart_changed
from customerCart.views import cart_del, cart_add,cart_view,cart_info

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
urlpatterns = [
    path('create_mini_table/<int:id>/',create_mini_table, name='create_mini_table'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # used for MD TV
    re_path('^api/barcode/(?P<barcode>.+)/$', BarcodeList.as_view()), 
    re_path(r'^api/stores/$', StoreList.as_view(), name="stores-api"),
    re_path(r'^api/stores/(?P<q>[^/.]+)/$', StoreList.as_view(), name='stores-api'),
    re_path(r'^api/inventory/$', InventoryList.as_view(), name='inventory-api'),

    path('api/products_search/<str:phrash>/', products_search),
    path('api/inventory/<int:pk>/', InventoryList.as_view(), name='inventory-api'),
    #path('jet/', include('jet.urls', 'jet')),
    path('admin/', admin.site.urls),
    #path('', landing_page_view, name='home'),
    #path('order/', order_form),
    #path('order2/', order_form2),
    #path('order3/', order_form3),
    path('api/', include(router.urls)),
    path('svelte/api/', include(svelteRouter.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    #path('products_select/<str:phrash>/', products_select),
    #path('product_detail/<int:id>', product_detail),

    #path('order/products_select/<str:phrash>', products_select),
    #path('order/products_select/', products_select_all), # TODO: delete in prod 
    #path('products_select/', products_select_all),
    #path('product_detail/<int:id>', product_detail),
    #re_path(r'catalog/(?P<slug>[\w\d\-\_]+)/$', catalog_page, name='albumView'),
    #re_path(r'catalog/(?P<hierarchy>.+)/$', catalog_page, name='albumView'),
    #re_path(r'catalog2/(?P<hierarchy>.+)/$', catalog_page2, name='albumView2'),
    #path('begood-plus', catalog_view),
    
    #path('my-logo', my_logo_wrapper_view),
    #path('my-logo/<path:curr>', my_logo_view, name="my-logo"),
    
    #path('api/providers', api_providers), 
    #path('api/packingTypes', api_packing_types),
    #path('api/productSizes', api_product_sizes),
    #path('api/productColors', api_product_colors),
    #path('api/add_multiple_stocks', add_multiple_stocks),
    #path('add_liked_images', add_liked_images),
    #path('upload_user_image', upload_user_image),
    #path('glofa_data/<int:id>', glofa_data),
    #path('freeFlow/', freeFlowView),
    #path('freeFlow/<str:lang>/', freeFlowView),
    #path('adminSub', admin_subscribe_view),
    #re_path('^webpush/', include('webpush.urls')),
    #path('TaxReturnCampain/', TaxReturnCampainView)
    #path('landingPageFormSubmit', landingPageFormSubmit),
    
    #path('saveContactForm/<path:next>/', saveBaseContactFormView, name="save-contact-form"),

    #path('test/', mainView, name='main-view'),
    #path('testCatalog', catalogView2,name="catalogView2"),
    path('', catalogView, name="catalogView"),
    
    #path('catalogTimer', catalog_timer,name='catalogTimer'),
    path('catalog_api', catalogView_api, name="catalog-view-api"),
    #path('tasks/update-contact-form', updateContactFormUserTaskView, name='update-contact-form-user-task'),
    #path('tasks/update-products-form', updateProductsFormUserTaskView, name='update-products-form-user-task'),
    #path('tasks/get-user-tasks', getUserTasksView, name='get-user-tasks'),
    #path('tasks/get-user-cart', getUserCartView, name='get-user-cart'),
    #path('tasks/delete-user-liked-product/', delUserLikedProductView, name='delete-user-liked-product'),
    
    path('search',autocompleteModel),
    path('search-click', autocompleteClick),
    path('form-change', form_changed, name='form-change'),
    #path('cart-change', cart_changed, name='cart-change'),
    path('cart/add', cart_add, name='cart-add'),
    path('cart/del', cart_del, name='cart-del'),
    path('cart/view', cart_view, name='cart-view'),
    path('cart/info', cart_info, name='cart-info'),
    path('user-tasks', user_tasks, name='user-tasks'),
    path('success/', success_view, name='success'),
    path('technology/', websites_page_view, name='technology'),

    path('dashboard', include('dashboard.urls')),
    re_path(r'^advanced_filters/', include('advanced_filters.urls')),

]

if settings.DEBUG:
    urlpatterns= urlpatterns + static(settings.MEDIA_URL, document_root= settings.MEDIA_ROOT)
    urlpatterns= urlpatterns + static(settings.STATIC_URL, document_root= settings.STATIC_ROOT)
    
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
