from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from accounts.permissions import IsDriver
from transport.models import Bus
from .models import BusLocation
from .serializers import LocationUpdateSerializer, BusLocationSerializer


@api_view(['POST'])
@permission_classes([IsDriver])
def update_location(request):
    """Driver's phone sends its current location every ~10 seconds."""
    bus = Bus.objects.filter(driver=request.user, is_active=True).first()
    if not bus:
        return Response({'detail': 'No active bus is assigned to you.'},
                        status=status.HTTP_400_BAD_REQUEST)

    serializer = LocationUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    location, _ = BusLocation.objects.update_or_create(
        bus=bus,
        defaults={
            'latitude': round(data['latitude'], 6),
            'longitude': round(data['longitude'], 6),
            'speed': data.get('speed'),
        },
    )
    return Response(BusLocationSerializer(location).data)


@api_view(['GET'])
def live_locations(request):
    """Any logged-in user sees bus locations. Optional filter: ?route=<route_id>"""
    qs = BusLocation.objects.select_related('bus', 'bus__route').filter(bus__is_active=True)
    route_id = request.query_params.get('route')
    if route_id:
        qs = qs.filter(bus__route_id=route_id)
    return Response(BusLocationSerializer(qs, many=True).data)
