from rest_framework import viewsets, permissions
from .models import Category, Product, Review
from .serializers import CategorySerializer, ProductSerializer, ReviewSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
        
    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        location = self.request.query_params.get('location', None)
        
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if search:
            queryset = queryset.filter(title__icontains=search)
        if location:
            queryset = queryset.filter(seller__location__icontains=location)
            
        return queryset
        
    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        if request.user == product.seller or request.user.role == 'ADMIN' or request.user.is_staff:
            return super().destroy(request, *args, **kwargs)
        return Response({"error": "Not authorized to delete this product"}, status=status.HTTP_403_FORBIDDEN)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # The product_id usually comes from the URL, assuming nested or passed in data
        serializer.save(user=self.request.user)
