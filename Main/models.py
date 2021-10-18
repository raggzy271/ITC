from django.db import models
from passlib.hash import pbkdf2_sha256

class Branch(models.Model):
	id   = models.BigAutoField(primary_key=True)
	name = models.CharField(max_length=20)

class Section(models.Model):
    id              = models.BigAutoField(primary_key=True)
    branch          = models.ForeignKey(Branch, on_delete=models.CASCADE)
    section_name    = models.CharField(max_length=20)
    person_name     = models.CharField(max_length=80, default = 'John Doe')
    person_phone    = models.BigIntegerField(default=None)
    size            = models.BigIntegerField(default=0)
    number_images   = models.BigIntegerField(default=0)


class Link(models.Model):
    id      = models.BigAutoField(primary_key=True)
    person  = models.ForeignKey(Section, on_delete=models.CASCADE)
    link    = models.ImageField(upload_to= 'images', default = None)
    date    = models.CharField(max_length=80, default = None)
    time    = models.CharField(max_length=80,default = None)

class admin(models.Model):
    username = models.CharField(max_length=500, default = None)
    password = models.CharField(max_length=256)

    def verify_password(self, raw_password):
        return pbkdf2_sha256.verify(raw_password, self.password)	