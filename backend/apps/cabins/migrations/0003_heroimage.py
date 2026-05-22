from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cabins', '0002_cabin_photo_url_cabinimage_image_url_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='HeroImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='hero/')),
                ('caption', models.CharField(blank=True, max_length=200)),
                ('order', models.PositiveIntegerField(default=0)),
                ('active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'imagen del hero',
                'verbose_name_plural': 'imágenes del hero',
                'ordering': ['order', 'created_at'],
            },
        ),
    ]
