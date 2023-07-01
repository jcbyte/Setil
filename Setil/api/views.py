from django.shortcuts import render

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated

from .serialisers import UserSerialiser
from .models import User, Groups, GroupUsers, Transactions, TransactionsFor

# Create your views here.


class CreateUser(APIView):
    def post(self, request):
        serializer = UserSerialiser(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)


class CreateGroup(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, req, format=None):
        pass


class GetGroups(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, req, format=None):
        groups = GroupUsers.objects.filter(user=req.user)
        groupList = [group.name for group in groups]

        return JsonResponse({"groups": groupList}, status=status.HTTP_200_OK)


# Create user
# Load user groups list
# Load trqansactions in group
# Add transaction
# Edit transaction
# Delete transaction
# Create group
# Join group
# Leave group
# Delte user
# Change password
