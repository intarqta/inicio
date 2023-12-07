from django.urls import path
from . import views

urlpatterns =[
    path('', views.mapa, name="index"),
    path('nosotros/', views.mapa, name="nosotros"),
    path('mapa/', views.mapa, name="mapa"),
    path('menu/', views.mapa, name="menu"),
    path('novedades/', views.mapa, name="novedades"),
    path('form/', views.mapa, name="form"),
    path('postform/', views.mapa, name="okform"),
]
