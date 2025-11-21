from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import user_passes_test
from usersapp.models import CustomUser
from django.contrib import messages

def is_manager(user):
    return user.is_authenticated and user.role == 'manager'

def adminlandng(request):
    return render(request, 'admin.html')