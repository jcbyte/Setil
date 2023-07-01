from django.shortcuts import render

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated

from .serialisers import (
    UserSerialiser,
    GroupSerialiser,
    UserDataSerialiser,
    GroupDataSerialiser,
    GroupCodeSerialiser,
    GroupIdSerialiser,
    GroupAddTransactionSerialiser,
)
from .models import User, Group, GroupUser, Transaction, TransactionFor

# Create your views here.


class CreateUser(APIView):
    def post(self, req):
        # Use serialiser to validate input
        serializer = UserSerialiser(data=req.data)
        if serializer.is_valid(raise_exception=True):
            # If valid then create user
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)


class CreateGroup(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, req, format=None):
        # Use serialiser to validate input
        serializer = GroupSerialiser(data=req.data)
        if serializer.is_valid():
            # If valid then create group
            group = serializer.save()
            # Add the current user to group
            newGroupUser = GroupUser(user=req.user, group=group)
            newGroupUser.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class GetGroups(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, req, format=None):
        # Get list of groups user is in
        groups = GroupUser.objects.filter(user=req.user)
        groupList = [GroupDataSerialiser(group.group).data for group in groups]

        return JsonResponse({"groups": groupList}, status=status.HTTP_200_OK)


class JoinGroup(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, req, format=None):
        serializer = GroupCodeSerialiser(data=req.data)
        if serializer.is_valid():
            try:
                # Add to group if group exists
                group = Group.objects.get(code=serializer.data["code"])
                newGroupUser = GroupUser(user=req.user, group=group)
                newGroupUser.save()
                return Response(status=status.HTTP_200_OK)

            except Group.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class LeaveGroup(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, req, format=None):
        serializer = GroupIdSerialiser(data=req.data)
        if serializer.is_valid():
            try:
                # Remove from group if group exists and user is in it
                group = Group.objects.get(id=serializer.data["id"])
                groupUser = GroupUser.objects.get(user=req.user, group=group)
                groupUser.delete()
                return Response(status=status.HTTP_200_OK)

            except Group.DoesNotExist or GroupUser.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class LoadGroupTransactions(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, req, format=None):
        serializer = GroupIdSerialiser(data=req.data)
        if serializer.is_valid():
            try:
                # Get list of transactions of group
                group = Group.objects.get(id=req.data["id"])
                transactions = Transaction.objects.filter(group=group)

                transactionList = [
                    {
                        "amount": transaction.amount,
                        "by": UserDataSerialiser(transaction.userby).data,
                        "for": [
                            UserDataSerialiser(transactionfor.userfor).data
                            for transactionfor in TransactionFor.objects.filter(
                                transaction=transaction
                            )
                        ],
                    }
                    for transaction in transactions
                ]

                return JsonResponse(
                    {"transactions": transactionList}, status=status.HTTP_200_OK
                )

            except Group.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class AddTransactions(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, req, format=None):
        serializer = GroupAddTransactionSerialiser(data=req.data)
        if serializer.is_valid():
            try:
                group = Group.objects.get(id=req.data["id"])

                newTransaction = Transaction(
                    group=group, amount=serializer.data["amount"], userby=req.user
                )
                newTransactionFors = [
                    TransactionFor(
                        transaction=newTransaction, userfor=User.objects.get(id=user)
                    )
                    for user in serializer.data["userfor"]
                ]

                newTransaction.save()
                for newTransactionFor in newTransactionFors:
                    newTransactionFor.save()

                return Response(status=status.HTTP_201_CREATED)
            except Group.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class EditTransactions(APIView):
    permission_classes = (IsAuthenticated,)

    def post():
        pass


class DeleteTransactions(APIView):
    permission_classes = (IsAuthenticated,)

    def post():
        pass


# TODO Robustness
# TODO Seralisers
