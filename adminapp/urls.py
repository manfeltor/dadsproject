from django.urls import path
from .views import adminlandng
from usersapp.views import user_list, user_create, user_delete, user_edit
from productsapp.views import product_list, product_add, product_edit, product_delete
from productsapp.views import category_list, category_add, category_edit, category_delete
from productsapp.views import rubro_list, rubro_add, rubro_edit, rubro_delete
from ordersapp.views import order_list, order_detail, order_update_status, order_delete

urlpatterns = [
    # main
    path('adminlanding/', adminlandng, name='adminlanding'),

    # users
    path('userlist/', user_list, name='user_list'),
    path('users/add/', user_create, name='user_create'),
    path("users/<int:user_id>/edit/", user_edit, name="user_edit"),
    path("users/delete/<int:user_id>/", user_delete, name="user_delete"),

    # Products
    path("products/", product_list, name="product_list"),
    path("products/add/", product_add, name="product_add"),
    path("products/<int:product_id>/edit/", product_edit, name="product_edit"),
    path("products/<int:product_id>/delete/", product_delete, name="product_delete"),

    # Categories
    path("categories/", category_list, name="category_list"),
    path("categories/add/", category_add, name="category_add"),
    path("categories/<int:category_id>/edit/", category_edit, name="category_edit"),
    path("categories/<int:category_id>/delete/", category_delete, name="category_delete"),

    # Rubro
    path('rubros/', rubro_list, name="rubro_list"),
    path('rubros/add/', rubro_add, name="rubro_add"),
    path('rubros/edit/<int:rubro_id>/', rubro_edit, name="rubro_edit"),
    path('rubros/delete/<int:rubro_id>/', rubro_delete, name="rubro_delete"),

    # Orders
    path("orders/", order_list, name="order_list"),
    path("orders/edit/<int:order_id>/", order_detail, name="order_detail"),
    path("orders/<int:order_id>/status/", order_update_status, name="order_update_status"),
    path("orders/<int:order_id>/delete/", order_delete, name="order_delete"),
]