from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from accounts.permissions import IsDriver
from accounts.serializers import photo_url
from .models import current_receipt

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsDriver])
def check_student(request):
    """Driver types a roll number and sees the student's photo and fee status."""
    roll = (request.query_params.get('roll') or '').strip()
    if not roll:
        return Response({'detail': 'Enter a roll number.'}, status=status.HTTP_400_BAD_REQUEST)

    student = User.objects.filter(role='student', roll_number__iexact=roll).first()
    if not student:
        return Response({'detail': f'No student found with roll number {roll.upper()}.'},
                        status=status.HTTP_404_NOT_FOUND)

    receipt = current_receipt(student)
    return Response({
        'name': student.get_full_name() or student.username,
        'roll_number': student.roll_number,
        'department': student.department,
        'photo': photo_url(request, student),
        'paid': receipt is not None,
        'receipt_no': receipt.receipt_no if receipt else None,
        'route_code': receipt.route.code if receipt and receipt.route else None,
        'route_name': receipt.route.name if receipt and receipt.route else None,
        'semester': receipt.semester if receipt else None,
    })
