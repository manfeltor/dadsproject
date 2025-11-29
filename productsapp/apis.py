from django.http import JsonResponse
from django.core.paginator import Paginator
from django.db.models import Q
from django.conf import settings
from .models import Product, Category, Rubro


def products_api(request):
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 40))
    search = request.GET.get("search", "").strip()
    rubro_slug = request.GET.get("rubro", "").strip()
    category_slug = request.GET.get("category", "").strip()
    sort = request.GET.get("sort", "default")

    # Base queryset
    qs = Product.objects.select_related("category", "category__rubro")

    # Search
    if search:
        qs = qs.filter(
            Q(name__icontains=search)
            | Q(short_description__icontains=search)
            | Q(long_description__icontains=search)
        )

    # Rubro filter
    if rubro_slug:
        qs = qs.filter(category__rubro__slug=rubro_slug)

    # Category filter
    if category_slug:
        qs = qs.filter(category__slug=category_slug)

    # Sorting
    if sort == "price-asc":
        qs = qs.order_by("price")
    elif sort == "price-desc":
        qs = qs.order_by("-price")
    elif sort == "name-asc":
        qs = qs.order_by("name")
    else:  # default sort
        qs = qs.order_by("-featured", "name")

    # Pagination
    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page)

    # Serialize products
    products_data = []
    for p in page_obj:
        products_data.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.discounted_price),
            "original_price": float(p.price),
            "discount": float(p.discount),
            "discount_name": p.discount_name,
            "short_description": p.short_description,
            "long_description": p.long_description,
            "image": p.image.url if p.image else "",
        })

    # Rubros + categories (for filters)
    rubros = list(Rubro.objects.all().values("id", "name", "slug"))
    categories = list(Category.objects.all().values("id", "name", "slug", "rubro_id"))

    return JsonResponse({
        "results": products_data,
        "page": page_obj.number,
        "total_pages": paginator.num_pages,
        "rubros": rubros,
        "categories": categories,
    })
