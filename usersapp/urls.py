from django.urls import path
from .views import user_create, user_list, user_delete

urlpatterns = [
    path('add/', user_create, name='user_create'),
    path('delete/<int:pk>/', user_delete, name='user_delete'),
]