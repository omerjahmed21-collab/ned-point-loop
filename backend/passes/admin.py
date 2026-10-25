from django.contrib import admin, messages
from django.utils.html import format_html

from .models import Payment


def _image_or_link(url, label, max_w):
    if url.lower().endswith('.pdf'):
        return format_html('<a href="{}" target="_blank">Open PDF {}</a>', url, label)
    return format_html('<a href="{0}" target="_blank"><img src="{0}" alt="{1}" style="width:{2}px;max-width:100%;height:auto;'
                       'max-height:420px;object-fit:contain;border-radius:10px;border:1px solid #d8cfc1;background:#fff"></a>',
                       url, label, max_w)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('submitted_at', 'photo_thumb', 'student_name', 'route', 'method',
                    'transaction_id', 'receipt_link', 'status')
    list_display_links = ('submitted_at', 'student_name')
    list_editable = ('status',)
    list_filter = ('status', 'method', 'route', 'semester')
    search_fields = ('student__username', 'student__roll_number', 'student__first_name', 'transaction_id')
    readonly_fields = ('student', 'student_details', 'student_photo', 'route', 'semester', 'amount', 'method', 'transaction_id',
                       'receipt_preview', 'receipt_number', 'submitted_at', 'reviewed_at', 'reviewed_by')
    fieldsets = (
        ('Student and uploaded receipt', {'fields': ('student_details', 'student_photo', 'receipt_preview')}),
        ('Payment', {'fields': ('route', 'semester', 'amount', 'method', 'transaction_id')}),
        ('Decision', {'fields': ('status', 'admin_note', 'receipt_number', 'submitted_at', 'reviewed_at', 'reviewed_by')}),
    )
    actions = ['approve_selected', 'reject_selected']

    def has_add_permission(self, request):
        return False  # payments come from students

    @admin.display(description='Student', ordering='student__roll_number')
    def student_name(self, obj):
        name = obj.student.get_full_name() or obj.student.username
        return f"{name} ({obj.student.roll_number})" if obj.student.roll_number else name

    @admin.display(description='Student')
    def student_details(self, obj):
        s = obj.student
        return format_html('<b>{}</b><br>{} · {}<br>{}', s.get_full_name() or s.username,
                           s.roll_number or '-', s.department or '-', s.email or '')

    @admin.display(description='')
    def photo_thumb(self, obj):
        if not obj.student.photo:
            return '-'
        return format_html('<img src="{}" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:50%">',
                           obj.student.photo.url)

    @admin.display(description='Student photo')
    def student_photo(self, obj):
        if not obj.student.photo:
            return 'No photo uploaded'
        return _image_or_link(obj.student.photo.url, 'photo', 220)

    @admin.display(description='Uploaded bank / wallet receipt')
    def receipt_preview(self, obj):
        if not obj.receipt:
            return '-'
        return _image_or_link(obj.receipt.url, 'receipt', 360)

    @admin.display(description='Receipt')
    def receipt_link(self, obj):
        if not obj.receipt:
            return '-'
        return format_html('<a href="{}" target="_blank">View</a>', obj.receipt.url)

    @admin.display(description='Fee receipt no.')
    def receipt_number(self, obj):
        return obj.receipt_no if obj.status == 'approved' else 'Issued when approved'

    def save_model(self, request, obj, form, change):
        """Changing the status (on the list or the detail page) runs the approve/reject logic."""
        old = Payment.objects.filter(pk=obj.pk).values_list('status', flat=True).first()
        if old != obj.status and obj.status == 'approved':
            obj.approve(request.user)
            self.message_user(request, f'Approved. {obj.student} can now see their fee receipt.', messages.SUCCESS)
        elif old != obj.status and obj.status == 'rejected':
            obj.reject(request.user)
        else:
            super().save_model(request, obj, form, change)

    @admin.action(description='Approve selected payments')
    def approve_selected(self, request, queryset):
        n = 0
        for p in queryset.exclude(status='approved'):
            p.approve(request.user)
            n += 1
        self.message_user(request, f'{n} payment(s) approved. Fee receipts issued.', messages.SUCCESS)

    @admin.action(description='Reject selected payments')
    def reject_selected(self, request, queryset):
        todo = queryset.exclude(status='rejected')
        n = todo.count()
        for p in todo:
            p.reject(request.user, p.admin_note or 'Payment could not be verified. Please check and resubmit.')
        self.message_user(request, f'{n} payment(s) rejected.', messages.WARNING)
