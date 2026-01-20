from django.shortcuts import render

def is_manager(user):
    return user.is_authenticated and user.role == 'manager'

def adminlandng(request):
    return render(request, 'admin/admin.html')