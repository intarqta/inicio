from django.urls import path
from . import views

urlpatterns =[
    path('', views.index, name="index"),
    path('nosotros/', views.nosotros, name="nosotros"),
    path('mapa/', views.mapa, name="mapa"),
    path('menu/', views.menu, name="menu"),
    path('novedades/', views.novedades, name="novedades"),
    path('form/', views.form, name="form"),
    path('postform/', views.okform, name="okform"),
]
