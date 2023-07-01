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
