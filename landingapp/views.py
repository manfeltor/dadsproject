from django.shortcuts import render
from django.contrib.auth.views import LoginView
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required

# Create your views here.

@login_required
def home(request):
    return render(request, 'landing.html')

class SBLoginView(LoginView):
    template_name = 'login.html'
    authentication_form = AuthenticationForm
    redirect_authenticated_user = True  # if already logged in, skip login page

    def form_valid(self, form):
        response = super().form_valid(form)
        remember = self.request.POST.get('remember_me')
        if remember:
            # keep default (2 weeks) or set explicitly:
            self.request.session.set_expiry(60 * 60 * 24 * 14)  # 2 weeks
        else:
            # expire when browser closes
            self.request.session.set_expiry(0)
        return response
    
def unauthorized(request):
    return render(request, 'unauthorized.html', status=403)