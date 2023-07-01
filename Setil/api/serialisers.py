from rest_framework import serializers

from .models import User, Group


class UserSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "name", "password"]

    def create(self, validData):
        user = User(username=validData["username"], name=validData["name"])
        user.set_password(validData["password"])
        user.save()
        return user


class GroupSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name"]

    def create(self, validData):
        group = Group(name=validData["name"])
        group.save()
        return group


class GroupDataSerialiser(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=42)


class UserDataSerialiser(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=42)


class GroupCodeSerialiser(serializers.Serializer):
    code = serializers.CharField(max_length=6)


class GroupIdSerialiser(serializers.Serializer):
    id = serializers.IntegerField()


class GroupAddTransactionSerialiser(GroupIdSerialiser):
    amount = serializers.DecimalField(max_digits=6, decimal_places=2)
    userfor = serializers.ListField(child=serializers.IntegerField())
