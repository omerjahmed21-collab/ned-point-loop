from django.db.models import Count
from rest_framework import generics

from .models import Route
from .serializers import RouteListSerializer, RouteDetailSerializer


class RouteListView(generics.ListAPIView):
    serializer_class = RouteListSerializer

    def get_queryset(self):
        return (Route.objects.filter(is_active=True)
                .annotate(stop_count=Count('stops'))
                .order_by('code'))


class RouteDetailView(generics.RetrieveAPIView):
    serializer_class = RouteDetailSerializer
    queryset = (Route.objects.filter(is_active=True)
                .prefetch_related('stops', 'schedules__bus', 'buses'))
