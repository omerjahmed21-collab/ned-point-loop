import os
import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


def photo_path(user, filename):
    # A fresh name for every upload, so browsers never show an old cached photo
    ext = os.path.splitext(filename)[1].lower() or '.jpg'
    return f"photos/{(user.username or 'user').lower()}-{uuid.uuid4().hex[:8]}{ext}"


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('driver', 'Driver'),
        ('student', 'Student'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True)
    roll_number = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=60, blank=True)
    photo = models.FileField(upload_to=photo_path, blank=True,
                             help_text="Student's face photo, shown on the fee receipt.")

    def __str__(self):
        return f"{self.username} ({self.role})"
