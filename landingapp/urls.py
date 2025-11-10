from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import SBLoginView, home, unauthorized


urlpatterns = [
    path('', home, name='home'),
    path('login/', SBLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
    path('unauthorized/', unauthorized, name='unauthorized'),
]