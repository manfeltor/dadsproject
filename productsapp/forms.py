from django import forms
from .models import Product, Category, Rubro

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            "name",
            "slug",
            "category",
            "price",
            "discount",
            "discount_name",
            "featured",
            "short_description",
            "long_description",
            "image",
            "stock",
            "items",
        ]

        widgets = {
            "short_description": forms.TextInput(attrs={"class": "form-control"}),
            "long_description": forms.Textarea(attrs={"class": "form-control", "rows": 5}),
            "items": forms.SelectMultiple(attrs={"class": "form-control"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-control'})

class RubroForm(forms.ModelForm):
    class Meta:
        model = Rubro
        fields = ["name", "slug"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({"class": "form-control"})

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ["rubro", "name", "slug"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({"class": "form-control"})


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            "name",
            "slug",
            "category",
            "price",
            "discount",
            "discount_name",
            "featured",
            "short_description",
            "long_description",
            "image",
            "stock",
            "items",   # the bundle M2M
        ]

    widgets = {
        "long_description": forms.Textarea(attrs={"rows": 4}),
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({"class": "form-control"})