from django.urls import path
from .views import adminlandng, user_list, user_delete


urlpatterns = [
    path('adminlanding/', adminlandng, name='adminlanding'),
    path('list/', user_list, name='user_list'),
    path("users/delete/<int:user_id>/", user_delete, name="user_delete"),
]