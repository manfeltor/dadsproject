from django.urls import path
from .views import adminlandng, user_list


urlpatterns = [
    path('adminlanding/', adminlandng, name='adminlanding'),
    path('list/', user_list, name='user_list'),    
]