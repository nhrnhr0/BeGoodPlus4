from django.db import models
from django.contrib.auth.models import User

from begoodPlus.secrects import SECRECT_CLIENT_SIDE_DOMAIN
import uuid
from django.utils.translation import gettext_lazy  as _
# Create your models here.


class ShareableCart(models.Model):
    uuid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, verbose_name=_('uuid'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    data = models.JSONField(verbose_name=_('data'))
    times_used = models.IntegerField(default=0, verbose_name=_('times used'))
    logs = models.JSONField(null=True, blank=True, verbose_name=_('logs'))
    
    class Meta:
        verbose_name = _('shareable cart')
        verbose_name_plural = _('shareable carts')

    def get_shareable_link(self):
        url = SECRECT_CLIENT_SIDE_DOMAIN
        if not url.startswith('http'):
            url = 'http://' + url
        return url + '?shareable-cart=' + str(self.uuid)
