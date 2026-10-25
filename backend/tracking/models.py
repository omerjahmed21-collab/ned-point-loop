from django.db import models
from transport.models import Bus


class BusLocation(models.Model):
    # One row per bus, always holding its latest position
    bus = models.OneToOneField(Bus, on_delete=models.CASCADE, related_name='location')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    speed = models.FloatField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.bus.bus_number} @ {self.latitude}, {self.longitude}"
