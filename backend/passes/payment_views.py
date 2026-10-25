from django.conf import settings
from rest_framework import serializers, status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from accounts.permissions import IsStudent
from accounts.serializers import photo_url
from transport.models import Route
from .models import Payment, current_receipt

MAX_RECEIPT_BYTES = 5 * 1024 * 1024
ALLOWED_RECEIPT_TYPES = ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    route_code = serializers.CharField(source='route.code', read_only=True, default=None)
    route_name = serializers.CharField(source='route.name', read_only=True, default=None)

    class Meta:
        model = Payment
        fields = ['id', 'route', 'route_code', 'route_name', 'semester', 'amount', 'method',
                  'method_display', 'transaction_id', 'receipt', 'status', 'status_display',
                  'admin_note', 'submitted_at', 'reviewed_at']
        read_only_fields = ['semester', 'amount', 'status', 'admin_note', 'submitted_at', 'reviewed_at']

    def validate_route(self, route):
        if route is None or not route.is_active:
            raise serializers.ValidationError('Choose an active route.')
        return route

    def validate_transaction_id(self, value):
        value = value.strip()
        if len(value) < 4:
            raise serializers.ValidationError('Enter the full transaction ID from your receipt.')
        if Payment.objects.filter(transaction_id__iexact=value).exists():
            raise serializers.ValidationError('This transaction ID has already been submitted.')
        return value

    def validate_receipt(self, f):
        if f.size > MAX_RECEIPT_BYTES:
            raise serializers.ValidationError('Receipt must be smaller than 5 MB.')
        if getattr(f, 'content_type', None) not in ALLOWED_RECEIPT_TYPES:
            raise serializers.ValidationError('Upload a photo (JPG, PNG) or PDF of the receipt.')
        return f


def receipt_data(request, payment):
    """Everything printed on the student's fee receipt."""
    s = payment.student
    return {
        'receipt_no': payment.receipt_no,
        'student_name': s.get_full_name() or s.username,
        'roll_number': s.roll_number,
        'department': s.department,
        'email': s.email,
        'phone': s.phone,
        'photo': photo_url(request, s),
        'route_code': payment.route.code if payment.route else None,
        'route_name': payment.route.name if payment.route else None,
        'semester': payment.semester,
        'amount': payment.amount,
        'method': payment.get_method_display(),
        'transaction_id': payment.transaction_id,
        'submitted_at': payment.submitted_at,
        'approved_at': payment.reviewed_at,
    }


@api_view(['GET'])
@permission_classes([IsStudent])
def payment_info(request):
    """Everything the fee page needs: fee, where to pay, routes, past submissions and the receipt."""
    payments = Payment.objects.filter(student=request.user).select_related('route')
    routes = Route.objects.filter(is_active=True).order_by('code')
    receipt = current_receipt(request.user)
    return Response({
        'fee': settings.POINT_FEE_AMOUNT,
        'semester': settings.POINT_SEMESTER_NAME,
        'accounts': settings.POINT_PAYMENT_ACCOUNTS,
        'routes': [{'id': r.id, 'code': r.code, 'name': r.name} for r in routes],
        'has_photo': bool(request.user.photo),
        'payments': PaymentSerializer(payments, many=True, context={'request': request}).data,
        'receipt': receipt_data(request, receipt) if receipt else None,
    })


@api_view(['POST'])
@permission_classes([IsStudent])
@parser_classes([MultiPartParser, FormParser])
def submit_payment(request):
    if not request.user.photo:
        return Response({'detail': 'Upload your photo first. It is printed on your fee receipt.'},
                        status=status.HTTP_400_BAD_REQUEST)
    if current_receipt(request.user):
        return Response({'detail': f'Your fee for {settings.POINT_SEMESTER_NAME} is already approved.'},
                        status=status.HTTP_400_BAD_REQUEST)
    if Payment.objects.filter(student=request.user, status='pending').exists():
        return Response({'detail': 'You already have a payment waiting for review.'},
                        status=status.HTTP_400_BAD_REQUEST)

    serializer = PaymentSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    payment = serializer.save(
        student=request.user,
        amount=settings.POINT_FEE_AMOUNT,
        semester=settings.POINT_SEMESTER_NAME,
    )
    return Response(PaymentSerializer(payment, context={'request': request}).data,
                    status=status.HTTP_201_CREATED)
