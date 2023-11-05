from django.db import models


# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=200)
    def __str__(self):
        return self.name
# Crear base de datos de usuarios que de registren
class users(models.Model):
    nombre = models.CharField(max_length=255)
    apellido = models.CharField(max_length=255)
    email = models.EmailField() 
    ciudad = models.CharField(max_length=255)
    provincia = models.CharField(max_length=255)
    cpostal = models.CharField(max_length=255)


# Generamos una segunda base de datos llamada Tareas
class Task(models.Model):
    # Char
    title = models.CharField(max_length=200)
    description = models.TextField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    def __str__(self):
        return self.title + ' - ' + self.project.name
