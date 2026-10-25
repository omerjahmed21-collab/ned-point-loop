from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from transport.models import Bus
from .permissions import IsStudent
from .serializers import PhotoSerializer, RollOrUsernameTokenSerializer, StudentSignupSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    serializer_class = RollOrUsernameTokenSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def signup(request):
    serializer = StudentSignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsStudent])
@parser_classes([MultiPartParser, FormParser])
def update_photo(request):
    serializer = PhotoSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = request.user
    if user.photo:
        user.photo.delete(save=False)
    user.photo = serializer.validated_data['photo']
    user.save(update_fields=['photo'])
    return Response(UserSerializer(user, context={'request': request}).data)


@api_view(['GET'])
def me(request):
    user = request.user
    data = UserSerializer(user, context={'request': request}).data

    if user.role == 'student':
        from passes.models import Payment, current_receipt
        latest = Payment.objects.filter(student=user).first()
        data['fee_paid'] = current_receipt(user) is not None
        data['payment_status'] = latest.status if latest else None

    # Drivers also get the bus assigned to them
    if user.role == 'driver':
        bus = Bus.objects.filter(driver=user, is_active=True).select_related('route').first()
        data['bus'] = {
            'id': bus.id,
            'bus_number': bus.bus_number,
            'route_code': bus.route.code if bus.route else None,
            'route_name': bus.route.name if bus.route else None,
        } if bus else None

    return Response(data)
