from django.urls import path
from rest_framework_simplejwt import views as jwt_views

from .views import CreateUser, GetGroups

urlpatterns = [
    path("user/create", CreateUser.as_view()),
    path(
        "token/obtain",
        jwt_views.TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path("token/refresh", jwt_views.TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify", jwt_views.TokenVerifyView.as_view(), name="token_verify"),
    path("getGroups", GetGroups.as_view()),
]
