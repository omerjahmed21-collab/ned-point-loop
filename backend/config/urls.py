from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import LoginView

admin.site.site_header = 'NED Point Loop Admin'
admin.site.site_title = 'NED Point Loop'
admin.site.index_title = 'Transport office'
admin.site.enable_nav_sidebar = False  # more room for tables

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', LoginView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/auth/', include('accounts.urls')),

    # Features
    path('api/routes/', include('transport.urls')),
    path('api/tracking/', include('tracking.urls')),
    path('api/passes/', include('passes.urls')),
    path('api/payments/', include('passes.payment_urls')),
]

# Serve uploaded receipts during development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
