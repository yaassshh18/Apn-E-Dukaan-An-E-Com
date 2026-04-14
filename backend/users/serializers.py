from rest_framework import serializers
from .models import User, Notification, Report, AdminAuditLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'admin_level', 'is_suspended', 'phone_number', 'location', 'latitude', 'longitude', 'is_verified', 'profile_picture')

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    report_age_hours = serializers.SerializerMethodField()
    repeat_offender_count = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = '__all__'

    def get_report_age_hours(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        return round(delta.total_seconds() / 3600, 2)

    def get_repeat_offender_count(self, obj):
        if obj.reported_user_id:
            return Report.objects.filter(reported_user_id=obj.reported_user_id).count()
        if obj.reported_product_id:
            return Report.objects.filter(reported_product_id=obj.reported_product_id).count()
        return 0

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'location')

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("user with this email address already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'BUYER'),
            location=validated_data.get('location', '')
        )
        return user

class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)


class AdminUserSerializer(serializers.ModelSerializer):
    reports_against = serializers.IntegerField(source='received_reports.count', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'admin_level', 'is_active', 'is_suspended', 'is_verified', 'reports_against', 'date_joined')


class AdminAuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)
    target_user_name = serializers.CharField(source='target_user.username', read_only=True)

    class Meta:
        model = AdminAuditLog
        fields = ('id', 'actor', 'actor_name', 'action', 'target_user', 'target_user_name', 'target_report', 'metadata', 'created_at')
