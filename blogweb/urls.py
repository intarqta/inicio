from django.urls import path
from . import views

urlpatterns =[
    path('', views.mapa),
    path('nosotros/', views.nosotros),
    path('mapa/', views.mapa),
    path('menu/', views.menu),
    path('novedades/', views.novedades),
    path('form/', views.form),
    path('postform/', views.okform),
]
