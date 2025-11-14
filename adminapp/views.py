from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from usersapp.models import CustomUser

def is_manager(user):
    return user.is_authenticated and user.role == 'manager'

def adminlandng(request):
    return render(request, 'admin.html')

@user_passes_test(is_manager, login_url='/unauthorized/')
def user_list(request):
    users = CustomUser.objects.all().order_by('username')
    return render(request, 'user_list.html', {'users': users})