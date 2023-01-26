

from io import BytesIO
from PIL import Image, ImageFile
from django.core.files import File
import requests
from begoodPlus.settings.base import CLOUDINARY_BASE_URL
from morders.models import MOrder
from docsSignature.models import MOrderSignature, MOrderSignatureItem, MOrderSignatureItemDetail


def create_signature_doc_from_morder(morder):

    # copy the name or client.name as client_name
    # copy the morder.id as related_order
    # copy products as items:
    #  copy product.product.title as name
    #  copy product.product.description as description
    #  upload product.product.cimage as image if not null
    #  copy product.price as price
    #  for each product.entries as entry:
    #   copy entry.quantity as this.items.quantity
    #   copy entry.color as this.items.color
    #   copy entry.size as this.items.size
    #   copy entry.varient as this.items.varient
    #   calculate total_qyt
    # code:

    client_name = morder.name
    related_omrder = morder

    signatureObj = MOrderSignature.objects.create(
        client_name=client_name, related_omrder=related_omrder)
    signatureObj.save()
    for product in morder.products.all():

        item_name = product.product.title
        item_description = product.product.description
        item = MOrderSignatureItem.objects.create(name=item_name,
                                                  description=item_description)
        if product.product.cimage:
            image_url = CLOUDINARY_BASE_URL + product.product.cimage
            item.cimage = image_url
        item.price = product.price

        if product.entries.all().count() == 0:
            item.show_details = False
        elif product.entries.all().count() == 1:
            entry = product.entries.all()[0]
            if entry.color.id == 76:
                if entry.size.id == 108 or entry.size.id == 86:
                    item.show_details = False
        item.save()
        for entry in product.entries.all():

            detail_quantity = entry.quantity
            detail_color = entry.color
            detail_size = entry.size
            detail_varient = entry.varient
            detail = MOrderSignatureItemDetail.objects.create(
                quantity=detail_quantity,
                color=detail_color,
                size=detail_size,
                varient=detail_varient)
            detail.save()
            item.details.add(detail)
        item.save()
        signatureObj.items.add(item)
    pass
    return signatureObj
