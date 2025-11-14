from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse
from .forms import ContactForm
from django.core.mail import send_mail
from django.conf import settings

# Create your views here.

# @login_required
def home(request):
    return render(request, 'landing.html')

class SBLoginView(LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True

    def form_valid(self, form):
        response = super().form_valid(form)
        remember = self.request.POST.get('remember_me')
        self.request.session.set_expiry(60 * 60 * 24 * 14 if remember else 0)
        return response

    def form_invalid(self, form):
        # If coming from homepage modal → redirect there with ?error
        referer = self.request.META.get("HTTP_REFERER", "")
        if "/" in referer and "login" not in referer:
            messages.error(self.request, "Incorrect username or password.")
            return redirect(f"{reverse('login')}?error=1")
        # Otherwise render full login page with errors
        messages.error(self.request, "Incorrect username or password.")
        return super().form_invalid(form)

    
def unauthorized(request):
    return render(request, 'unauthorized.html', status=403)


def newcontact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            # send_mail( TODO
            #     subject=f"[Account Request] {data['full_name']}",
            #     message=f"Name: {data['full_name']}\nEmail: {data['email']}\nCompany: {data['company']}\n\nMessage:\n{data['message']}",
            #     from_email=settings.DEFAULT_FROM_EMAIL,
            #     recipient_list=['admin@yourdomain.com'],
            # )
            messages.success(request, "Your request has been sent. We’ll contact you soon!")
            return render(request, "contact.html", {"form": ContactForm(), "sent": True})
    else:
        form = ContactForm()

    return render(request, "contact.html", {"form": form})

def adminlanding(request):
    return render(request, 'admin.html')