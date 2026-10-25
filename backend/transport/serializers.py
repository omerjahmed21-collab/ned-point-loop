from rest_framework import serializers
from .models import Route, Stop, Schedule


class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = ['id', 'name', 'order', 'latitude', 'longitude']


class ScheduleSerializer(serializers.ModelSerializer):
    trip_type_display = serializers.CharField(source='get_trip_type_display', read_only=True)
    bus_number = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = ['id', 'trip_type', 'trip_type_display', 'departure_time', 'bus_number']

    def get_bus_number(self, obj):
        return obj.bus.bus_number if obj.bus else None


class RouteListSerializer(serializers.ModelSerializer):
    stop_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Route
        fields = ['id', 'code', 'name', 'stop_count']


class RouteDetailSerializer(serializers.ModelSerializer):
    stops = StopSerializer(many=True, read_only=True)
    schedules = ScheduleSerializer(many=True, read_only=True)
    buses = serializers.SerializerMethodField()

    class Meta:
        model = Route
        fields = ['id', 'code', 'name', 'stops', 'schedules', 'buses']

    def get_buses(self, obj):
        return [
            {'id': b.id, 'bus_number': b.bus_number}
            for b in obj.buses.all() if b.is_active
        ]
