# dadsproject/ordersapp/apis.py

import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from .services import create_order_from_payload


@require_POST
@login_required(login_url="/login/")
def checkout_api(request):
    """
    JSON-only endpoint for creating orders.
    Authenticated users only.
    """

    # Parse JSON input
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse(
            {"status": "error", "message": "Invalid JSON payload"},
            status=400,
        )

    # Call the service layer
    try:
        order = create_order_from_payload(request.user, payload)
    except ValidationError as e:
        return JsonResponse(
            {"status": "error", "message": str(e)},
            status=400,
        )
    except Exception:
        return JsonResponse(
            {"status": "error", "message": "Internal error while creating order"},
            status=500,
        )

    # Return order summary
    return JsonResponse({
        "status": "ok",
        "order_id": order.id,
        "subtotal": float(order.subtotal),
        "shipping": float(order.shipping_total),
        "total": float(order.total),
        "items": [
            {
                "product_id": item.product_id,
                "name": item.product_name,
                "qty": item.quantity,
                "unit_price": float(item.unit_price),
                "line_total": float(item.line_total),
            }
            for item in order.items.all()
        ]
    }, status=201)
