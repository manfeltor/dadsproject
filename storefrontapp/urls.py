from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import SBLoginView, home, unauthorized, newcontact
from productsapp.apis import products_api
from ordersapp.apis import checkout_api
from ordersapp.customer_views import my_orders, my_order_detail


urlpatterns = [
    path('', home, name='home'),
    path('login/', SBLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
    path('unauthorized/', unauthorized, name='unauthorized'),
    path('newcontact/', newcontact, name='newcontact'),
    path("api/products/", products_api, name="products_api"),
    path("api/checkout/", checkout_api, name="checkout_api"),

     # Customer Orders
    path('my-orders/', my_orders, name='my_orders'),
    path('my-orders/<int:order_id>/', my_order_detail, name='my_order_detail'),

    # Unauth
]