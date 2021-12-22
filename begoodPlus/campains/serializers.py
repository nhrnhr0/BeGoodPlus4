
from .models import MonthCampain
from rest_framework.serializers import ModelSerializer


class AdminMonthCampainSerializer(ModelSerializer):
    class Meta:
        model = MonthCampain
        fields = ('id', 'is_shown','name','users','products',)