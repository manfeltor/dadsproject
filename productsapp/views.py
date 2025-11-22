from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test
from django.db.models import ProtectedError
from .models import Product, Category, Rubro
from .forms import ProductForm, RubroForm, CategoryForm


def is_manager(user):
    return user.is_authenticated and user.role == 'manager'


@user_passes_test(is_manager, login_url="/unauthorized/")
def product_list(request):
    products = Product.objects.select_related("category", "category__rubro").order_by("name")
    return render(request, "product_list.html", {"products": products})


@user_passes_test(is_manager, login_url="/unauthorized/")
def product_add(request):
    if request.method == "POST":
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save()
            messages.success(request, "Product created successfully!")
            return redirect("product_list")
    else:
        form = ProductForm()

    return render(request, "product_add.html", {"form": form})


@user_passes_test(is_manager, login_url="/unauthorized/")
def product_edit(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.method == "POST":
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            messages.success(request, "Product updated successfully!")
            return redirect("product_list")
    else:
        form = ProductForm(instance=product)

    return render(request, "product_edit.html", {"form": form, "product": product})


@user_passes_test(is_manager, login_url="/unauthorized/")
def product_delete(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.method == "POST":
        try:
            product.delete()
            messages.success(request, "Product deleted successfully!")
        except ProtectedError:
            messages.error(
                request,
                "This product cannot be deleted because it is referenced somewhere else (maybe bundles or future orders)."
            )
        return redirect("product_list")

    return redirect("product_list")


@user_passes_test(is_manager, login_url="/unauthorized/")
def category_list(request):
    categories = Category.objects.select_related("rubro").order_by("rubro__name", "name")
    return render(request, "category_list.html", {"categories": categories})


@user_passes_test(is_manager, login_url="/unauthorized/")
def category_add(request):
    if request.method == "POST":
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Category created successfully!")
            return redirect("category_list")
    else:
        form = CategoryForm()

    return render(request, "category_add.html", {"form": form})


@user_passes_test(is_manager, login_url="/unauthorized/")
def category_edit(request, category_id):
    category = get_object_or_404(Category, id=category_id)

    if request.method == "POST":
        form = CategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, "Category updated successfully!")
            return redirect("category_list")
    else:
        form = CategoryForm(instance=category)

    return render(request, "category_edit.html", {"form": form, "category": category})


@user_passes_test(is_manager, login_url="/unauthorized/")
def category_delete(request, category_id):
    category = get_object_or_404(Category, id=category_id)

    if request.method == "POST":
        try:
            category.delete()
            messages.success(request, "Category deleted successfully!")
        except ProtectedError:
            messages.error(
                request,
                "Cannot delete this Category because products are still assigned to it. "
                "Please reassign or delete those products first."
            )
        return redirect("category_list")

    return redirect("category_list")



@user_passes_test(is_manager, login_url='/unauthorized/')
def rubro_list(request):
    rubros = Rubro.objects.all().order_by("name")
    return render(request, "rubro_list.html", {"rubros": rubros})

@user_passes_test(is_manager, login_url="/unauthorized/")
def rubro_add(request):
    if request.method == "POST":
        form = RubroForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Rubro created successfully!")
            return redirect("rubro_list")
    else:
        form = RubroForm()

    return render(request, "rubro_add.html", {"form": form})


@user_passes_test(is_manager, login_url="/unauthorized/")
def rubro_edit(request, rubro_id):
    rubro = get_object_or_404(Rubro, id=rubro_id)

    if request.method == "POST":
        form = RubroForm(request.POST, instance=rubro)
        if form.is_valid():
            form.save()
            messages.success(request, "Rubro updated successfully!")
            return redirect("rubro_list")
    else:
        form = RubroForm(instance=rubro)

    return render(request, "rubro_edit.html", {"form": form, "rubro": rubro})


@user_passes_test(is_manager, login_url="/unauthorized/")
def rubro_delete(request, rubro_id):
    rubro = get_object_or_404(Rubro, id=rubro_id)

    if request.method == "POST":
        try:
            rubro.delete()
            messages.success(request, "Rubro deleted successfully!")
        except ProtectedError:
            messages.error(
                request,
                "Cannot delete this Rubro because categories are still assigned to it. "
                "Please reassign or delete those categories first."
            )
        return redirect("rubro_list")

    return redirect("rubro_list")