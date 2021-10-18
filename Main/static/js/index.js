var personName, personPhone, sizeUsed, numberOfPhotos;

(() => {
    const branchSelect = document.getElementById('branch-select');
    const sectionSelect = document.getElementById('section-select');
    const nameInput = document.getElementById('name-input');
    const phoneInput = document.getElementById('phone-input');
    const firstContinue = document.getElementById('first-continue');
    const stepOne = document.getElementById('step-one');
    const stepTwo = document.getElementById('step-two');
    const addPhoto = document.getElementById('add-photo');
    const photoContainers = document.getElementById('photo-containers');
    const uploadForm = document.getElementById('upload-form');
    const goBack2 = document.getElementById('go-back-2');
    const loading = document.getElementById('loading');
    const photoContainerElements = document.getElementsByClassName('photo-container');

    loadBranchesAndSections(branchSelect, sectionSelect, false);

    // Load name and phone when section is chosen
    sectionSelect.addEventListener('change', () => {
        if (sections.includes(sectionSelect.value)) {
            // ajax call to get the name and phone
            $.ajax({
                url: '/sectiondetailsajax/',
                data: {
                    'section': sectionSelect.value
                },
                success: (data) => {
                    nameInput.value = personName = data.person_name;
                    if (data.person_phone !== 0) {
                    phoneInput.value = personPhone = data.person_phone;
                    }
                    else {
                        phoneInput.value = '';
                    }
                    sizeUsed = data.total_size;
                    numberOfPhotos = data.no_images;
                }
            });
        }
    });

    // Go from first to second step
    firstContinue.addEventListener('click', (event) => {
        event.preventDefault();     // prevent submission

        nameInput.value = nameInput.value.trim();
        phoneInput.value = phoneInput.value.trim();

        if (branches.includes(branchSelect.value) && sections.includes(sectionSelect.value) && nameInput.value && phoneInput.value && phoneInput.value.length === 10) {
            stepOne.style.display = 'none';
            stepTwo.style.display = 'block';
        }
        else {
            showMessage('Fill all fields correctly to proceed!', 'error', 4000);
        }
    });

    // Photos
    const maxPhotosPerSection = 200;
    const maxPhotosPerSubmission = 25;
    var numberOfSelectedPhotos = 0;

    addPhoto.addEventListener('click', (event) => {
        event.preventDefault();     // prevent form submission

        if (numberOfSelectedPhotos >= maxPhotosPerSubmission) {
            showMessage(`You can choose at most ${maxPhotosPerSubmission} photos to upload!`, 'error', 6000);
        }
        else if (numberOfPhotos >= maxPhotosPerSection) {
            showMessage('Section Limit Reached', 'error', 2000);
        }
        else {
            // To trigger file upload
            const photoInputTrigger = document.createElement('input');
            photoInputTrigger.type = 'file';
            photoInputTrigger.multiple = true;
            photoInputTrigger.click();

            photoInputTrigger.addEventListener('change', () => {
                const files = photoInputTrigger.files;

                // Check if no limits have been crossed
                if (numberOfSelectedPhotos + files.length > maxPhotosPerSubmission) {
                    showMessage(`You can choose at most ${maxPhotosPerSubmission} photos to upload!`, 'error', 6000);
                    return;
                }
                else if (numberOfPhotos + files.length > maxPhotosPerSection) {
                    showMessage('Section Limit Reached', 'error', 2000);
                    return;
                }

                const validExtensions = ['image/jpeg', 'image/jpg', 'image/png'];
                const maxFileSize = 5_000_000;
                const maxSizePerSection = 1_000_000_000;

                // Validate all files
                for (const file of files) {
                    if (!validExtensions.includes(file.type)) {     // validate file format
                        showMessage('The file\'s format must be either JPEG/JPG or PNG.', 'error', 7000);
                        return;
                    }
                    else if (file.size > maxFileSize) {      // validate file size
                        showMessage(`The file\'s size must be less than ${toSizeString(maxFileSize)}.`, 'error', 5000);
                        return;
                    }
                    else if ((file.size + sizeUsed) > maxSizePerSection) {       // Check if total size is less than 1 GB
                        showMessage('You cannot upload these photos because of insufficient space.', 'error', 6000);
                        return;
                    }
                }

                // If files are valid, preview them
                for (const file of files) {
                    // Read file data and store it
                    const hiddenPhotoInput = document.createElement('input');
                    hiddenPhotoInput.type = 'hidden';
                    hiddenPhotoInput.name = 'photos';

                    const reader = new FileReader();
                    reader.onloadend = () => {
                        hiddenPhotoInput.value = reader.result;
                    }
                    reader.readAsDataURL(file);

                    // Enclose it in container
                    const photoContainer = document.createElement('div');
                    photoContainer.classList.add('photo-container');

                    const photoPreview = document.createElement('img');
                    photoPreview.classList.add('photo-preview');
                    photoPreview.src = URL.createObjectURL(file);
                    photoPreview.alt = file.name;

                    // Remove Image
                    const removePhotoImg = document.createElement('img');
                    removePhotoImg.classList.add('remove-photo-img');
                    removePhotoImg.src = '/static/images/cancel.png';
                    removePhotoImg.alt = 'Remove';

                    removePhotoImg.addEventListener('click', () => {
                        photoContainers.removeChild(photoContainer);
                        numberOfSelectedPhotos--;
                        numberOfPhotos--;
                        sizeUsed -= file.size;

                        if (numberOfSelectedPhotos <= 0) {
                            photoContainers.innerHTML = '<label class="label">No photos selected.</label>';
                        }

                        // Adjust the width of the photos
                        for (var index = 0; index < photoContainerElements.length; index++) {
                            photoContainerElements[index].style.width = `${photoContainers.clientWidth / (numberOfSelectedPhotos + 1)}px`;
                        }
                    });

                    photoContainer.appendChild(hiddenPhotoInput);
                    photoContainer.appendChild(photoPreview);
                    photoContainer.appendChild(removePhotoImg);

                    if (numberOfSelectedPhotos <= 0) {
                        // Remove the message "No photos selected" 
                        photoContainers.innerHTML = '';
                    }

                    photoContainers.appendChild(photoContainer);
                    numberOfSelectedPhotos++;
                    numberOfPhotos++;
                    sizeUsed += file.size;

                    // Adjust the width of the photos
                    for (var index = 0; index < photoContainerElements.length; index++) {
                        photoContainerElements[index].style.width = `${photoContainers.clientWidth / (numberOfSelectedPhotos + 1)}px`;
                    }
                }
            });
        }
    });

    // Go back from second to first step
    goBack2.addEventListener('click', (event) => {
        event.preventDefault();     // prevent submission
        stepTwo.style.display = 'none';
        stepOne.style.display = 'block';
    });

    // Submission
    var enableSubmission = true;
    uploadForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (enableSubmission) {
            nameInput.value = nameInput.value.trim();
            phoneInput.value = phoneInput.value.trim();

            if (!(branches.includes(branchSelect.value) && sections.includes(sectionSelect.value) && nameInput.value && phoneInput.value && phoneInput.value.length === 10)) {
                showMessage('There was an error processing your request. Try again.', 'error', 6000);
            }
            else if (!(maxPhotosPerSubmission >= numberOfSelectedPhotos && numberOfSelectedPhotos > 0)) {
                showMessage(`Upload 1-${maxPhotosPerSubmission} photos`, 'error', 3000);
            }
            else {
                enableSubmission = false;
                loading.style.display = 'flex';
                uploadForm.submit();
            }
        }
    });
})();