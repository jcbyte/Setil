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


def userInGroup(user, group, groupUser=[None]):  # groupUser is by ref
    groupUsers = GroupUser.objects.filter(user=user, group=group)
    if groupUsers.exists():
        groupUser[0] = groupUsers[0]
        return True

    return False


def serializerErrorResponse(errors):
    return JsonResponse(
        {key: [detail.code for detail in data] for key, data in errors.items()},
        status=status.HTTP_400_BAD_REQUEST,
    )


RESPONSES = {
    "GROUP_NOT_FOUND": JsonResponse(
        {"group": ["not_found"]}, status=status.HTTP_404_NOT_FOUND
    ),
    "USER_IN_GROUP": JsonResponse(
        {"user": ["already_in_group"]}, status=status.HTTP_409_CONFLICT
    ),
    "USER_NOT_IN_GROUP": JsonResponse(
        {"user": ["not_in_group"]}, status=status.HTTP_401_UNAUTHORIZED
    ),
}


class CreateUser(APIView):
    def post(self, req):
        # Use serialiser to validate input
        serializer = UserSerialiser(data=req.data)
        if serializer.is_valid():
            # If valid then create user
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)

        else:
            return serializerErrorResponse(serializer.errors)


class DeleteUser(APIView):
    permission_classes = (IsAuthenticated,)

    def post():
        pass


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
            return serializerErrorResponse(serializer.errors)


class DeleteGroup(APIView):
    permission_classes = (IsAuthenticated,)

    def post():
        pass


class GetGroups(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, req, format=None):
        # Get list of groups the user is in
        groups = GroupUser.objects.filter(user=req.user)
        groupList = [GroupDataSerialiser(group.group).data for group in groups]

        return JsonResponse({"groups": groupList}, status=status.HTTP_200_OK)


class JoinGroup(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, req, format=None):
        # Use serialiser to validate input
        serializer = GroupCodeSerialiser(data=req.data)
        if serializer.is_valid():
            try:
                # If group exists
                group = Group.objects.get(code=serializer.data["code"])

                if userInGroup(req.user, group):
                    return RESPONSES["USER_IN_GROUP"]

                # Add user if not in group
                newGroupUser = GroupUser(user=req.user, group=group)
                newGroupUser.save()
                return Response(status=status.HTTP_200_OK)

            except Group.DoesNotExist:
                return RESPONSES["GROUP_NOT_FOUND"]

        else:
            return serializerErrorResponse(serializer.errors)


class LeaveGroup(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, req, format=None):
        # Use serialiser to validate input
        serializer = GroupIdSerialiser(data=req.data)
        if serializer.is_valid():
            try:
                # If group exists
                group = Group.objects.get(id=serializer.data["id"])

                groupUser = [None]
                if userInGroup(req.user, group, groupUser):
                    # If user in group then remove them
                    groupUser[0].delete()

                    return Response(status=status.HTTP_200_OK)

                return RESPONSES["USER_NOT_IN_GROUP"]

            except Group.DoesNotExist:
                return RESPONSES["GROUP_NOT_FOUND"]

        else:
            return serializerErrorResponse(serializer.errors)


class LoadGroupTransactions(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, req, format=None):
        # Use serialiser to validate input
        serializer = GroupIdSerialiser(data=req.data)
        if serializer.is_valid():
            try:
                # Get list of transactions of group
                group = Group.objects.get(id=req.data["id"])
                if userInGroup(req.user, group):
                    # If user in group then get all transactions
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

                else:
                    return RESPONSES["USER_NOT_IN_GROUP"]

            except Group.DoesNotExist:
                return RESPONSES["GROUP_NOT_FOUND"]

        else:
            return serializerErrorResponse(serializer.errors)


class AddTransactions(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, req, format=None):
        # Use serialiser to validate input
        serializer = GroupAddTransactionSerialiser(data=req.data)
        if serializer.is_valid():
            try:
                group = Group.objects.get(id=req.data["id"])

                if userInGroup(req.user, group):
                    # If user in group add the transaction

                    newTransaction = Transaction(
                        group=group, amount=serializer.data["amount"], userby=req.user
                    )
                    newTransactionFors = [
                        TransactionFor(
                            transaction=newTransaction,
                            userfor=User.objects.get(id=user),
                        )
                        for user in serializer.data["userfor"]
                    ]

                    newTransaction.save()
                    for newTransactionFor in newTransactionFors:
                        newTransactionFor.save()

                    return Response(status=status.HTTP_201_CREATED)

                else:
                    return RESPONSES["USER_NOT_IN_GROUP"]

            except Group.DoesNotExist:
                return RESPONSES["GROUP_NOT_FOUND"]

        else:
            return serializerErrorResponse(serializer.errors)


class EditTransactions(APIView):
    permission_classes = (IsAuthenticated,)

    def post():
        pass


class DeleteTransactions(APIView):
    permission_classes = (IsAuthenticated,)

    def post():
        pass
