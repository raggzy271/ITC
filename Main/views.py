from django.shortcuts import render, redirect
from django.shortcuts import render, get_object_or_404
from .models import Branch, Section, Link
import datetime
from datetime import date, timedelta
import requests
from django.core.files.storage import FileSystemStorage
from PIL import Image
import io
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.base import ContentFile
import os
import sys
from django.contrib import messages
from pytz import timezone 
import base64
import PIL
# Create your views here.

def index(request):                    #renders home page
    brancheslist = []
    branch = Branch.objects.values_list('name',flat = True)
    for x in branch:
        brancheslist.append(x)
    
       
    return render(request, 'index.html',{'branches':brancheslist})



def toSizeString(size):
    size = int(size)
    units = ['', 'K', 'M', 'G']
    unitIndex = 0
    
    while unitIndex < (len(units) - 1) and size >= 1000:
        size /= 1000
        unitIndex += 1
    
    sizeString = f'{size:.2f} {units[unitIndex]}B' 
    return sizeString

def dashboard(request):                     #renders dashboard
    if 'username' in request.session:
        brancheslist = []
        branch = Branch.objects.values_list('name',flat = True)
        for x in branch:
            brancheslist.append(x)
        linkobj = Link.objects.all().order_by("-id")


        listoflist = []

        for x in linkobj:
            print(x.id)
            size = x.link.size
            Sectionobjs = Section.objects.get(id = x.person_id)

            sec_name = Sectionobjs.section_name
            sec_size = Sectionobjs.size
            person_name = Sectionobjs.person_name
            person_phone = Sectionobjs.person_phone
            Branchobj = Branch.objects.get(id = Sectionobjs.branch_id)    
            branchname = Branchobj.name

            objdict = [branchname,sec_name,person_name,person_phone,x.date,x.time,toSizeString(size),x.link.url]
            listoflist.append(objdict)

        return render(request, 'admin-dashboard.html',{'branches':brancheslist, 'alluploads':listoflist})   
    else:
        return redirect('index')

def admin_login(request):                           #renders the admin login page
    return render(request, 'admin-login.html')    


def formsubmit(request):                        #submits the form
    count = 0
    size = 0
    name = request.POST['name']
    docs = request.POST.getlist('photos')
    section = request.POST['section']
    for x in docs:
        fs = FileSystemStorage()
        imgurl = base64.urlsafe_b64decode(x.split(',')[1])
        img = Image.open(io.BytesIO(imgurl))
        imgc = img.convert('RGB')
        pdfdata = io.BytesIO()
        imgc.save(pdfdata,format='PDF')
        thumb_file1 = InMemoryUploadedFile(pdfdata, None, 'photo.pdf', 'pdf',sys.getsizeof(pdfdata), None)
        filename = fs.save('photo.pdf', thumb_file1)
        linkobj = Link(link = thumb_file1, person = Section.objects.get(section_name = section), date = datetime.datetime.now(timezone("Asia/Kolkata")).strftime('%Y-%m-%d'), time = datetime.datetime.now(timezone("Asia/Kolkata")).strftime('%H:%M:%S'))
        linkobj.save()
        count += 1
        size += thumb_file1.size
    section_obj = Section.objects.get(section_name = section)
    section_obj.person_name = name    
    section_obj.number_images += count
    section_obj.size += size
    section_obj.person_phone = request.POST['phone']
    section_obj.save()    
    messages.success(request, 'You have successfully submitted')
    return redirect('index')  


def admin_form(request):
    return redirect('dashboard')

def logout(request):

	request.session.flush()

	return redirect('index')	