(() => {
    const dashboardHome = document.getElementById('dashboard-home');
    const viewAllUploads = document.getElementById('view-all-uploads');
    const viewBranchUploads = document.getElementById('view-branch-uploads');
    const viewSectionUploads = document.getElementById('view-section-uploads');
    const allUploads = document.getElementById('all-uploads');
    const branchUploads = document.getElementById('branch-uploads');
    const sectionUploads = document.getElementById('section-uploads');
    const goBack = document.getElementById('go-back');
    const allUploadsTableContainer = document.getElementById('all-uploads-table-container');
    const allUploadsTbody = document.getElementById('all-uploads-tbody');
    const branchSelectBu = document.getElementById('branch-select-bu');
    const branchUploadsTableContainer = document.getElementById('branch-uploads-table-container');
    const branchUploadsTbody = document.getElementById('branch-uploads-tbody');
    const branchSelectSu = document.getElementById('branch-select-su');
    const sectionSelectSu = document.getElementById('section-select-su');
    const sectionUploadsTableContainer = document.getElementById('section-uploads-table-container');
    const sectionUploadsTbody = document.getElementById('section-uploads-tbody');
    const downloadAll = document.getElementById('download-all');

    const maxSizePerSection = 1_000_000_000;

    // Dashboard buttons

    viewAllUploads.addEventListener('click', () => {
        dashboardHome.style.display = 'none';
        allUploads.style.display = 'block';
        goBack.style.display = 'block';
    });

    viewBranchUploads.addEventListener('click', () => {
        dashboardHome.style.display = 'none';
        branchUploads.style.display = 'block';
        goBack.style.display = 'block';
    });

    viewSectionUploads.addEventListener('click', () => {
        dashboardHome.style.display = 'none';
        sectionUploads.style.display = 'block';
        goBack.style.display = 'block';
    });

    // go back button
    goBack.addEventListener('click', () => {
        allUploads.style.display = 'none';
        branchUploads.style.display = 'none';
        sectionUploads.style.display = 'none';
        goBack.style.display = 'none';
        dashboardHome.style.display = 'block';
    });

    // view all uploads
    setPagesInTable(allUploadsTableContainer, allUploadsTbody, 50);

    // branch uploads div
    loadBranchesAndSections(branchSelectBu, null, false);

    branchSelectBu.addEventListener('change', () => {
        branchUploadsTbody.innerHTML = '';
        if (branches.includes(branchSelectBu.value)) {
            // ajax call to get branch upload entries
            $.ajax({
                url: '/branchdashboard/',
                data: {
                    'csrfmiddlewaretoken': csrftoken,
                    'branch': branchSelectBu.value
                },
                type: 'POST',
                success: (data) => {
                    const entries = data.upload;
                    var numberOfPhotosInBranch = 0;

                    entries.forEach((entry) => {
                        branchUploadsTbody.innerHTML += `
                            <tr>
                                <td>${entry['section']}</td>
                                <td>${entry['name']}</td>
                                <td>${entry['phone']}</td>
                                <td>${entry['total_images']}</td>
                                <td>${toSizeString(entry['size_used'])}</td>
                                <td>${toSizeString(maxSizePerSection - entry['size_used'])}</td>
                                <td>${(parseInt(entry['total_images']) > 0) ? `<a href="" data-section="${entry['section']}" class="table-link">Download</a>` : '-'}</td>
                            </tr>
                        `;

                        numberOfPhotosInBranch += parseInt(entry['total_images']);
                    });

                    // Show "download all" button only if there are photos
                    
                    if (numberOfPhotosInBranch > 0) {
                        downloadAll.style.display = 'block';
                    }
                    else {
                        downloadAll.style.display = 'none';
                    }

                    setPagesInTable(branchUploadsTableContainer, branchUploadsTbody, 50);
                }
            });
        }
    });

    // When "download all" is clicked
    downloadAll.addEventListener('click', (event) => {
        event.preventDefault();
        if (branches.includes(branchSelectBu.value)) {
            // ajax call to get combined BRANCH pdf
            $.ajax({
                url: '/branchcombinedpdf/',
                data: {
                    'csrfmiddlewaretoken': csrftoken,
                    'branch': branchSelectBu.value
                },
                type: 'POST',
                success: (data) => {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = `data:application/pdf;base64,${data.pdfData}`;
                    downloadLink.download = branchSelectBu.value;
                    downloadLink.click();
                }
            });
        }
    });

    // When "section download" is clicked
    branchUploadsTbody.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('table-link')) {
            event.preventDefault();
            // Ajax call to get combined section PDF
            $.ajax({
                url: '/getCombinedPdf/',
                data: {
                    'csrfmiddlewaretoken': csrftoken,
                    'section': target.getAttribute('data-section')
                },
                type: 'POST',
                success: function (data) {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = `data:application/pdf;base64,${data.pdfData}`;
                    downloadLink.download = target.getAttribute('data-section');
                    downloadLink.click();
                },
            });
        }
    });

    // section upload div
    loadBranchesAndSections(branchSelectSu, sectionSelectSu, true);

    function getSectionUploadEntries() {      // created a function coz at least 2 event listeners need it
        sectionUploadsTbody.innerHTML = '';
        if (branches.includes(branchSelectSu.value) && (sectionSelectSu.value === 'All Sections' || (sections && sections.length && sections.includes(sectionSelectSu.value)))) {
            // ajax call to get section upload entries

            $.ajax({
                url: '/dashboardfilter/',
                data: {
                    'branch': branchSelectSu.value,
                    'csrfmiddlewaretoken': csrftoken,
                    'section': sectionSelectSu.value,
                },
                type: 'POST',
                success: (data) => {
                    const entries = data.upload;
                    entries.forEach((entry) => {
                        sectionUploadsTbody.innerHTML += `
                            <tr>
                                <td>${entry['section']}</td>
                                <td>${entry['date']}</td>
                                <td>${entry['time']}</td>
                                <td>${toSizeString(entry['size_used'])}</td>
                                <td><a href="${entry['image']}" class="table-link" download>Download</a></td>
                            </tr>
                        `;
                    });
                    setPagesInTable(sectionUploadsTableContainer, sectionUploadsTbody, 50);
                }
            });


        }
    }

    branchSelectSu.addEventListener('change', getSectionUploadEntries);
    sectionSelectSu.addEventListener('change', getSectionUploadEntries);
})();