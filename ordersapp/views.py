from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.views.decorators.http import require_POST
from django.db.models import ProtectedError
import traceback
from .models import Order

def is_manager(user):
    return user.is_authenticated and user.role == "manager"


@user_passes_test(is_manager, login_url="/unauthorized/")
def order_list(request):
    orders = Order.objects.all().order_by("-created_at")
    return render(request, "orders/order_list.html", {"orders": orders})


@user_passes_test(is_manager, login_url="/unauthorized/")
def order_detail(request, order_id: int):
    order = get_object_or_404(Order.objects.prefetch_related("items"), id=order_id)

    return render(
        request,
        "orders/order_detail.html",
        {
            "order": order,
            "status_choices": Order.Status.choices,  # for dropdown
        },
    )


@require_POST
@user_passes_test(is_manager, login_url="/unauthorized/")
def order_update_status(request, order_id: int):
    order = get_object_or_404(Order, id=order_id)

    new_status = (request.POST.get("status") or "").strip()
    valid_statuses = {c[0] for c in Order.Status.choices}

    if new_status not in valid_statuses:
        messages.error(request, "Invalid status.")
        return redirect("order_detail", order_id=order.id)

    if new_status == order.status:
        messages.info(request, "Status unchanged.")
        return redirect("order_detail", order_id=order.id)

    order.status = new_status
    order.save(update_fields=["status", "updated_at"])

    messages.success(request, f"Order #{order.id} status updated to '{new_status}'.")
    return redirect("order_detail", order_id=order.id)

@user_passes_test(is_manager, login_url="/unauthorized/")
def order_delete(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if request.method == "POST":
        try:
            order.delete()
            messages.success(request, "Orden eliminada con exito!")
        except ProtectedError:
            messages.error(
                request,
                "Esta orden no pudo ser eliminada."
            )
        return redirect("order_list")

    return redirect("order_list")
