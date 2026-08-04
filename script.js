// ============================================================
// Video Game Music Estimator
// script.js
// ============================================================

// ------------------------------------------------------------
// 1. EMAILJS CREDENTIALS
// ------------------------------------------------------------
const EMAILJS_PUBLIC_KEY  = "SM5_Bv-ybpDOgL2-1";
const EMAILJS_SERVICE_ID  = "service_c2frvbl";
const EMAILJS_TEMPLATE_ID = "template_jumxfjj";

// Try to initialize EmailJS (won't break the app if it fails)
try {
    if (typeof emailjs !== "undefined") {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
} catch (err) {
    console.warn("EmailJS failed to initialize:", err);
}

// ------------------------------------------------------------
// 2. PRICES
// ------------------------------------------------------------
const RATES = {
    minimal: 350,
    standard: 500,
    cinematic: 800
};

// ------------------------------------------------------------
// 3. STATE
// ------------------------------------------------------------
let trackCount = 0;

// ------------------------------------------------------------
// 4. DOM ELEMENTS
// ------------------------------------------------------------
const addTrackButton   = document.getElementById("add-track");
const tracksContainer  = document.getElementById("tracks-container");
const totalDisplay     = document.getElementById("total");
const estimateForm     = document.getElementById("estimate-form");
const formMessage      = document.getElementById("form-message");
const bookCallBtn      = document.getElementById("book-call-btn");
const requestQuoteBtn  = document.getElementById("request-quote-btn");

// ------------------------------------------------------------
// 5. HELPERS
// ------------------------------------------------------------
function formatMoney(amount) {
    return "$" + amount.toLocaleString("en-US");
}

function calculateTrackCost(minutes, serviceLevel) {
    return minutes * RATES[serviceLevel];
}

function updateGrandTotal() {
    const allTracks = document.querySelectorAll(".track");
    let grandTotal = 0;

    allTracks.forEach(function(track) {
        const cost = parseFloat(track.dataset.cost) || 0;
        grandTotal += cost;
    });

    totalDisplay.textContent = formatMoney(grandTotal);
}

function renumberTracks() {
    const allTracks = document.querySelectorAll(".track");

    allTracks.forEach(function(track, index) {
        const heading = track.querySelector("h3");
        if (heading) {
            heading.textContent = "Track " + (index + 1);
        }
    });

    trackCount = allTracks.length;
}

// ------------------------------------------------------------
// 6. CREATE TRACK CARD
// ------------------------------------------------------------
function createTrack() {
    trackCount++;

    const track = document.createElement("div");
    track.className = "track";
    track.dataset.cost = "0";

    track.innerHTML = `
        <div class="track-header">
            <h3>Track ${trackCount}</h3>
            <button type="button" class="remove-track-btn">Remove</button>
        </div>

        <label>Track Name</label>
        <input type="text" class="track-name" value="Enter a name you'll remember (e.g. Whispering Woods, Final Boss...)" placeholder="e.g. Whispering Woods, Final Boss...">

        <label>Track Type</label>
        <select class="track-type">
            <option>Title Screen</option>
            <option>Main Menu</option>
            <option>Exploration</option>
            <option>Ambient / Atmosphere</option>
            <option>Puzzle</option>
            <option>Stealth</option>
            <option>Battle</option>
            <option>Boss</option>
            <option>Final Boss</option>
            <option>Chase / Action</option>
            <option>Cutscene / Cinematic</option>
            <option>Emotional / Story</option>
            <option>Hub / Town</option>
            <option>World Map</option>
            <option>Victory</option>
            <option>Game Over</option>
            <option>Credits</option>
            <option>Character Theme</option>
            <option>Other</option>
        </select>

        <label>Length</label>
        <select class="track-length">
            <option value="1">1:00</option>
            <option value="1.5">1:30</option>
            <option value="2" selected>2:00</option>
            <option value="2.5">2:30</option>
            <option value="3">3:00</option>
            <option value="3.5">3:30</option>
            <option value="4">4:00</option>
            <option value="4.5">4:30</option>
            <option value="5">5:00</option>
        </select>

        <label>Service Level</label>
        <select class="track-service">
            <option value="minimal">Minimal ($350/min)</option>
            <option value="standard" selected>Standard ($500/min)</option>
            <option value="cinematic">Cinematic ($800/min)</option>
        </select>

        <div class="track-total">Track Estimate: $0</div>
    `;

    const lengthSelect  = track.querySelector(".track-length");
    const serviceSelect = track.querySelector(".track-service");
    const totalElement  = track.querySelector(".track-total");
    const removeBtn     = track.querySelector(".remove-track-btn");

    function recalculate() {
        const minutes = parseFloat(lengthSelect.value);
        const service = serviceSelect.value;
        const cost = calculateTrackCost(minutes, service);

        totalElement.textContent = "Track Estimate: " + formatMoney(cost);
        track.dataset.cost = cost;
        updateGrandTotal();
    }

    lengthSelect.addEventListener("change", recalculate);
    serviceSelect.addEventListener("change", recalculate);
    recalculate();

    removeBtn.addEventListener("click", function() {
        track.remove();
        renumberTracks();
        updateGrandTotal();
    });

    tracksContainer.appendChild(track);
}

// ------------------------------------------------------------
// 7. ADD TRACK BUTTON
// ------------------------------------------------------------
if (addTrackButton) {
    addTrackButton.addEventListener("click", createTrack);
}

// Start with one track
createTrack();

// ------------------------------------------------------------
// 8. COLLECT TRACK DATA FOR EMAIL
// ------------------------------------------------------------
function getTrackListForEmail() {
    const allTracks = document.querySelectorAll(".track");
    let trackListText = "";

    allTracks.forEach(function(track, index) {
        const name    = track.querySelector(".track-name").value;
        const type    = track.querySelector(".track-type").value;
        const length  = track.querySelector(".track-length").selectedOptions[0].text;
        const service = track.querySelector(".track-service").selectedOptions[0].text;
        const cost    = formatMoney(parseFloat(track.dataset.cost) || 0);

        trackListText += `Track ${index + 1}\n`;
        trackListText += `  Name: ${name}\n`;
        trackListText += `  Type: ${type}\n`;
        trackListText += `  Length: ${length}\n`;
        trackListText += `  Service Level: ${service}\n`;
        trackListText += `  Subtotal: ${cost}\n\n`;
    });

    return trackListText || "No tracks added.";
}

// ------------------------------------------------------------
// 9. FORM SUBMIT → SEND EMAIL
// ------------------------------------------------------------
if (estimateForm) {
    estimateForm.addEventListener("submit", function(e) {
        e.preventDefault();

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
            track_list:  getTrackListForEmail(),
            grand_total: totalDisplay.textContent
        };

        if (typeof emailjs === "undefined") {
            formMessage.textContent = "Email service is not loaded. Please refresh the page and try again.";
            formMessage.className = "form-message error";
            requestQuoteBtn.disabled = false;
            requestQuoteBtn.textContent = "Request Quote";
            return;
        }

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function() {
                formMessage.textContent = "Success! Your estimate has been sent. Check your email shortly.";
                formMessage.className = "form-message success";
                requestQuoteBtn.disabled = false;
                requestQuoteBtn.textContent = "Request Quote";
            })
            .catch(function(error) {
                console.error("EmailJS error:", error);
                formMessage.textContent = "Something went wrong while sending. Please try again or email me directly.";
                formMessage.className = "form-message error";
                requestQuoteBtn.disabled = false;
                requestQuoteBtn.textContent = "Request Quote";
            });
    });
}

// ------------------------------------------------------------
// 10. BOOK FREE SCOPE DISCUSSION BUTTON
// ------------------------------------------------------------
if (bookCallBtn) {
    bookCallBtn.addEventListener("click", function() {
        window.open("https://calendly.com/w4lt3r-corona/30min", "_blank");
    });
}