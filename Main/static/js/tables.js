// after all the rows are loaded in a table, then call this to add paging

function setPagesInTable(tableContainer, tableBody, maxRowsPerPage) {
    const rows = tableBody.querySelectorAll('tr');
    const noOfRows = rows.length;

    // Check if there is already a page container, if so then remove
    const existingPageContainers = tableContainer.getElementsByClassName('page-container');
    if (existingPageContainers)
    {
    for (const existingPageContainer of existingPageContainers) {
        tableContainer.removeChild(existingPageContainer);
    }}

    // add paging only when noOfRows is greater than maxRowsPerPage
    if (noOfRows > maxRowsPerPage) {
        const noOfPages = Math.ceil(noOfRows / maxRowsPerPage);

        const pageRows = (() => {
            const result = new Array(noOfPages);
            for (var index = 0; index < rows.length; index++) {
                const pageIndex = Math.floor(index / maxRowsPerPage);
                const row = rows[index];
                if (result[pageIndex]) {
                    result[pageIndex].push(row);
                }
                else {
                    result[pageIndex] = [row];
                }
            }
            return result;
        })();

        function loadTableBody(currentPage) {
            tableBody.innerHTML = '';
            pageRows[currentPage - 1].forEach((row) => {
                tableBody.innerHTML += row.outerHTML;
            });

            pageNumber.innerHTML = `Page ${currentPage} of ${noOfPages}`;
            pageNumber.setAttribute('data-page', currentPage);
        }

        const pageContainer = document.createElement('span');
        pageContainer.classList.add('page-container');

        const leftArrow = document.createElement('img');
        leftArrow.src = '/static/images/left-arrow.png';
        leftArrow.classList.add('page-arrow');
        leftArrow.tabIndex = 0;

        const pageNumber = document.createElement('span');
        pageNumber.classList.add('page-number');
        pageNumber.innerHTML = `Page 1 of ${noOfPages}`;
        pageNumber.setAttribute('data-page', '1');

        const rightArrow = document.createElement('img');
        rightArrow.src = '/static/images/right-arrow.png';
        rightArrow.classList.add('page-arrow');
        rightArrow.tabIndex = 0;

        leftArrow.addEventListener('click', () => {
            var currentPage = parseInt(pageNumber.getAttribute('data-page'));
            if (currentPage > 1) {
                currentPage--;
                loadTableBody(currentPage);
            }
        });

        rightArrow.addEventListener('click', () => {
            var currentPage = parseInt(pageNumber.getAttribute('data-page'));
            if (currentPage < noOfPages) {
                currentPage++;
                loadTableBody(currentPage);
            }
        });

        pageContainer.append(leftArrow);
        pageContainer.appendChild(pageNumber);
        pageContainer.appendChild(rightArrow);

        

        tableContainer.insertBefore(pageContainer, tableContainer.firstChild)

        // Load first page
        loadTableBody(1);
    }
}