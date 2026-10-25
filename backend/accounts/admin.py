from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('photo_thumb', 'username', 'first_name', 'last_name', 'role', 'roll_number', 'department', 'is_active')
    list_display_links = ('username',)
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'roll_number')
    fieldsets = UserAdmin.fieldsets + (
        ('NED Point Loop', {'fields': ('role', 'phone', 'roll_number', 'department', 'photo', 'photo_preview')}),
    )
    readonly_fields = ('photo_preview',)
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('NED Point Loop', {'fields': ('first_name', 'last_name', 'role', 'phone', 'roll_number', 'department')}),
    )

    @admin.display(description='')
    def photo_thumb(self, obj):
        if not obj.photo:
            return ''
        return format_html('<img src="{}" alt="" style="width:32px;height:32px;object-fit:cover;border-radius:50%">', obj.photo.url)

    @admin.display(description='Current photo')
    def photo_preview(self, obj):
        if not obj.photo:
            return 'No photo'
        return format_html('<img src="{}" alt="" style="max-width:160px;border-radius:10px">', obj.photo.url)


# Not used in this project
admin.site.unregister(Group)
