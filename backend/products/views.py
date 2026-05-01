from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Category, Product, Review, Wishlist
from .serializers import CategorySerializer, ProductSerializer, ReviewSerializer, WishlistSerializer
from .permissions import IsSellerOrAdminOrReadOnly
from django.db.models import Avg
from orders.models import Cart, CartItem

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('seller', 'category').prefetch_related('reviews__user').order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsSellerOrAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
        
    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        location = self.request.query_params.get('location', None)
        sort = self.request.query_params.get('sort', None)
        seller_id = self.request.query_params.get('seller', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        min_rating = self.request.query_params.get('min_rating', None)
        in_stock = self.request.query_params.get('in_stock', None)
        
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(Q(title__icontains=search) | Q(tags__icontains=search))
        if location:
            queryset = queryset.filter(seller__location__icontains=location)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if in_stock in ('1', 'true', 'True'):
            queryset = queryset.filter(stock__gt=0)
        if min_rating:
            queryset = queryset.annotate(avg_rating=Avg('reviews__rating')).filter(avg_rating__gte=min_rating)
            
        if sort == 'trending':
            return queryset.order_by('-views_count', '-purchases_count', '-created_at')
        if sort == 'price_low':
            return queryset.order_by('price', '-created_at')
        if sort == 'price_high':
            return queryset.order_by('-price', '-created_at')
        if sort == 'rating':
            return queryset.annotate(avg_rating=Avg('reviews__rating')).order_by('-avg_rating', '-created_at')
            
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        product = self.get_object()
        product.views_count += 1
        product.save()
        return Response({'status': 'view incremented'})

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # The product_id usually comes from the URL, assuming nested or passed in data
        serializer.save(user=self.request.user)

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product__seller', 'product__category').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def move_to_cart(self, request):
        wishlist_id = request.data.get('wishlist_id')
        quantity = int(request.data.get('quantity', 1))
        wishlist_item = Wishlist.objects.filter(id=wishlist_id, user=request.user).select_related('product').first()
        if not wishlist_item:
            return Response({'error': 'Wishlist item not found.'}, status=status.HTTP_404_NOT_FOUND)

        product = wishlist_item.product
        if quantity <= 0:
            return Response({'error': 'Quantity must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity > product.stock:
            return Response({'error': f'Only {product.stock} items left in stock.'}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if created:
            cart_item.quantity = quantity
        else:
            cart_item.quantity += quantity
        if cart_item.quantity > product.stock:
            return Response({'error': f'Only {product.stock} items left in stock.'}, status=status.HTTP_400_BAD_REQUEST)
        cart_item.save()
        wishlist_item.delete()
        return Response({'message': 'Moved to cart successfully.'}, status=status.HTTP_200_OK)
