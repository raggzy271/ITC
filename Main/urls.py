from django.urls import path
from . import views, admin, ajax_views

urlpatterns = [
    path('', views.index, name='index'),
    path('formsubmit/',views.formsubmit, name ='formsubmit'),
    path('admin_login/', views.admin_login, name='admin_login'),
    path('login/', ajax_views.login, name='login'),
    path('admin_form/', views.admin_form, name='admin_form'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('sectionajax/', ajax_views.sectionajax, name='sectionajax'),
    path('sectiondetailsajax/', ajax_views.sectiondetailsajax, name='sectiondetailsajax'),
    path('dashboardfilter/', ajax_views.dashboardfilter, name='dashboardfilter'),
    path('branchdashboard/', ajax_views.branchdashboard, name='branchdashboard'),
    path('logout/',views.logout, name='logout'),
    path('getCombinedPdf/', ajax_views.getCombinedPdf, name='getCombinedPdf'),
    path('branchcombinedpdf/', ajax_views.branchcombinedpdf, name='branchcombinedpdf'),
]
