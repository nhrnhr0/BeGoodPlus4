# from begoodPlus.secrects import SECRECT_CLIENT_SIDE_DOMAIN
# from django.contrib import admin
# from django.utils.html import mark_safe
# 
# Register your models here.

# from .models import MOrderSignature, MOrderSignatureItem, MOrderSignatureItemDetail


# class MOrderSignatureItemDetailAdmin(admin.ModelAdmin):
#     list_display = ('id', 'quantity', 'color', 'size', 'varient')

#     pass


# admin.site.register(MOrderSignatureItemDetail, MOrderSignatureItemDetailAdmin)


# class MOrderSignatureItemAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name', 'description',
#                     'cimage', 'price', 'show_details')
#     pass


# admin.site.register(MOrderSignatureItem, MOrderSignatureItemAdmin)


# class MOrderSignatureAdmin(admin.ModelAdmin):
#     list_display = ('id', 'edit_link', 'sign_link', 'created_at', 'updated_at', 'related_omrder',
#                     'client_name', 'status', 'published_at', 'signed_at')
#     readonly_fields = ('edit_link', 'sign_link',)

#     def edit_link(self, obj):
#         return mark_safe(f'<a href="/edit-doc-signature/{obj.uuid}">ערוך</a>')
#     pass

#     def sign_link(self, obj):
#         base = SECRECT_CLIENT_SIDE_DOMAIN
#         if not base.startswith('http://'):
#             base = 'http://' + base
#         return mark_safe(f'<a href="{base}/signature/{obj.uuid}">חתום</a>')


# admin.site.register(MOrderSignature, MOrderSignatureAdmin)
