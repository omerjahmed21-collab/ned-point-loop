from django.urls import path
from . import views

urlpatterns = [
    path('', views.RouteListView.as_view()),
    path('<int:pk>/', views.RouteDetailView.as_view()),
]
