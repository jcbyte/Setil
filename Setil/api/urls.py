from django.urls import path
from rest_framework_simplejwt import views as jwt_views

from .views import (
    CreateUser,
    CreateGroup,
    GetGroups,
    JoinGroup,
    LeaveGroup,
    LoadGroupTransactions,
    AddTransactions,
)

urlpatterns = [
    path("user/create", CreateUser.as_view()),
    path(
        "token/obtain",
        jwt_views.TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path("token/refresh", jwt_views.TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify", jwt_views.TokenVerifyView.as_view(), name="token_verify"),
    path("createGroup", CreateGroup.as_view()),
    path("getGroups", GetGroups.as_view()),
    path("joinGroup", JoinGroup.as_view()),
    path("leaveGroup", LeaveGroup.as_view()),
    path("loadGroupTransactions", LoadGroupTransactions.as_view()),
    path("addTransaction", AddTransactions.as_view()),
]
