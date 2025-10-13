from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    MANAGER = 'manager'
    CLIENT = 'cliente'

    ROLE_CHOICES = [
        (MANAGER, 'Manager'),
        (CLIENT, 'Cliente'),
    ]

    phone_number = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=CLIENT)

    def __str__(self):
        return self.username

    @property
    def is_management(self):
        return self.role == self.MANAGER