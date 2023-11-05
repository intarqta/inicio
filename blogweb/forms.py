from django import forms
# Añadir estilos al formulario
from django.forms import TextInput, EmailInput
class formsRegistro(forms.Form):
    nombre = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Nombre','id':'validationCustom01','class':'form-control'}))
    apellido = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Apellido','id':'validationCustom02','class':'form-control'}))
    email = forms.EmailField(widget=forms.TextInput(attrs={'placeholder': 'E-mail','id':'validationCustomUsername', 'class':'form-control'}))
    ciudad = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Ciudad','id':'validationCustom03','class':'form-control'}))
    provincia = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Provincia','id':'validationCustom04','class':'form-control'}))
    cpostal = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'CP','id':'validationCustom05','class':'form-control'}))