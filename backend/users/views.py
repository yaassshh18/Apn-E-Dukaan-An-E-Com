from rest_framework import generics, permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Q
from django.utils import timezone
from orders.models import Order
from products.models import Product

from .models import User, Notification, Report, LoginActivity, AdminAuditLog
from .serializers import (
    RegisterSerializer, UserSerializer, NotificationSerializer, ReportSerializer,
    OTPRequestSerializer, OTPVerifySerializer, AdminUserSerializer, AdminAuditLogSerializer
)
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from .utils.otp import create_otp_for_email, verify_otp
from .utils.email import send_registration_otp, send_welcome_email, send_login_otp, send_login_alert, send_password_reset_otp


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        user.is_verified = False # ensure it requires OTP verification
        user.save()
        
        # generate OTP and send
        if user.email:
            otp_code = create_otp_for_email(user.email)
            send_registration_otp(user.email, otp_code)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class SellerProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = 'id'

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'}, status=status.HTTP_200_OK)

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Report.objects.select_related('reporter', 'reported_user', 'reported_product', 'assigned_to')
        if self.request.user.role != 'ADMIN':
            return queryset.filter(reporter=self.request.user)

        report_type = self.request.query_params.get('report_type')
        status_filter = self.request.query_params.get('status')
        severity = self.request.query_params.get('severity')
        assignee = self.request.query_params.get('assigned_to')

        if report_type:
            queryset = queryset.filter(report_type=report_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if severity:
            queryset = queryset.filter(severity=severity)
        if assignee:
            queryset = queryset.filter(assigned_to_id=assignee)
        return queryset
    
    def perform_create(self, serializer):
        report = serializer.save(reporter=self.request.user)
        if not report.report_type:
            if report.reported_product_id:
                report.report_type = 'PRODUCT'
            elif report.reported_user_id:
                report.report_type = 'USER'
            else:
                report.report_type = 'OTHER'
            report.save(update_fields=['report_type'])

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminRole])
    def update_status(self, request, pk=None):
        report = self.get_object()
        next_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes')
        assignee_id = request.data.get('assigned_to')

        if next_status:
            report.status = next_status
            if next_status in ('RESOLVED', 'REVIEWED'):
                report.resolved_at = timezone.now()
        if admin_notes is not None:
            report.admin_notes = admin_notes
        if assignee_id:
            report.assigned_to_id = assignee_id
        report.save()

        AdminAuditLog.objects.create(
            actor=request.user,
            action='REPORT_STATUS_UPDATED',
            target_report=report,
            metadata={'status': report.status, 'assigned_to': report.assigned_to_id}
        )
        return Response(self.get_serializer(report).data)

    @action(detail=False, methods=['patch'], permission_classes=[IsAdminRole])
    def bulk_update(self, request):
        ids = request.data.get('ids', [])
        next_status = request.data.get('status')
        if not ids or not next_status:
            return Response({'error': 'ids and status are required'}, status=status.HTTP_400_BAD_REQUEST)
        reports = Report.objects.filter(id__in=ids)
        reports.update(status=next_status, resolved_at=timezone.now() if next_status in ('RESOLVED', 'REVIEWED') else None)
        AdminAuditLog.objects.create(
            actor=request.user,
            action='REPORT_BULK_UPDATE',
            metadata={'ids': ids, 'status': next_status}
        )
        return Response({'updated': reports.count()}, status=status.HTTP_200_OK)

class VerifyRegistrationOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']
            
            is_valid, msg = verify_otp(email, otp_code)
            if not is_valid:
                return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)
                
            try:
                user = User.objects.get(email=email)
                if user.is_verified:
                    return Response({'message': 'User is already verified.'}, status=status.HTTP_200_OK)
                
                user.is_verified = True
                user.save()
                
                # Send welcome email asynchronously
                send_welcome_email(user.email, user.username)
                
                return Response({'message': 'Account verified successfully. You can now login.'}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginWithOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not email or not password:
            return Response({'error': 'Username, email, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email__iexact=email, username__iexact=username)
            if user.check_password(password):
                if user.is_suspended or not user.is_active:
                    return Response({'error': 'Account is suspended. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)
                if not user.is_verified:
                    return Response({'error': 'Please verify your account first.'}, status=status.HTTP_403_FORBIDDEN)
                
                # Generate OTP and send email
                otp_code = create_otp_for_email(user.email)
                send_login_otp(user.email, otp_code)
                
                return Response({
                    'message': 'Credentials verified. OTP sent to email.',
                    'email': user.email,
                    'username': user.username
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid username, email, or password'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'Invalid username, email, or password'}, status=status.HTTP_401_UNAUTHORIZED)


class RequestLoginOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                if not user.is_verified:
                    return Response({'error': 'Please verify your account first.'}, status=status.HTTP_403_FORBIDDEN)
                
                otp_code = create_otp_for_email(email)
                send_login_otp(email, otp_code)
                return Response({'message': 'Login OTP sent to your email.'}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({'error': 'No account found with this email.'}, status=status.HTTP_404_NOT_FOUND)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyLoginOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']
            
            is_valid, msg = verify_otp(email, otp_code)
            if not is_valid:
                # Log failed attempt if user exists
                try:
                    user = User.objects.get(email=email)
                    LoginActivity.objects.create(
                        user=user, 
                        ip_address=request.META.get('REMOTE_ADDR'), 
                        device=request.META.get('HTTP_USER_AGENT'),
                        status='FAILED_OTP'
                    )
                except User.DoesNotExist:
                    pass
                return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)
                
            try:
                user = User.objects.get(email=email)
                if user.is_suspended or not user.is_active:
                    return Response({'error': 'Account is suspended. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)
                
                # Log successful attempt
                ip_address = request.META.get('REMOTE_ADDR')
                device = request.META.get('HTTP_USER_AGENT')
                from django.utils import timezone
                time_now = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
                
                LoginActivity.objects.create(
                    user=user, 
                    ip_address=ip_address, 
                    device=device,
                    status='SUCCESS'
                )
                
                # Send Login Alert
                send_login_alert(user.email, user.username, ip_address, device, time_now)
                
                # Generate Tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResendOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            action = request.data.get('action', 'login') # 'registration' or 'login'
            
            try:
                user = User.objects.get(email=email)
                otp_code = create_otp_for_email(email)
                
                if action == 'registration':
                    send_registration_otp(email, otp_code)
                else:
                    send_login_otp(email, otp_code)
                    
                return Response({'message': f'New OTP sent for {action}.'}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({'error': 'No account found with this email.'}, status=status.HTTP_404_NOT_FOUND)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RequestPasswordResetOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                otp_code = create_otp_for_email(email)
                send_password_reset_otp(email, otp_code)
                return Response({'message': 'Password reset OTP sent to your email.'}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({'error': 'No account found with this email.'}, status=status.HTTP_404_NOT_FOUND)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyPasswordResetOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']
            
            is_valid, msg = verify_otp(email, otp_code)
            if not is_valid:
                return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)
                
            # OTP verified successfully, generate a short-lived token to allow resetting password
            signer = TimestampSigner()
            token = signer.sign(email)
            
            return Response({'message': 'OTP verified successfully.', 'reset_token': token}, status=status.HTTP_200_OK)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('reset_token')
        new_password = request.data.get('new_password')
        
        if not token or not new_password:
            return Response({'error': 'Reset token and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        signer = TimestampSigner()
        try:
            # Token is valid for 10 minutes max
            email = signer.unsign(token, max_age=600)
            user = User.objects.get(email=email)
            
            user.set_password(new_password)
            # Email ownership is confirmed via reset OTP, so allow login after reset.
            if not user.is_verified:
                user.is_verified = True
            user.save()
            return Response({'message': 'Password updated successfully. You can now login with your new password.'}, status=status.HTTP_200_OK)
            
        except (BadSignature, SignatureExpired):
            return Response({'error': 'Invalid or expired reset token. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminUserManagementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search')
        role = self.request.query_params.get('role')
        if search:
            queryset = queryset.filter(Q(username__icontains=search) | Q(email__icontains=search))
        if role:
            queryset = queryset.filter(role=role)
        return queryset

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.is_suspended = True
        user.is_active = False
        user.save(update_fields=['is_suspended', 'is_active'])
        AdminAuditLog.objects.create(actor=request.user, action='USER_SUSPENDED', target_user=user)
        return Response({'message': 'User suspended'})

    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        user = self.get_object()
        user.is_suspended = False
        user.is_active = True
        user.save(update_fields=['is_suspended', 'is_active'])
        AdminAuditLog.objects.create(actor=request.user, action='USER_REACTIVATED', target_user=user)
        return Response({'message': 'User reactivated'})

    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get('role')
        if new_role not in ('BUYER', 'SELLER', 'ADMIN'):
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        user.role = new_role
        user.save(update_fields=['role'])
        AdminAuditLog.objects.create(actor=request.user, action='USER_ROLE_CHANGED', target_user=user, metadata={'role': new_role})
        return Response({'message': 'Role updated'})

    @action(detail=True, methods=['post'])
    def force_password_reset(self, request, pk=None):
        user = self.get_object()
        otp_code = create_otp_for_email(user.email)
        send_password_reset_otp(user.email, otp_code)
        AdminAuditLog.objects.create(actor=request.user, action='USER_PASSWORD_RESET_FORCED', target_user=user)
        return Response({'message': 'Password reset OTP sent to user email'})


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        orders = Order.objects.all()
        products = Product.objects.all()
        users = User.objects.all()
        reports = Report.objects.all()

        total_revenue = sum(float(order.total_price) for order in orders)
        total_orders = orders.count()
        aov = (total_revenue / total_orders) if total_orders else 0

        new_reports = reports.filter(status='NEW').count()
        in_review_reports = reports.filter(status='IN_REVIEW').count()
        resolved_reports = reports.filter(status__in=['RESOLVED', 'REVIEWED']).count()

        return Response({
            'kpis': {
                'gmv': round(total_revenue, 2),
                'total_orders': total_orders,
                'aov': round(aov, 2),
                'active_buyers': users.filter(role='BUYER', is_active=True).count(),
                'active_sellers': users.filter(role='SELLER', is_active=True).count(),
                'active_products': products.filter(is_active=True).count(),
                'low_stock_products': products.filter(stock__lte=3, is_active=True).count(),
                'reported_items': reports.count(),
                'reports_new': new_reports,
                'reports_in_review': in_review_reports,
                'reports_resolved': resolved_reports,
            },
            'risk': {
                'high_value_orders_10000_plus': orders.filter(total_price__gte=10000).count(),
                'repeat_reported_users': User.objects.annotate(report_count=Count('received_reports')).filter(report_count__gte=3).count(),
            }
        })


class AdminAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdminAuditLogSerializer
    permission_classes = [IsAdminRole]
    queryset = AdminAuditLog.objects.select_related('actor', 'target_user', 'target_report').all()
