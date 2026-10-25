from django.db import models
from django.conf import settings


class Route(models.Model):
    name = models.CharField(max_length=100)              # e.g. "Gulshan Route"
    code = models.CharField(max_length=10, unique=True)  # e.g. "R1"
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Stop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='stops')
    name = models.CharField(max_length=100)              # e.g. "Nipa Chowrangi"
    order = models.PositiveIntegerField()                # 1, 2, 3... order on the route
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        ordering = ['route', 'order']

    def __str__(self):
        return f"{self.route.code} - {self.order}. {self.name}"


class Bus(models.Model):
    bus_number = models.CharField(max_length=20, unique=True)   # e.g. "Point 12"
    plate_number = models.CharField(max_length=20, unique=True)
    capacity = models.PositiveIntegerField(default=50)
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='buses')
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        limit_choices_to={'role': 'driver'},
        related_name='buses',
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Buses'

    def __str__(self):
        return f"{self.bus_number} ({self.plate_number})"


class Schedule(models.Model):
    TRIP_CHOICES = [
        ('morning', 'Morning (to NED)'),
        ('evening', 'Evening (from NED)'),
    ]
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='schedules')
    bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='schedules')
    trip_type = models.CharField(max_length=10, choices=TRIP_CHOICES)
    departure_time = models.TimeField()

    class Meta:
        ordering = ['route', 'departure_time']

    def __str__(self):
        return f"{self.route.code} - {self.get_trip_type_display()} at {self.departure_time}"
