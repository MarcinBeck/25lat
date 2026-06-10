// Odliczanie do daty eventu — zmień TARGET_DATE na docelową
const TARGET_DATE = new Date('2026-06-24T12:00:00');

function updateCountdown() {
  const diff = TARGET_DATE - Date.now();
  if (diff <= 0) {
    document.querySelector('.countdown').innerHTML = '<p>Event się rozpoczął!</p>';
    return;
  }
  const days    = Math.floor(diff / 864e5);
  const hours   = Math.floor((diff % 864e5) / 36e5);
  const minutes = Math.floor((diff % 36e5)  / 6e4);
  const seconds = Math.floor((diff % 6e4)   / 1e3);

  document.getElementById('cd-days').textContent    = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent   = String(hours).padStart(2, '0');
  document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);
