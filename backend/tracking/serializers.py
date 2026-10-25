from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers
from .models import BusLocation


class LocationUpdateSerializer(serializers.Serializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)
    speed = serializers.FloatField(required=False, allow_null=True)


class BusLocationSerializer(serializers.ModelSerializer):
    bus_number = serializers.CharField(source='bus.bus_number', read_only=True)
    route_code = serializers.SerializerMethodField()
    is_live = serializers.SerializerMethodField()

    class Meta:
        model = BusLocation
        fields = ['bus', 'bus_number', 'route_code', 'latitude', 'longitude',
                  'speed', 'updated_at', 'is_live']

    def get_route_code(self, obj):
        return obj.bus.route.code if obj.bus.route else None

    def get_is_live(self, obj):
        # Treat a bus as "live" if it sent a location in the last 2 minutes
        return timezone.now() - obj.updated_at < timedelta(minutes=2)
