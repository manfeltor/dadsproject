from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test
from .forms import CustomUserCreationForm, CustomUserEditForm
from django.contrib.auth import get_user_model
from .models import CustomUser


def is_manager(user):
    return user.is_authenticated and user.role == 'manager'

User = get_user_model()

@user_passes_test(is_manager, login_url='/unauthorized/')
def user_list(request):
    users = CustomUser.objects.all().order_by('username')
    return render(request, 'user/user_list.html', {'users': users})

@user_passes_test(is_manager, login_url='/unauthorized/')
def user_create(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'User created successfully!')
            return redirect('user/user_list')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'user/user_create.html', {'form': form})

@user_passes_test(is_manager, login_url='/unauthorized/')
def user_delete(request, user_id):
    user_to_delete = get_object_or_404(CustomUser, id=user_id)

    # prevent deleting yourself
    if request.user.id == user_id:
        messages.error(request, "You cannot delete your own account.")
        return redirect("user_list")

    if request.method == "POST":
        username = user_to_delete.username
        user_to_delete.delete()
        messages.success(request, f"User '{username}' deleted successfully.")
        return redirect("user_list")

    return redirect("user_list")

@user_passes_test(is_manager, login_url="/unauthorized/")
def user_edit(request, user_id: int):
    """
    Manager-only edit user.
    Guardrails:
      - cannot deactivate yourself
      - cannot demote yourself from manager to cliente
    """
    user_obj = get_object_or_404(CustomUser, id=user_id)

    if request.method == "POST":
        form = CustomUserEditForm(request.POST, instance=user_obj)
        if form.is_valid():
            edited = form.save(commit=False)

            # --- Guardrails for self-edit ---
            if request.user.id == user_obj.id:
                # prevent self-demotion
                if edited.role != CustomUser.MANAGER:
                    messages.error(request, "No puedes cambiar tu propio rol.")
                    return redirect("user_edit", user_id=user_obj.id)

                # prevent self-disable
                if edited.is_active is False:
                    messages.error(request, "No puedes desactivar tu propia cuenta.")
                    return redirect("user_edit", user_id=user_obj.id)

            edited.save()
            messages.success(request, "Usuario actualizado correctamente!")
            return redirect("user_list")
    else:
        form = CustomUserEditForm(instance=user_obj)

    return render(request, "user/user_edit.html", {"form": form, "user_obj": user_obj})