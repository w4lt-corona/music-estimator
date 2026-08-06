// Free Demo page script

const EMAILJS_PUBLIC_KEY  = "SM5_Bv-ybpDOgL2-1";
const EMAILJS_SERVICE_ID  = "service_c2frvbl";
const EMAILJS_TEMPLATE_ID = "template_jumxfjj";

try {
    if (typeof emailjs !== "undefined") {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
} catch (err) {
    console.warn("EmailJS init failed:", err);
}

const estimateForm    = document.getElementById("estimate-form");
const formMessage     = document.getElementById("form-message");
const requestQuoteBtn = document.getElementById("request-quote-btn");
const bookCallBtn     = document.getElementById("book-call-btn");

let isSubmitting = false;
const COOLDOWN_MS = 45000;

function getDemoDetails() {
    const track = document.querySelector(".track");
    const name = track.querySelector(".track-name").value;
    const notes = track.querySelector(".demo-notes").value || "None";

    return `FREE DEMO REQUEST\n\nTrack Name: ${name}\nLength: 1:00 (max)\nDemo Notes: ${notes}`;
}
if (estimateForm) {
    estimateForm.addEventListener("submit", function(e) {
        e.preventDefault();

        // Honeypot
        const honeypot = document.getElementById("website");
        if (honeypot && honeypot.value.trim() !== "") {
            formMessage.textContent = "Thank you! Your free demo request has been received.";
            formMessage.className = "form-message success";
            return;
        }

        if (isSubmitting) return;
        isSubmitting = true;

        requestQuoteBtn.disabled = true;
        requestQuoteBtn.textContent = "Sending...";
        formMessage.textContent = "";
        formMessage.className = "form-message";

        const templateParams = {
            from_name:   document.getElementById("name").value,
            from_email:  document.getElementById("email").value,
            phone:       document.getElementById("phone").value || "Not provided",
            discord:     document.getElementById("discord").value || "Not provided",
            game_title:  document.getElementById("game-title").value || "Not provided",
            notes:       document.getElementById("notes").value || "None",
            track_list:  getDemoDetails(),
            grand_total: "FREE DEMO (1:00 max)"
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function() {
                formMessage.textContent = "Success! Your free demo request has been sent. I’ll be in touch soon.";
                formMessage.className = "form-message success";
                setTimeout(() => {
                    isSubmitting = false;
                    requestQuoteBtn.disabled = false;
                    requestQuoteBtn.textContent = "Request Free Demo";
                }, COOLDOWN_MS);
            })
            .catch(function(error) {
                console.error(error);
                formMessage.textContent = "Something went wrong. Please try again later.";
                formMessage.className = "form-message error";
                isSubmitting = false;
                requestQuoteBtn.disabled = false;
                requestQuoteBtn.textContent = "Request Free Demo";
            });
    });
}

if (bookCallBtn) {
    bookCallBtn.addEventListener("click", function() {
        window.open("https://calendly.com/w4lt3r-corona/30min", "_blank");
    });
}
