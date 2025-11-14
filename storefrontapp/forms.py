from django import forms

class ContactForm(forms.Form):
    full_name = forms.CharField(label="Full Name", max_length=120)
    email = forms.EmailField(label="Email")
    company = forms.CharField(label="Company / Business", max_length=120, required=False)
    message = forms.CharField(label="Message", widget=forms.Textarea(attrs={"rows": 5}))
