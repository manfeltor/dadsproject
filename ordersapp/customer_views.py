# dadsproject/ordersapp/customer_views.py

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator

from .models import Order


@login_required(login_url="/login/")
def my_orders(request):
    """
    List of orders for the logged-in customer.
    Read-only.
    """
    orders_qs = (
        Order.objects
        .filter(user=request.user)
        .only(
            "id",
            "status",
            "delivery_method",
            "total",
            "created_at",
        )
        .order_by("-created_at")
    )

    paginator = Paginator(orders_qs, 10)  # MVP-friendly
    page_number = request.GET.get("page") or 1
    page_obj = paginator.get_page(page_number)

    return render(
        request,
        "my_orders.html",
        {
            "page_obj": page_obj,
        },
    )


@login_required(login_url="/login/")
def my_order_detail(request, order_id: int):
    """
    Read-only order detail for the logged-in customer.
    HARD security rule: user-scoped lookup.
    """
    order = get_object_or_404(
        Order.objects
        .filter(user=request.user)
        .prefetch_related("items"),
        id=order_id,
    )

    return render(
        request,
        "my_order_detail.html",
        {
            "order": order,
        },
    )
