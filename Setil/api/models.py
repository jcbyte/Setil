from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractUser, AbstractBaseUser

# Create your models here


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


class Groups(models.Model):
    name = models.TextField(max_length=42)


class GroupUsers(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Groups, on_delete=models.CASCADE)


class Transactions(models.Model):
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    userby = models.ForeignKey(User, on_delete=models.CASCADE)


class TransactionsFor(models.Model):
    transaction = models.ForeignKey(Transactions, on_delete=models.CASCADE)
    userfor = models.ForeignKey(User, on_delete=models.CASCADE)
