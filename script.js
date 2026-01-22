const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const durationInput = document.getElementById('duration');

let timeLeft = 25 * 60;
let timerId = null;
let isRunning = false;

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(timeLeft);
    document.title = `${formatTime(timeLeft)} - Focus Timer`; // Update tab title
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (isRunning) return;

    // Get time from input if starting fresh (not paused)
    if (timeLeft === parseInt(durationInput.value) * 60 || timeLeft === 0 || !timerId) {
        // Only reset time if we aren't resuming from a pause
        if (!timerId) {
            let minutes = parseInt(durationInput.value);
            if (isNaN(minutes) || minutes < 1) minutes = 25;
            timeLeft = minutes * 60;
            updateDisplay();
        }
    }

    isRunning = true;
    startBtn.textContent = 'Pause';
    startBtn.classList.add('active'); // Changes color to red/stop style

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerId);
            timeLeft = 0;
            updateDisplay();
            playNotification();
            resetControls(); // Go back to start state
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerId);
    startBtn.textContent = 'Start';
    startBtn.classList.remove('active');
}

function resetTimer() {
    pauseTimer();
    let minutes = parseInt(durationInput.value);
    if (isNaN(minutes) || minutes < 1) minutes = 25;
    timeLeft = minutes * 60;
    updateDisplay();
    document.title = 'Pomodoro Timer';
}

function resetControls() {
    isRunning = false;
    startBtn.textContent = 'Start';
    startBtn.classList.remove('active');
}

// Sound notification using Web Audio API
function playNotification() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // Create a rhythmic beep pattern (beep... beep... beep)
    const now = ctx.currentTime;

    [0, 0.5, 1.0].forEach(offset => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine'; // Can also use 'square' or 'triangle' for more "alert-like" sound
        oscillator.frequency.setValueAtTime(880, now + offset); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, now + offset + 0.1);

        gainNode.gain.setValueAtTime(0.1, now + offset);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.3);

        oscillator.start(now + offset);
        oscillator.stop(now + offset + 0.3);
    });
}

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
durationInput.addEventListener('change', () => {
    if (!isRunning) resetTimer();
});

// Initial display
updateDisplay();
