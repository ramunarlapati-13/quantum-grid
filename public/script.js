const socket = io(); // Connects to the same host/port serving the page

// DOM Elements
const freqVal = document.getElementById('freq-value');
const voltVal = document.getElementById('volt-value');
const loadVal = document.getElementById('load-value');
const genVal = document.getElementById('gen-value');
const simTimeVal = document.getElementById('sim-time');
const statusBadge = document.getElementById('connection-status');
const freqBar = document.getElementById('freq-bar');
const voltBar = document.getElementById('volt-bar');

// Charts
let freqHistory = [];
let loadHistory = [];
let genHistory = [];
let timeLabels = [];

const ctxFreq = document.getElementById('freqChart').getContext('2d');
const ctxLoad = document.getElementById('loadChart').getContext('2d');

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: 'rgba(255, 255, 255, 0.5)' }
        },
        x: {
            grid: { display: false },
            ticks: { color: 'rgba(255, 255, 255, 0.5)' }
        }
    },
    plugins: {
        legend: { labels: { color: '#fff', font: { family: 'Outfit' } } }
    },
    animation: { duration: 0 }
};

const freqChart = new Chart(ctxFreq, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: [{
            label: 'Frequency (Hz)',
            data: freqHistory,
            borderColor: '#00f2ff',
            backgroundColor: 'rgba(0, 242, 255, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0
        }]
    },
    options: chartOptions
});

const loadChart = new Chart(ctxLoad, {
    type: 'line',
    data: {
        labels: timeLabels,
        datasets: [
            {
                label: 'Load (MW)',
                data: loadHistory,
                borderColor: '#ff00ea',
                backgroundColor: 'transparent',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0
            },
            {
                label: 'Gen (MW)',
                data: genHistory,
                borderColor: '#00ff88',
                backgroundColor: 'transparent',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0
            }
        ]
    },
    options: chartOptions
});

function updateDashboard(data) {
    if (!data) return;
    console.log('Updating dashboard with:', data);

    // Update Values
    if (data.frequency !== undefined) freqVal.textContent = data.frequency.toFixed(2);
    if (data.voltage !== undefined) voltVal.textContent = data.voltage.toFixed(1);
    if (data.totalLoad !== undefined) loadVal.textContent = data.totalLoad.toFixed(0);
    if (data.totalGen !== undefined) genVal.textContent = `Generation: ${data.totalGen.toFixed(0)} MW`;

    // Update Sim Time if available
    if (data.simHour !== undefined) {
        const h = Math.floor(data.simHour);
        const m = Math.floor((data.simHour - h) * 60);
        simTimeVal.textContent = `Day 1 | ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    // Update Bars
    if (data.frequency !== undefined) {
        // Freq 48-52 range mapped to 0-100%
        const freqPercent = ((data.frequency - 48) / 4) * 100;
        freqBar.style.width = `${Math.max(0, Math.min(100, freqPercent))}%`;

        // Check for critical levels
        if (data.frequency > 51 || data.frequency < 49) {
            freqVal.style.color = '#ff3e3e';
        } else {
            freqVal.style.color = '#fff';
        }
    }

    if (data.voltage !== undefined) {
        // Voltage 220-240 range mapped to 0-100%
        const voltPercent = ((data.voltage - 220) / 20) * 100;
        voltBar.style.width = `${Math.max(0, Math.min(100, voltPercent))}%`;
    }

    // Update History
    const now = new Date();
    const ts = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    timeLabels.push(ts);
    freqHistory.push(data.frequency || 50);
    loadHistory.push(data.totalLoad || 0);
    genHistory.push(data.totalGen || 0);

    // Keep only last 20 points
    if (timeLabels.length > 20) {
        timeLabels.shift();
        freqHistory.shift();
        loadHistory.shift();
        genHistory.shift();
    }

    freqChart.update();
    loadChart.update();
}

// Socket Events
socket.on('connect', () => {
    statusBadge.textContent = 'Connected to Backend';
    statusBadge.className = 'connected';
});

socket.on('disconnect', () => {
    statusBadge.textContent = 'Disconnected from Backend';
    statusBadge.className = 'disconnected';
});

socket.on('gridUpdate', (data) => {
    updateDashboard(data);
});

// Initial Fetch
fetch('/api/state')
    .then(res => res.json())
    .then(data => {
        updateDashboard(data);
    })
    .catch(err => console.error('Error fetching initial state:', err));
