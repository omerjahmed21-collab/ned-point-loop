from django.conf import settings
from django.db import models
from django.utils import timezone

from transport.models import Route


class Payment(models.Model):
    """A student's point fee payment.

    The student submits it with a receipt image. The transport office checks it
    and approves or rejects it. An approved payment is the student's fee receipt.
    """

    METHOD_CHOICES = [
        ('jazzcash', 'JazzCash'),
        ('easypaisa', 'Easypaisa'),
        ('bank', 'Bank transfer'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'student'},
        related_name='payments',
    )
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, related_name='payments')
    semester = models.CharField(max_length=30)
    amount = models.PositiveIntegerField()
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    transaction_id = models.CharField(max_length=50, unique=True)
    receipt = models.FileField(upload_to='receipts/%Y/%m/',
                               help_text='Screenshot or photo of the bank / wallet receipt the student uploaded.')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    admin_note = models.CharField(max_length=200, blank=True,
                                  help_text='Shown to the student, e.g. why it was rejected.')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='+')

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.username} · Rs {self.amount} · {self.get_status_display()}"

    @property
    def receipt_no(self):
        """Fee receipt number shown to the student, e.g. NPL-2026-00012."""
        year = (self.reviewed_at or self.submitted_at or timezone.now()).year
        return f"NPL-{year}-{self.pk:05d}"

    def approve(self, admin_user):
        self.status = 'approved'
        self.reviewed_at = timezone.now()
        self.reviewed_by = admin_user
        self.save()

    def reject(self, admin_user, note=''):
        self.status = 'rejected'
        self.reviewed_at = timezone.now()
        self.reviewed_by = admin_user
        if note:
            self.admin_note = note
        self.save()


def current_receipt(student):
    """The student's approved payment for the current semester, or None."""
    return (Payment.objects
            .filter(student=student, status='approved', semester=settings.POINT_SEMESTER_NAME)
            .select_related('route', 'reviewed_by')
            .order_by('-reviewed_at')
            .first())
