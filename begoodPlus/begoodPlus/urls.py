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
from core.views import test_celery_view
from catalogImages.views import all_images_ids
from clientApi.views import ColorsClientViewSet, ImageClientViewSet, SizesClientViewSet,LogoClientViewSet, get_album_images
from clientApi.views import AlbumClientViewSet
from catalogImageDetail.views import SvelteCatalogImageDetailViewSet
from packingType.views import SvelteApiPackingTypeViewSet
from color.views import SvelteColorsViewSet
from catalogImages.views import SvelteCatalogImageViewSet, create_mini_table
from productSize.views import SvelteApiSizesViewSet
from django.contrib import admin
import debug_toolbar
#from pages.views import order_form, order_form2, order_form3,catalog_view,catalog_page, landing_page_view, my_logo_wrapper_view, catalog_page2
                        
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, re_path
from provider.views import SvelteApiProviderViewSet
from rest_framework import routers
from django.contrib.auth.models import User

from catalogImages.views import CatalogImageViewSet
from catalogAlbum.views import CatalogAlbumViewSet
from client.views import whoAmI, userLogEntryView
from color.views import ColorsViewSet
from productSize.views import SizesViewSet
router = routers.DefaultRouter()
router.register(r'CatalogAlbums', CatalogAlbumViewSet)
router.register(r'CatalogImages', CatalogImageViewSet)
router.register(r'colors', ColorsViewSet)
router.register(r'sizes', SizesViewSet)


svelteRouter = routers.DefaultRouter()
svelteRouter.register(r'colors',SvelteColorsViewSet)
svelteRouter.register(r'sizes', SvelteApiSizesViewSet)
svelteRouter.register(r'products', SvelteCatalogImageViewSet)
svelteRouter.register(r'packing',  SvelteApiPackingTypeViewSet)
svelteRouter.register(r'providers', SvelteApiProviderViewSet)
svelteRouter.register(r'productTabel', SvelteCatalogImageDetailViewSet)

clientRouter = routers.DefaultRouter()
clientRouter.register(r'albums', AlbumClientViewSet)
clientRouter.register(r'images', ImageClientViewSet)
clientRouter.register(r'colors',ColorsClientViewSet)
clientRouter.register(r'sizes', SizesClientViewSet)
clientRouter.register(r'logos', LogoClientViewSet)
#router.register(r'stores', StoreList.as_view(),basename='stores')

from provider.views import api_providers
from packingType.views import api_packing_types
from productSize.views import api_product_sizes
from productColor.views import api_product_colors
from core.views import handler404, api_logout, shareable_category_view, shareable_product_view,svelte_contact_form, set_csrf_token, svelte_cart_form
from core.views import autocompleteModel, autocompleteClick, success_view#  admin_subscribe_view, mainView,, form_changed #saveBaseContactFormView
from catalogAlbum.views import catalogView_api#,catalog_timer
#from customerCart.views import cart_changed
from customerCart.views import cart_del, cart_add,cart_view,cart_info
from rest_framework.authtoken.views import obtain_auth_token
#from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView,)
urlpatterns = [
    path('test', test_celery_view),
    path('create_mini_table/<int:id>/',create_mini_table, name='create_mini_table'),
    
    #path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    #path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/get-token/', obtain_auth_token),
    
    
    path('admin/', admin.site.urls),
    
    #path('api/', include(router.urls)),

    re_path(r'get_album_images/(?P<pk>\d+)',get_album_images),
    path('client-api/',include(clientRouter.urls)),
    
    path('svelte/api/', include(svelteRouter.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/who-am-i/', whoAmI),
    path('api/logs/', userLogEntryView),
    path('api/logout/', api_logout),
    path('api/all-image-ids/', all_images_ids),

    #path('', catalogView, name="catalogView"),
    
    path('catalog_api', catalogView_api, name="catalog-view-api"),
    
    
    path('search',autocompleteModel),
    path('search-click', autocompleteClick),
    path('contact-form', svelte_contact_form, name='contact-form'),
    path('cart-form', svelte_cart_form, name='svelte-cart-form'),
    path('api/set_csrf_token/<uuid:factory_id>', set_csrf_token, name='set_csrf_token'),
    path('api/set_csrf_token/', set_csrf_token, name='set_csrf_token'),
    #path('form-change', form_changed, name='form-change'),

    path('cart/add', cart_add, name='cart-add'),
    path('cart/del', cart_del, name='cart-del'),
    path('cart/view', cart_view, name='cart-view'),
    path('cart/info', cart_info, name='cart-info'),

    
    #path('user-tasks', user_tasks, name='user-tasks'),
    path('success/', success_view, name='success'),
    re_path(r'^advanced_filters/', include('advanced_filters.urls')),
    re_path(r'share-me/product/(?P<prod_id>\d+)/$', shareable_product_view, name='shareable_product_view'),
    re_path(r'share-me/category/(?P<category_id>\d+)/$', shareable_category_view, name='shareable_category_view'),

    path('404', handler404)
]
print('settings: ', settings);
if settings.DEBUG:
    urlpatterns= urlpatterns + static(settings.MEDIA_URL, document_root= settings.MEDIA_ROOT)
    urlpatterns= urlpatterns + static(settings.STATIC_URL, document_root= settings.STATIC_ROOT)
    
if settings.DEBUG:
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
