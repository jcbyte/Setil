# Generated by Django 4.2.2 on 2023-07-02 11:43

import api.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_transaction_group'),
    ]

    operations = [
        migrations.AlterField(
            model_name='group',
            name='code',
            field=models.TextField(default=api.models.genUniqueCode, max_length=6, unique=True),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='amount',
            field=models.DecimalField(decimal_places=2, max_digits=7),
        ),
    ]
