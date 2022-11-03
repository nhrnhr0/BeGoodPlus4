from django.db import models
from django.contrib.auth.models import User

from begoodPlus.secrects import SECRECT_CLIENT_SIDE_DOMAIN
import uuid
# Create your models here.


class ShareableCart(models.Model):
    uuid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField()
    times_used = models.IntegerField(default=0)
    logs = models.JSONField(null=True, blank=True)

    def get_shareable_link(self):
        url = SECRECT_CLIENT_SIDE_DOMAIN
        if not url.startswith('http'):
            url = 'http://' + url
        return url + '?shareable-cart=' + str(self.uuid)
