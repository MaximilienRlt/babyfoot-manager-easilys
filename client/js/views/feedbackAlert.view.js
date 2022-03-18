const ALERT_TIMEOUT_DURATION = 3000;

class FeedbackAlertView {
    timeoutId = null;
    constructor(){
        this.$feedbackAlert = document.querySelector('#feedbackAlert');
        this.$feedbackAlertIcon = this.$feedbackAlert.querySelector('#feedbackAlert span');
        this.$feedbackAlertText = this.$feedbackAlert.querySelector('#feedbackAlert p');
    }

    hideAlert() {
        this.$feedbackAlert.style.display = 'none';
    }

    displayFeedback(code, msg) {
        if(this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.hideAlert();
        }
        switch (code) {
            case ERROR:
                this.$feedbackAlert.style['background-color'] = 'rgba(207,0,15, 1)';
                this.$feedbackAlert.style.color = 'white';
                this.$feedbackAlertIcon.textContent = "❌";
                break;
            case SUCCESS:
                this.$feedbackAlert.style['background-color'] = 'rgba(0,153,68, 1)';
                this.$feedbackAlert.style.color = 'white';
                this.$feedbackAlertIcon.textContent = "✅";
                break;
            case INFO:
                this.$feedbackAlert.style['background-color'] = 'rgba(99,192,223, 1)';
                this.$feedbackAlert.style.color = 'white';
                this.$feedbackAlertIcon.textContent = "ℹ";
                break;
            default:
                this.$feedbackAlert.style['background-color'] = 'rgba(240,84,30, 1)';
                this.$feedbackAlert.style.color = 'white';
                this.$feedbackAlertIcon.textContent = "❓";
        }
        this.$feedbackAlertText.textContent = msg;
        this.$feedbackAlert.style.display = 'initial';
        this.timeoutId = setTimeout(() => {
            this.$feedbackAlert.style.display = 'none';
            this.$feedbackAlertText.textContent = '';
            this.$feedbackAlertIcon.textContent = '';

        }, ALERT_TIMEOUT_DURATION);
    }

}