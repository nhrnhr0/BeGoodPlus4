import uuid
from django.db import models
from catalogImages.models import CatalogImageVarient
from color.models import Color
from productSize.models import ProductSize
from morders.models import MOrder
from cloudinary.models import CloudinaryField
from django.utils.translation import gettext_lazy as _

# Create your models here.
DOC_STATUS_OPTIONS = (
    ('Draft', _('Draft')),
    ('Published', _('Published')),
    ('Signed', _('Signed')),
)


class MOrderSignatureItemDetail(models.Model):
    quantity = models.IntegerField(default=1)
    color = models.ForeignKey(
        to=Color, on_delete=models.SET_DEFAULT, default=76, null=True, blank=True)
    size = models.ForeignKey(
        to=ProductSize, on_delete=models.SET_DEFAULT, default=108, null=True, blank=True)
    varient = models.ForeignKey(
        to=CatalogImageVarient, on_delete=models.CASCADE, null=True, blank=True)
    pass


class MOrderSignatureItem(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField()
    # CloudinaryField('image', folder='morders_docs')
    cimage = models.CharField(max_length=350, blank=True, null=True)
    price = models.DecimalField(max_digits=100, decimal_places=2, default=0.00)
    details = models.ManyToManyField(to=MOrderSignatureItemDetail)
    show_details = models.BooleanField(default=True)


class MOrderSignature(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    related_omrder = models.ForeignKey(
        MOrder, on_delete=models.SET_NULL, null=True)
    client_name = models.CharField(max_length=100)
    status = models.CharField(
        max_length=100, choices=DOC_STATUS_OPTIONS, default='Draft')
    published_at = models.DateTimeField(null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    items = models.ManyToManyField(to=MOrderSignatureItem, blank=True)
    signature_cimage = models.CharField(max_length=350, null=True, blank=True)
    signature_info = models.JSONField(null=True, blank=True)
