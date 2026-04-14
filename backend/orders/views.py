from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer
from products.models import Product

class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart = Cart.objects.prefetch_related('items__product__seller', 'items__product__category').get(id=cart.id)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        
        try:
            quantity = int(request.data.get('quantity', 1))
            if quantity <= 0:
                return Response({"error": "Quantity must be greater than zero"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if quantity > product.stock:
            return Response({"error": f"Only {product.stock} items left in stock"}, status=status.HTTP_400_BAD_REQUEST)
            
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()
        
        cart = Cart.objects.prefetch_related('items__product__seller', 'items__product__category').get(id=cart.id)
        return Response(CartSerializer(cart).data)
        
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        cart = Cart.objects.get(user=request.user)
        product_id = request.data.get('product_id')
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')
        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response({"error": "Quantity must be greater than zero"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)

        item = CartItem.objects.filter(cart=cart, product_id=product_id).select_related('product').first()
        if not item:
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

        if quantity > item.product.stock:
            return Response({"error": f"Only {item.product.stock} items left in stock"}, status=status.HTTP_400_BAD_REQUEST)

        item.quantity = quantity
        item.save()
        cart = Cart.objects.prefetch_related('items__product__seller', 'items__product__category').get(id=cart.id)
        return Response(CartSerializer(cart).data)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.select_related('buyer').prefetch_related('items__product__seller', 'items__product__category')
        
        if getattr(user, 'role', '') == 'ADMIN' or user.is_staff:
            return queryset.order_by('-created_at')
        if getattr(user, 'role', '') == 'SELLER':
            return queryset.filter(items__product__seller=user).distinct().order_by('-created_at')
        return queryset.filter(buyer=user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        cart = Cart.objects.get(user=request.user)
        if not cart.items.exists():
             return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
             
        total_price = sum(item.product.price * item.quantity for item in cart.items.all())
        order = Order.objects.create(buyer=request.user, total_price=total_price)
        
        for item in cart.items.all():
            if item.quantity > item.product.stock:
                order.delete() # rollback
                return Response({"error": f"{item.product.title} is out of stock!"}, status=status.HTTP_400_BAD_REQUEST)
                
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            # Deduct stock
            item.product.stock -= item.quantity
            item.product.purchases_count += item.quantity
            item.product.save()
            
        cart.items.all().delete()
        
        # Refetch order to ensure nested serialization works reliably
        order = Order.objects.select_related('buyer').prefetch_related('items__product__seller', 'items__product__category').get(id=order.id)
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
