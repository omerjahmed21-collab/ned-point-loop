import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

ROLL_PATTERN = re.compile(r'^[A-Z]{2,4}-\d{4,6}$')
PHOTO_TYPES = ('image/jpeg', 'image/png', 'image/webp')
MAX_PHOTO_BYTES = 3 * 1024 * 1024


def photo_url(request, user):
    """Path the frontend can load the photo from (served under /media/)."""
    if not user.photo:
        return None
    return user.photo.url


def validate_photo_file(f):
    if f.size > MAX_PHOTO_BYTES:
        raise serializers.ValidationError('Photo must be smaller than 3 MB.')
    if getattr(f, 'content_type', None) not in PHOTO_TYPES:
        raise serializers.ValidationError('Upload a JPG, PNG or WebP photo of your face.')
    return f


class UserSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'role', 'phone', 'roll_number', 'department', 'photo']
        read_only_fields = fields

    def get_photo(self, obj):
        return photo_url(self.context.get('request'), obj)


class StudentSignupSerializer(serializers.ModelSerializer):
    """Students sign up with their roll number (it becomes their login) and a face photo."""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    photo = serializers.FileField(validators=[validate_photo_file], error_messages={
        'required': 'Add a clear photo of your face. It is printed on your fee receipt.',
        'empty': 'Add a clear photo of your face. It is printed on your fee receipt.',
    })

    class Meta:
        model = User
        fields = ['roll_number', 'password', 'first_name', 'last_name', 'email', 'phone',
                  'department', 'photo']
        extra_kwargs = {
            'first_name': {'required': True, 'allow_blank': False},
            'email': {'required': True, 'allow_blank': False},
            'roll_number': {'required': True, 'allow_blank': False},
            'department': {'required': True, 'allow_blank': False},
        }

    def validate_roll_number(self, value):
        value = value.strip().upper().replace(' ', '')
        if not ROLL_PATTERN.match(value):
            raise serializers.ValidationError('Use your roll number format, e.g. CS-22045.')
        if (User.objects.filter(roll_number__iexact=value).exists()
                or User.objects.filter(username__iexact=value).exists()):
            raise serializers.ValidationError('This roll number is already registered. Try signing in.')
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data, username=validated_data['roll_number'], role='student')
        user.set_password(password)
        user.save()
        return user


class PhotoSerializer(serializers.Serializer):
    photo = serializers.FileField(validators=[validate_photo_file])


class RollOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Login with a roll number (students) or a username (drivers, admin)."""

    def validate(self, attrs):
        login = (attrs.get(self.username_field) or '').strip()
        user = (User.objects.filter(username__iexact=login).first()
                or User.objects.filter(roll_number__iexact=login).first())
        if user:
            attrs[self.username_field] = user.username
        return super().validate(attrs)
