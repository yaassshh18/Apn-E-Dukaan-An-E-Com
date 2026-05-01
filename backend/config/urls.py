from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter

from users.views import (
    RegisterView, ProfileView, NotificationViewSet, ReportViewSet,
    VerifyRegistrationOTPView, RequestLoginOTPView, VerifyLoginOTPView, ResendOTPView, LoginWithOTPView,
    RequestPasswordResetOTPView, VerifyPasswordResetOTPView, ResetPasswordView,
    AdminUserManagementViewSet, AdminAuditLogViewSet, AdminAnalyticsView,
    ContactUsView
)
from products.views import CategoryViewSet, ProductViewSet, ReviewViewSet, WishlistViewSet
from orders.views import CartViewSet, OrderViewSet
from chat.views import ChatMessageViewSet

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'admin/users', AdminUserManagementViewSet, basename='admin-users')
router.register(r'admin/audit-logs', AdminAuditLogViewSet, basename='admin-audit-logs')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'chat', ChatMessageViewSet, basename='chat')

urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/register/verify-otp/', VerifyRegistrationOTPView.as_view(), name='verify_registration_otp'),
    
    # Original Login (Now heavily guarded 2FA)
    path('api/auth/login/', LoginWithOTPView.as_view(), name='login_with_otp_start'),
    
    # OTP Login
    path('api/auth/login/otp/request/', RequestLoginOTPView.as_view(), name='login_otp_request'),
    path('api/auth/login/otp/verify/', VerifyLoginOTPView.as_view(), name='login_otp_verify'),
    
    # Resend OTP
    path('api/auth/resend-otp/', ResendOTPView.as_view(), name='resend_otp'),
    
    # Password Reset
    path('api/auth/password-reset/request/', RequestPasswordResetOTPView.as_view(), name='password_reset_request'),
    path('api/auth/password-reset/verify/', VerifyPasswordResetOTPView.as_view(), name='password_reset_verify'),
    path('api/auth/password-reset/reset/', ResetPasswordView.as_view(), name='password_reset_reset'),
    
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/profile/', ProfileView.as_view(), name='profile'),
    path('api/auth/contact/', ContactUsView.as_view(), name='contact_us'),
    path('api/admin/analytics/', AdminAnalyticsView.as_view(), name='admin_analytics'),
    path('api/seller/<int:id>/', __import__('users.views').views.SellerProfileView.as_view(), name='seller_profile'),
    
    # API endpoints
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
