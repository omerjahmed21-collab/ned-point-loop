from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup),
    path('me/', views.me),
    path('photo/', views.update_photo),
]
