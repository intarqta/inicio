# Render nos permite mostrar el archivo html contenido en la carpeta templates
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
# Llmar a las diferentes bases de datos desde models
from .models import Project, Task, users
from .forms import formsRegistro
import json



# render al index html.
def index(request):
    return render(request, "index.html")

# render al mapa html.
def mapa(request):    
    return render(request, "redpluv.html")
# render al blog html
def nosotros(request):
    return render(request, "nosotros.html")

#render a notas html
def novedades(request):
    list = [1,2,3]
    return render(request, "novedades.html",{
        'lista':list
    })

# render menu html
def menu(request):
    project = Project.objects.all
    return render(request, "menu.html",{
        'proyectos':project
    })

# Render formulario
def form(request):
    if request.method == 'GET':
        return render(request, "form.html", {
        'form': formsRegistro()
         })
    else:
        users.objects.create(nombre=request.POST['nombre'],
        apellido=request.POST['apellido'],
        email=request.POST['email'],
        ciudad=request.POST['ciudad'],
        provincia=request.POST['provincia'],
        cpostal=request.POST['cpostal'],
        )

def okform(request):
    return render(request, 'okform.html')
