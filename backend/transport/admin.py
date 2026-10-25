from django.contrib import admin
from .models import Route, Stop, Bus, Schedule


class StopInline(admin.TabularInline):
    model = Stop
    extra = 1


class ScheduleInline(admin.TabularInline):
    model = Schedule
    extra = 1


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active')
    search_fields = ('code', 'name')
    inlines = [StopInline, ScheduleInline]


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('bus_number', 'plate_number', 'route', 'driver', 'capacity', 'is_active')
    list_filter = ('route', 'is_active')
    search_fields = ('bus_number', 'plate_number')


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('name', 'route', 'order')
    list_filter = ('route',)


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('route', 'bus', 'trip_type', 'departure_time')
    list_filter = ('route', 'trip_type')
