from django.db import models
from django.utils.text import slugify

class Rubro(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Category(models.Model):
    rubro = models.ForeignKey(Rubro, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True)

    class Meta:
        ordering = ["rubro__name", "name"]

    def __str__(self):
        return f"{self.name} ({self.rubro.name})"


class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products"
    )

    price = models.DecimalField(max_digits=8, decimal_places=2)

    # Discount system
    discount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    discount_name = models.CharField(max_length=120, blank=True)

    featured = models.BooleanField(default=False)

    short_description = models.CharField(max_length=300, blank=True)
    long_description = models.TextField(blank=True)

    image = models.ImageField(upload_to="products/", blank=True, null=True)

    stock = models.PositiveIntegerField(default=0)

    # Bundle system: A product can contain other products
    items = models.ManyToManyField(
        "self",
        blank=True,
        symmetrical=False,
        related_name="included_in"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    # return price minus discount
    @property
    def discounted_price(self):
        return max(self.price - self.discount, 0)

    @property
    def is_bundle(self):
        return self.items.exists()
