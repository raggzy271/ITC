var sections;

// Return size from number of bytes (type -> Number) to string
function toSizeString(size) {
    const units = ['', 'K', 'M', 'G'];
    var unit = 0;
    size = parseInt(size);
    while (unit < units.length - 1 && size >= 1000) {
        size /= 1000;
        unit++;
    }

    const sizeString = size.toFixed(2).toString() + ' ' + units[unit] + 'B';
    return sizeString;
}

function loadBranchesAndSections(branchSelect, sectionSelect, addAllSectionsOption) {
    // Load branch select options
    branches.forEach((branch) => {
        branchSelect.innerHTML += `<option class="branch-select">${branch}</option>`;
    });

    if (sectionSelect) {
        // Load section select options when branch is chosen
        branchSelect.addEventListener('change', () => {
            if (branches.includes(branchSelect.value)) {
                sectionSelect.innerHTML = '<option class="section-select" disabled selected>Choose one</option>';
                if (addAllSectionsOption) {
                    sectionSelect.innerHTML += '<option class="section-select" selected>All Sections</option>';
                }
                // ajax call to get sections
                $.ajax({
                    url: '/sectionajax/',
                    data: {
                        'branch': branchSelect.value
                    },
                    success: (data) => {
                        sections = data.sections;
                        sections.forEach((section) => {
                            sectionSelect.innerHTML += `<option class="section-select">${section}</option>`;
                        });
                    }
                });

            }
        });
    }
}