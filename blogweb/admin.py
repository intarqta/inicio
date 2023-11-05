from django.contrib import admin
# importar las clases task y project
from .models import Project, Task

# Register your models here.
admin.site.register(Project)
admin.site.register(Task)