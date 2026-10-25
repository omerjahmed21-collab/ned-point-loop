from django.urls import path
from . import payment_views

urlpatterns = [
    path('', payment_views.payment_info),
    path('submit/', payment_views.submit_payment),
]
