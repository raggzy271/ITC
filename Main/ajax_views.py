from django.shortcuts import render, redirect
from django.shortcuts import render, get_object_or_404
from .models import Branch, Section, Link, admin
import datetime
from datetime import date, timedelta
from django.http import HttpResponse
from django.core import serializers
from django.core.files.storage import FileSystemStorage
from django.http import HttpResponseForbidden
import json
import PIL
from PyPDF2 import PdfFileMerger
import io
from django.conf import settings
import base64

def sectionajax(request):                                                    #For dependent dropdowns - to get all sections from branch
    listforsections = []
    Branchname    = request.GET['branch']
    Branchobj   = Branch.objects.get(name = Branchname)
    Sectionobjs = Section.objects.filter(branch = Branchobj.id) 
    for x in Sectionobjs:
        listforsections.append(x.section_name)
    data = json.dumps({'sections':listforsections})
    return HttpResponse(data, content_type='application/json')

def sectiondetailsajax(request):                                              #For dependent dropdown for name and phone number
    section = request.GET['section']
    Sectionobjs = Section.objects.get(section_name = section) 
    data = json.dumps({'person_name':Sectionobjs.person_name,'person_phone':Sectionobjs.person_phone,'no_images':Sectionobjs.number_images,'total_size':Sectionobjs.size})
    return HttpResponse(data, content_type='application/json')


def login(request):     #verification of login
    if admin.objects.filter(username = request.POST.get('username')).exists() is True:
        adminobj = admin.objects.get(username = request.POST.get('username'))
        if adminobj.password == request.POST['password']:
            valid = True
            request.session['username'] = request.POST.get('username')
        else:
            valid= False
    else:
        valid = False
    data = json.dumps({'valid':valid})
    return HttpResponse(data, content_type='application/json')          


def dashboardfilter(request):                                                #section wise table
    Branchname = request.POST.get('branch')
    section = request.POST.get('section')
    if section == 'All Sections':
        dictlist = []
        Branchobj = Branch.objects.get(name = Branchname)
        Sectionobjs = Section.objects.filter(branch_id = Branch.objects.get(name = Branchname))
        for x in Sectionobjs:
            Linkobj = Link.objects.filter(person_id = x.id)
            for y in Linkobj:
                objdict = {'section':x.section_name,'name':x.person_name,'phone':x.person_phone,'image':y.link.url,'total_images':x.number_images,'size_used':x.size,'date':y.date,'time':y.time} 
                dictlist.append(objdict)
        data = json.dumps({'upload':dictlist})           
    else:
        dictlist = []
        Sectionobjs = Section.objects.get(section_name = section) 
        Linkobj = Link.objects.filter(person_id = Sectionobjs.id)
        for x in Linkobj:  
            objdict = {'section':Sectionobjs.section_name,'date':x.date,'time':x.time,'name':Sectionobjs.person_name,'phone':Sectionobjs.person_phone,'image':x.link.url,'size_used':Sectionobjs.size}
            dictlist.append(objdict)
        data = json.dumps({'upload':dictlist})    
    return HttpResponse(data, content_type='application/json')    

def branchdashboard(request):       #branch wise table
    branchName = request.POST.get('branch')
    branchObj = Branch.objects.get(name=branchName)
    sectionObjs = Section.objects.filter(branch_id=branchObj)
    
    upload = []
    for sectionObj in sectionObjs:
        upload.append({
            'section': sectionObj.section_name,
            'name': sectionObj.person_name,
            'phone': sectionObj.person_phone,
            'total_images': sectionObj.number_images,
            'size_used': sectionObj.size
        })

    return HttpResponse(json.dumps({'upload': upload}), content_type='application/json')


# img = Image.open('upload.png')
# imgc = img.convert('RGB')
# imgc.save('lessgo2.pdf')    

def getCombinedPdf(request):
    sectionName = request.POST.get('section')
    sectionObj = Section.objects.get(section_name=sectionName)
    linkObjs = Link.objects.filter(person_id=sectionObj)
    if len(linkObjs) > 0:
        merger = PdfFileMerger()
        
        for linkObj in linkObjs:
            pdf = f'{settings.BASE_DIR}/{linkObj.link.url}'
            merger.append(pdf)

        pdfData = io.BytesIO()
        merger.write(pdfData)
        merger.close()
        
        return HttpResponse(json.dumps({'pdfData': base64.b64encode(pdfData.getvalue()).decode('utf-8')}), content_type='application/json')
    else:
        return HttpResponse(json.dumps({'pdfData': None}), content_type='application/json')


def branchcombinedpdf(request):
    branchName = request.POST.get('branch')
    branchObj = Branch.objects.get(name=branchName)
    merger = PdfFileMerger()
    if Section.objects.filter(branch_id = branchObj.id , number_images__gt = 0).exists():
        sections = Section.objects.filter(branch_id = branchObj.id , number_images__gt = 0)
        sectionlist = []
        
        for x in sections:
            sectionlist.append(x.id)
        
        for y in sectionlist:
            linkobjs = Link.objects.filter(person_id = y) 
             
            for linkObj in linkobjs:
                pdf = f'{settings.BASE_DIR}/{linkObj.link.url}'
                merger.append(pdf)

        pdfData = io.BytesIO()
        merger.write(pdfData)
        merger.close() 
        
        return HttpResponse(json.dumps({'pdfData': base64.b64encode(pdfData.getvalue()).decode('utf-8')}), content_type='application/json')      
    else:
        return HttpResponse(json.dumps({'pdfData': None}), content_type='application/json')    