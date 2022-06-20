from django.db import models
import datetime
import requests
from django.utils import timezone
import pytz
from begoodPlus.secrects import SMARTBEE_DOMAIN, SMARTBEE_clientId, SMARTBEE_password
# Create your models here.
class SmartbeeResults(models.Model):
    morder = models.ForeignKey('morders.MOrder', on_delete=models.CASCADE)
    resultCodeId = models.IntegerField(default=0)
    result = models.TextField(default='')
    validationErrors = models.JSONField(default=dict, blank=True, null=True)

class SmartbeeTokens(models.Model):
    token = models.CharField(max_length=1024, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expirationUtcDate = models.DateTimeField()
    
    def get_or_create_token(force_new=False):
        active_tokens = SmartbeeTokens.objects.filter(expirationUtcDate__gte=timezone.now())
        if active_tokens.count() > 0 and not force_new:
            return active_tokens.first()
        else:
            response = SmartbeeTokens.request_smartbee_login()
            obj = SmartbeeTokens.objects.create(token=response['token'], expirationUtcDate=response['expirationUtcDate'])
            return obj
    
    def request_smartbee_login():
        url = SMARTBEE_DOMAIN + '/api/v1//Login/authenticate/'
        body= {
            "clientId": SMARTBEE_clientId,
            "password": SMARTBEE_password
        }
        response = requests.post(url, json=body)
        if response.status_code == 200:
            json_data = response.json()
            return json_data
        pass
    
    
    class Meta():
        verbose_name = 'Token'
        verbose_name_plural = 'Tokens'
        ordering = ['-created_at']
    def __str__(self):
        return self.token