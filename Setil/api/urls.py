from django.urls import path, include

from .views import (
    CreateGroup,
    GetGroups,
    JoinGroup,
    LeaveGroup,
    LoadGroupTransactions,
    AddTransactions,
)

urlpatterns = [
    path("user/", include("api.userurls")),
    path("token/", include("api.tokenurls")),
    path("createGroup", CreateGroup.as_view()),
    path("getGroups", GetGroups.as_view()),
    path("joinGroup", JoinGroup.as_view()),
    path("leaveGroup", LeaveGroup.as_view()),
    path("loadGroupTransactions", LoadGroupTransactions.as_view()),
    path("addTransaction", AddTransactions.as_view()),
]
