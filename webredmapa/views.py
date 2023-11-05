from django.shortcuts import render
# importar el modulo http response de Django
# from django.http import HttpResponse
# Create your views here.
def mapa(request):
    return render(request, "mapa.html")
