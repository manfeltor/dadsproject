# dadsproject/ordersapp/forms.py

from django import forms
from django.contrib.auth import get_user_model
from productsapp.models import Product
from .models import Order

User = get_user_model()

class OrderAddForm(forms.Form):
    customer_user = forms.ModelChoiceField(
        queryset=User.objects.all().order_by("username"),
        required=False,
        label="Assign to User",
    )

    customer_name = forms.CharField(max_length=120)
    customer_email = forms.EmailField()
    customer_address = forms.CharField(max_length=250, required=False)
    customer_phone = forms.CharField(max_length=40, required=False)

    delivery_method = forms.ChoiceField(
        choices=Order.DeliveryMethod.choices,
        initial=Order.DeliveryMethod.PICKUP,
    )

    note = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 3}),
        required=False,
    )

    # Dynamic items will be processed manually in the view
    # items-[index]-product_id
    # items-[index]-quantity
