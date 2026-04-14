from rest_framework import viewsets, permissions
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from users.models import Notification

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.request.query_params.get('user_id', None)
        
        qs = ChatMessage.objects.filter(Q(sender=user) | Q(receiver=user)).select_related('sender', 'receiver', 'product').order_by('created_at')
        if other_user_id:
             qs = qs.filter(Q(sender_id=other_user_id) | Q(receiver_id=other_user_id))
        return qs

    def perform_create(self, serializer):
        receiver_id = self.request.data.get('receiver_id')
        product_id = self.request.data.get('product_id')
        is_offer = self.request.data.get('is_offer', False)
        offer_amount = self.request.data.get('offer_amount')
        
        if is_offer and offer_amount is not None:
            if float(offer_amount) <= 0:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Offer amount must be greater than zero.")
                
        message = serializer.save(sender=self.request.user, receiver_id=receiver_id, product_id=product_id)
        Notification.objects.create(
            user_id=receiver_id,
            message=f"New message from {self.request.user.username}",
            notification_type='MESSAGE'
        )
        if message.is_offer:
            Notification.objects.create(
                user_id=receiver_id,
                message=f"New offer received: ₹{message.offer_amount}",
                notification_type='OFFER'
            )

    def perform_update(self, serializer):
        instance = self.get_object()
        if 'offer_status' in self.request.data:
            if self.request.user != instance.receiver:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only the receiver can update the offer status.")
        updated = serializer.save()
        if updated.offer_status:
            Notification.objects.create(
                user=updated.sender,
                message=f"Your offer was {updated.offer_status.lower()}",
                notification_type='OFFER'
            )

    @action(detail=True, methods=['post'])
    def counter_offer(self, request, pk=None):
        original = self.get_object()
        if request.user != original.receiver:
            return Response({'error': 'Only receiver can counter an offer.'}, status=status.HTTP_403_FORBIDDEN)
        amount = request.data.get('offer_amount')
        if amount is None:
            return Response({'error': 'offer_amount is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            amount = float(amount)
            if amount <= 0:
                return Response({'error': 'Offer amount must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'error': 'Invalid offer amount.'}, status=status.HTTP_400_BAD_REQUEST)

        counter = ChatMessage.objects.create(
            sender=request.user,
            receiver=original.sender,
            product=original.product,
            content=f"Counter offer: ₹{amount}",
            is_offer=True,
            offer_amount=amount,
            offer_status='PENDING'
        )
        Notification.objects.create(
            user=counter.receiver,
            message=f"Counter offer received: ₹{amount}",
            notification_type='OFFER'
        )
        return Response(ChatMessageSerializer(counter).data, status=status.HTTP_201_CREATED)
