from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = (
            'username',
            'email',
            'phone_number',
            'role',
            'description',
            'password1',
            'password2',
        )
        labels = {
            'username': 'Nombre de usuario',
            'email': 'Email',
            'phone_number': 'Numero de telefono',
            'role': 'Rol del usuario',
            'description': 'Descripcion',
            'password1': 'Contraseña',
            'password2': 'Confirmar contraseña',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({
                'class': 'form-control',
            })

class CustomUserEditForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = (
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "description",
            "role",
            "is_active",
        )
        labels = {
            "first_name": "Nombre",
            "last_name": "Apellido",
            "email": "Email",
            "phone_number": "Telefono",
            "description": "Descripcion",
            "role": "Rol",
            "is_active": "Activo",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Consistent styling with the rest of your forms
        for field in self.fields.values():
            field.widget.attrs.update({"class": "form-control"})

        # Checkbox needs special handling
        if "is_active" in self.fields:
            self.fields["is_active"].widget.attrs.update(
                {"class": "form-check-input"}
            )
        self.fields["is_active"].help_text = (
            "Indica si el usuario está activo. "
            "Desmárcalo en lugar de eliminar la cuenta."
        )