from django.urls import path
from .views import adminlandng
from usersapp.views import user_list, user_create, user_delete

urlpatterns = [
    path('adminlanding/', adminlandng, name='adminlanding'),
    path('list/', user_list, name='user_list'),
    path('users/add/', user_create, name='user_create'),
    path("users/delete/<int:user_id>/", user_delete, name="user_delete"),
]