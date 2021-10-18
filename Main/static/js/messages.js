// Show Messages
const messages = document.getElementById('messages');

function showMessage(messageText, messageType, timeToLive) {
    const message = document.createElement('div');
    message.className = 'message ' + messageType + '-message';
    message.innerHTML = messageText + '<img src="/static/images/close.png" class="dismiss-message" tabindex="0">';

    if (messages) {
        messages.appendChild(message);
        if (timeToLive) {
            setTimeout(() => {
                if (messages.contains(message)) {
                    messages.removeChild(message);
                }
            }, timeToLive);
        }
    }
}

// Dismiss messages
if (messages) {
    messages.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('dismiss-message')) {
            const message = target.parentNode;
            messages.removeChild(message);
        }
    });
}