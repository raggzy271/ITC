(() => {
    // validation
    const adminLoginForm = document.getElementById('admin-login-form');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const loading = document.getElementById('loading');
    


    var enableSubmission = true;
    adminLoginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (enableSubmission) {
        usernameInput.value = usernameInput.value.trim();

        if (usernameInput.value.length > 0 && passwordInput.value.length > 0) {
            // ajax call to check if credenials are valid
            $.ajax({
                url: '/login/',
                data: new FormData(adminLoginForm),
                processData: false,
                contentType: false,
                type: 'POST',
                success: (data) => {
                    if (data.valid) {
                        enableSubmission = false;
                        loading.style.display = 'flex';
                        adminLoginForm.submit();
                    }
                    else {
                        showMessage('Your credentials are incorrect.', 'error', 4000);
                    }
                }
            });
        }
        else {
            showMessage('Fields cannot be left empty!', 'error', 4000);
        }
    }
    });
})();