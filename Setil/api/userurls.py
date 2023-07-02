from django.urls import path

from .views import CreateUser

urlpatterns = [
    path("create", CreateUser.as_view()),
]
