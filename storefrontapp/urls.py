from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import SBLoginView, home, unauthorized, newcontact
from productsapp.apis import products_api
from ordersapp.apis import checkout_api


urlpatterns = [
    path('', home, name='home'),
    path('login/', SBLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
    path('unauthorized/', unauthorized, name='unauthorized'),
    path('newcontact/', newcontact, name='newcontact'),
    path("api/products/", products_api, name="products_api"),
    path("api/checkout/", checkout_api, name="checkout_api"),
]