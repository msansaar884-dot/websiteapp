const phoneNumber = '8210743343';

const playerNames = [
  'Sunita Devi', 'Vikash Yadav', 'Neha Gupta', 'Sanjay Pandey', 'Dilip Moon',
  'Meera Iyer', 'Pankaj Kumar', 'Nilu Shinde', 'Arjun Singh', 'Ravi Verma',
  'Pooja Sharma', 'Amit Das', 'Rakesh Pal', 'Kiran Rao', 'Anita Jain',
  'Suresh Kumar', 'Mahesh Patel', 'Priya Nair', 'Rahul Sinha', 'Deepak Roy'
];

const marketNames = [
  'Madhur Morning', 'Madhur Day', 'Time Bazar', 'Milan Day', 'Rajdhani Day',
  'Kalyan', 'Madhur Night', 'Milan Night', 'Rajdhani Night', 'Main Bazar',
  'Sridevi', 'Sridevi Night', 'Supreme Day', 'Supreme Night', 'Kalyan Night'
];

const marketSchedule = [
  ['Madhur Morning', '11:30 AM', '12:30 PM'],
  ['Madhur Day', '01:30 PM', '02:30 PM'],
  ['Time Bazar', '03:05 PM', '04:35 PM'],
  ['Milan Day', '03:15 PM', '05:20 PM'],
  ['Rajdhani Day', '03:30 PM', '05:00 PM'],
  ['Kalyan', '04:50 PM', '06:50 PM'],
  ['Madhur Night', '08:30 PM', '10:30 PM'],
  ['Milan Night', '09:05 PM', '11:15 PM'],
  ['Rajdhani Night', '09:30 PM', '11:45 PM'],
  ['Main Bazar', '10:00 PM', '12:10 AM']
];

const resultPool = Array.from({ length: 100 }, (_, index) => {
  const first = String((index * 7 + 123) % 1000).padStart(3, '0');
  const middle = String((index * 9 + 17) % 100).padStart(2, '0');
  const last = String((index * 11 + 456) % 1000).padStart(3, '0');
  return `${first}-${middle}-${last}`;
});

const winnerPool = Array.from({ length: 500 }, (_, index) => ({
  name: playerNames[index % playerNames.length],
  market: marketNames[index % marketNames.length],
  amount: 10000 + ((index * 9271) % 290000),
  time: `${(index % 59) + 1} min ago`,
 tag: ['TOP','VIP','FAST','LUCKY','MEGA'][index % 5]
}));

const withdrawalPool = Array.from({ length: 500 }, (_, index) => ({
  name: playerNames[(index + 3) % playerNames.length],
  method: ['UPI', 'PhonePe', 'Paytm', 'Bank'][index % 4],
  amount: 5000 + ((index * 8743) % 295000),
  time: `${(index % 59) + 1} sec ago`
}));

const luckyPool = Array.from({ length: 100 }, (_, index) => ({
  market: marketNames[index % marketNames.length],
  numbers: [
    (index * 3 + 1) % 10,
    (index * 5 + 4) % 10,
    (index * 7 + 8) % 10
  ],
  updated: `${(index % 12) + 1}:00 ${index % 2 ? 'PM' : 'AM'}`
}));

function formatRupees(value) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function getRotationStart(length) {
  return Math.floor(Date.now() / 15000) % length;
}

function takeRotatingItems(pool, count, offset = 0) {
  const start = (getRotationStart(pool.length) + offset) % pool.length;
  return Array.from({ length: count }, (_, index) => pool[(start + index) % pool.length]);
}

function parseTimeToMinutes(timeText) {
  const match = timeText.match(/(\d{1,2}):(\d{2})\s(AM|PM)/);
  if (!match) return 0;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3];
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getMarketStatus(openTime, closeTime) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const open = parseTimeToMinutes(openTime);
  let close = parseTimeToMinutes(closeTime);
  let adjustedCurrent = current;
  if (close < open) {
    close += 1440;
    if (current < open) adjustedCurrent += 1440;
  }
  return adjustedCurrent >= open && adjustedCurrent <= close ? 'LIVE' : 'UPCOMING';
}

function renderWinners() {
  const target = document.querySelector('#winnerCards');
  if (!target) return;
  target.classList.remove('is-refreshing');
  void target.offsetWidth;
  target.classList.add('is-refreshing');
  target.innerHTML = takeRotatingItems(winnerPool, 6).map((winner) => `
    <article class="winner-card">
      <span class="winner-badge">${winner.tag}</span>
      <span class="winner-avatar">★</span>
      <h3>${winner.name}</h3>
      <div class="winner-amount">${formatRupees(winner.amount)}</div>
      <span class="market-name">${winner.market}</span>
      <span class="time-small">${winner.time}</span>
    </article>
  `).join('');
}

function renderLuckyNumbers() {
  const target = document.querySelector('#luckyCards');
  if (!target) return;
  target.innerHTML = takeRotatingItems(luckyPool, 12, 15).map((item) => `
    <article class="lucky-card">
      <h3>${item.market}</h3>
      <div class="number-row">${item.numbers.map((number) => `<span>${number}</span>`).join('')}</div>
      <small>Lucky Numbers</small>
      <span class="time-small">Updated ${item.updated}</span>
    </article>
  `).join('');
}

function renderWithdrawals() {
  const target = document.querySelector('#withdrawalList');
  if (!target) return;
  target.innerHTML = takeRotatingItems(withdrawalPool, 10, 30).map((item) => `
    <article class="withdrawal-item">
      <span class="check">✓</span>
      <div>
        <strong>${item.name}</strong>
        <small>${item.method} • Verified</small>
      </div>
      <span class="withdrawal-amount">${formatRupees(item.amount)}</span>
      <span>${item.time}</span>
    </article>
  `).join('');
}

function renderMarkets() {
  const target = document.querySelector('#marketRows');
  if (!target) return;
  target.innerHTML = marketSchedule.map((market, index) => {
    const status = getMarketStatus(market[1], market[2]);
    return `
      <tr>
        <td>${market[0]}</td>
        <td>${market[1]}</td>
        <td>${market[2]}</td>
        <td><span class="status-pill ${status === 'LIVE' ? 'open' : ''}">${status}</span></td>
        <td>***-**-***</td>
      </tr>
    `;
  }).join('');
}

function updateLiveTimes() {
  const stamp = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.querySelectorAll('[data-update-time]').forEach((item) => {
    item.textContent = stamp;
  });
}

function setupMenu() {
  const button = document.querySelector('.menu-btn');
  const nav = document.querySelector('#mainNav');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

function setupFaq() {
  document.querySelectorAll('.faq-list button').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest('article').classList.toggle('open');
    });
  });
}

function renderAll() {
  renderWinners();
  renderLuckyNumbers();
  renderWithdrawals();
  renderMarkets();
  updateLiveTimes();
}
function animateCounter(id, start, end, duration = 1000) {
  const element = document.getElementById(id);
  if (!element) return;

  let startTime = null;

  function update(timestamp) {
    if (!startTime) startTime = timestamp;

    const progress = Math.min(
      (timestamp - startTime) / duration,
      1
    );

    element.textContent =
      Math.floor(start + (end - start) * progress).toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.setAttribute('href', `tel:+91${phoneNumber}`);
});

setupMenu();
setupFaq();
renderAll();
setInterval(renderAll, 5000);
animateCounter('happyPlayers', 0, 10000);
