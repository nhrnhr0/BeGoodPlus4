

from rest_framework import serializers
from .models import CrmIntrest


class CrmIntrestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrmIntrest
        fields = ('name',)