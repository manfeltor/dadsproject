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