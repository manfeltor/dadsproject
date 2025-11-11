from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse

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