from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test
from .forms import CustomUserCreationForm
from django.contrib.auth import get_user_model
from .models import CustomUser


def is_manager(user):
    return user.is_authenticated and user.role == 'manager'


@user_passes_test(is_manager, login_url='/unauthorized/')
def user_create(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'User created successfully!')
            return redirect('user_list')  # We'll define this view next
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'user_create.html', {'form': form})

User = get_user_model()

@user_passes_test(is_manager, login_url='/unauthorized/')
def user_list(request):
    users = CustomUser.objects.all().order_by('username')
    return render(request, 'user_list.html', {'users': users})

@user_passes_test(is_manager, login_url='/unauthorized/')
def user_delete(request, pk):
    user_to_delete = get_object_or_404(CustomUser, pk=pk)
    
    # Prevent self-deletion
    if request.user == user_to_delete:
        messages.error(request, "You cannot delete your own account.")
        return redirect('user_list')
    
    username = user_to_delete.username
    user_to_delete.delete()
    messages.success(request, f"User '{username}' eliminated successfully.")
    print(messages)
    return redirect('user_list')