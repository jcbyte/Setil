from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractUser, AbstractBaseUser

# Create your models here

import string
import random


def genUniqueCode():
    LENGTH = 6
    while True:
        code = "".join(random.choices(string.ascii_uppercase, k=LENGTH))
        if not Group.objects.filter(code=code).exists():
            return code


class UserManager(BaseUserManager):
    pass


class User(AbstractBaseUser):
    username = models.TextField(max_length=42, unique=True)
    name = models.TextField(max_length=42)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "username"

    def __str__(self):
        return self.username


class Group(models.Model):
    name = models.TextField(max_length=42)
    code = models.TextField(max_length=42, default=genUniqueCode, unique=True)


class GroupUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)


class Transaction(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    userby = models.ForeignKey(User, on_delete=models.CASCADE)


class TransactionFor(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    userfor = models.ForeignKey(User, on_delete=models.CASCADE)
