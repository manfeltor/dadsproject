# ordersapp/services.py
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from productsapp.models import Product
from .models import Order, OrderItem


def create_order_from_payload(user, payload: dict) -> Order:
    """
    Creates an Order + OrderItems from payload.

    IMPORTANT:
    - No stock decrement.
    - No stock mutation.
    - No side-effects (no logs, no external calls).
    - Only validates, computes, creates, and returns the order.

    Payload example:
    {
        "delivery_method": "pickup",
        "customer_name": "...",
        "customer_email": "...",
        "customer_address": "...",
        "customer_phone": "...",
        "note": "...",
        "items": [
            {"product_id": 1, "quantity": 2},
            ...
        ]
    }
    """

    items_data = payload.get("items") or []
    if not items_data:
        raise ValidationError("No items in order.")

    # Delivery method validation
    delivery_method = payload.get("delivery_method") or Order.DeliveryMethod.PICKUP
    valid_methods = [c[0] for c in Order.DeliveryMethod.choices]
    if delivery_method not in valid_methods:
        raise ValidationError("Invalid delivery method.")

    # Customer data
    customer_name = (payload.get("customer_name") or "").strip()
    customer_email = (payload.get("customer_email") or "").strip()
    customer_address = (payload.get("customer_address") or "").strip()
    customer_phone = (payload.get("customer_phone") or "").strip()
    note = payload.get("note") or ""

    if not customer_name or not customer_email:
        raise ValidationError("Customer name and email are required.")

    # Load product objects in a single query
    product_ids = [i.get("product_id") for i in items_data if i.get("product_id")]
    products = Product.objects.in_bulk(product_ids)

    subtotal = Decimal("0.00")
    discount_total = Decimal("0.00")

    order_items_to_create = []

    @transaction.atomic
    def _create():
        nonlocal subtotal, discount_total

        # Create order with temporary zero totals
        order = Order.objects.create(
            user=user if (user and user.is_authenticated) else None,
            delivery_method=delivery_method,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_address=customer_address if delivery_method == Order.DeliveryMethod.DELIVERY else "",
            customer_phone=customer_phone,
            note=note,
            subtotal=Decimal("0.00"),
            discount_total=Decimal("0.00"),
            shipping_total=Decimal("0.00"),
            total=Decimal("0.00"),
        )

        # Iterate items
        for item in items_data:
            pid = item.get("product_id")
            qty = int(item.get("quantity") or 0)

            if not pid or qty <= 0:
                continue

            product = products.get(pid)
            if not product:
                raise ValidationError(f"Product with id={pid} not found.")

            # Pricing logic (backend is the truth)
            unit_price = product.discounted_price
            original_price = product.price
            line_total = unit_price * qty

            # Accumulate totals
            subtotal += line_total

            # Track discount granted
            discount_unit = (original_price - unit_price)
            if discount_unit > 0:
                discount_total += discount_unit * qty

            # Snapshot item
            order_items_to_create.append(
                OrderItem(
                    order=order,
                    product=product,
                    product_name=product.name,
                    unit_price=unit_price,
                    quantity=qty,
                    line_total=line_total,
                )
            )

        if not order_items_to_create:
            raise ValidationError("No valid items in order.")

        # Save items
        OrderItem.objects.bulk_create(order_items_to_create)

        # Shipping rules (match your frontend logic)
        if subtotal == 0:
            shipping = Decimal("0.00")
        elif subtotal >= Decimal("30.00"):
            shipping = Decimal("0.00")
        else:
            shipping = Decimal("4.50")

        total = subtotal + shipping

        # Finalize totals
        order.subtotal = subtotal
        order.discount_total = discount_total
        order.shipping_total = shipping
        order.total = total
        order.save(update_fields=["subtotal", "discount_total", "shipping_total", "total"])

        return order

    return _create()
