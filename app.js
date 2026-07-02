const QUOTES_AESTHETIC = [
    "Las pequeñas acciones repetidas todos los días cambian una vida.",
    "La disciplina es elegir entre lo que querés ahora y lo que más querés.",
    "Tu yo futuro te está mirando. Hacele honor.",
    "No siempre vas a sentir motivación. Por eso construís disciplina.",
    "La consistencia supera a la perfección.",
    "Cada día es una nueva oportunidad de ser mejor.",
    "El esfuerzo de hoy es el éxito de mañana.",
    "No pares hasta que estés orgullosa de vos.",
    "Las flores más fuertes crecen entre las grietas.",
    "Sos capaz de más de lo que creés.",
    "Un día a la vez. Eso es todo.",
    "El progreso, no la perfección.",
    "Tu transformación comienza en el momento en que no querés seguir pero seguís."
];

const QUOTES_FOOTBALL = [
    "Champions train when nobody is watching.",
    "Discipline beats motivation.",
    "Win today.",
    "One more rep.",
    "One more day.",
    "Greatness is built daily."
];

const TASKS = [
    { id: 'water', icon: '💧', label: 'Tomé 3.8L de agua' },
    { id: 'workout1', icon: '💪', label: 'Workout #1 (Interior)' },
    { id: 'workout2', icon: '🌿', label: 'Workout #2 (Exterior)' },
    { id: 'reading', icon: '📖', label: 'Leí 10 páginas' },
    { id: 'diet', icon: '🥗', label: 'Seguí mi dieta' },
    { id: 'photo', icon: '📷', label: 'Foto del progreso' }
];

const EXTRA_HABITS = [
    { id: 'sleep', icon: '😴', label: 'Dormí 8 horas' },
    { id: 'spf', icon: '☀️', label: 'SPF' },
    { id: 'skincare', icon: '🌿', label: 'Skincare' },
    { id: 'meditation', icon: '🧘', label: 'Meditación' },
    { id: 'vitamins', icon: '💊', label: 'Vitaminas' },
    { id: 'steps', icon: '👟', label: '10.000 pasos' },
    { id: 'no-phone', icon: '📵', label: 'Sin redes antes de dormir' }
];

const ACHIEVEMENTS_AESTHETIC = [
    { id: 'd7', icon: '✨', name: 'Primera semana', day: 7 },
    { id: 'd14', icon: '🦋', name: 'Dos semanas', day: 14 },
    { id: 'd21', icon: '🌸', name: '21 días', day: 21 },
    { id: 'd30', icon: '👑', name: 'Un mes', day: 30 },
    { id: 'd50', icon: '💎', name: 'Día 50', day: 50 },
    { id: 'd75', icon: '🏆', name: '75 Hard!', day: 75 }
];

const ACHIEVEMENTS_FOOTBALL = [
    { id: 'd7', icon: '⚽', name: 'Rookie', day: 7 },
    { id: 'd14', icon: '🥈', name: 'Consistent', day: 14 },
    { id: 'd21', icon: '🥇', name: 'Elite', day: 21 },
    { id: 'd30', icon: '🏆', name: 'Champion', day: 30 },
    { id: 'd50', icon: '👑', name: 'Legend', day: 50 },
    { id: 'd75', icon: '⭐', name: '75 Hard Hall of Fame', day: 75 }
];

const WORKOUT_TYPES = ['Caminata', 'Correr', 'Gym', 'Pilates', 'Yoga', 'Ciclismo', 'Natación', 'HIIT', 'Otro'];
const MOODS = [
    { e: '😊', l: 'Genial', v: 5 },
    { e: '😌', l: 'Bien', v: 4 },
    { e: '😐', l: 'Regular', v: 3 },
    { e: '😫', l: 'Cansada', v: 2 },
    { e: '😭', l: 'Difícil', v: 1 }
];

function today() { return formatLocal(new Date()) }
function formatLocal(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0') }
function get(k) { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
function set(k, v) { localStorage.setItem(k, JSON.stringify(v)) }

function getDay() {
    const sd = get('startDate');
    if (!sd) return 1;
    const diff = Math.floor((new Date(today()) - new Date(sd)) / (864e5)) + 1;
    return Math.max(1, Math.min(75, diff));
}
function getChecks() { return get('checks-' + today()) || {} }
function getExtraHabits() { return get('extra-' + today()) || {} }
function currentTheme() { return get('appTheme') || 'aesthetic' }

let selectedPhotoSlot = null;

function migrateOldData() {
    const prefixes = ['checks-', 'water-', 'broken-', 'workout1-', 'workout2-', 'workout-type1-', 'workout-type2-', 'pages-', 'extra-', 'custom-checks-'];
    const startDate = get('startDate');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const prefix = prefixes.find(p => key.startsWith(p));
        if (!prefix) continue;
        const dateStr = key.slice(prefix.length);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;
        // Map old UTC-stored keys to local date (try same day and day before)
        const d = new Date(dateStr + 'T12:00:00');
        const candidates = [formatLocal(d)];
        d.setDate(d.getDate() - 1);
        candidates.push(formatLocal(d));
        for (const localDate of candidates) {
            const localKey = prefix + localDate;
            if (localKey !== key && get(localKey) === null && localDate >= startDate) {
                set(localKey, get(key));
                break;
            }
        }
    }
}

function init() {
    migrateOldData();
    if (!get('startDate')) set('startDate', today());
    const si = document.getElementById('start-date-input');
    if (si) si.value = get('startDate') || today();
    const ni = document.getElementById('name-input');
    if (ni) ni.value = get('userName') || '';
    const wg = document.getElementById('water-goal-input');
    if (wg) wg.value = get('waterGoal') || 8;

    const theme = currentTheme();
    document.getElementById('theme-selector').value = theme;
    if (theme === 'football') {
        document.documentElement.setAttribute('data-theme', 'football');
    }
    renderAll();
}

function changeTheme() {
    const val = document.getElementById('theme-selector').value;
    set('appTheme', val);
    if (val === 'football') {
        document.documentElement.setAttribute('data-theme', 'football');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    renderAll();
}

function renderAll() {
    const isFB = currentTheme() === 'football';
    document.getElementById('deco-item-1').textContent = isFB ? '⚽' : '🌸';
    document.getElementById('deco-item-2').textContent = isFB ? '🏆' : '✨';
    document.getElementById('deco-item-3').textContent = isFB ? '⏱️' : '🎀';

    document.getElementById('hero-badge-text').textContent = isFB ? '⏱️ TEMPORADA EN MARCHA' : '✨ Tu viaje de transformación';
    document.getElementById('hero-label-text').textContent = isFB ? 'FIXTURE COMPLETADO' : 'de 75 días';
    document.getElementById('done-banner-title').textContent = isFB ? '¡Partido ganado hoy! 🏆' : '¡Día completado! 🌸';
    document.getElementById('cal-sub-text').textContent = isFB ? 'Días ganados en verde 🟢, lesionado con 💔' : 'Días completos en rosa 🩷, días rotos con 💔';
    document.getElementById('cal-leg-complete').textContent = isFB ? '🟢' : '🩷';
    document.getElementById('restart-title').textContent = isFB ? '¿Tarjeta roja? ¿Reiniciar temporada?' : '¿Rompiste el reto?';
    document.getElementById('stats-title-main').textContent = isFB ? '🏅 Ficha del Jugador' : '📈 Estadísticas';
    document.getElementById('stats-subtitle-main').textContent = isFB ? 'Tus estadísticas profesionales en tiempo real.' : 'Tu progreso en números.';
    document.getElementById('chart-title-main').textContent = isFB ? 'Rendimiento físico últimos 14 partidos' : '% completado por día (últimos 14)';

    renderHome();
    renderChecklist();
    renderWater();
    renderCalendar();
    renderJournal();
    renderMood();
    renderAchievements();
    renderStats();
    renderPhotos();
    renderWorkout();
    renderReading();
    renderCustomTasks();
    renderLetter();
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.getElementById('nav-' + id).classList.add('active');
    renderAll();
}

function renderHome() {
    const day = getDay();
    const pct = Math.round((day / 75) * 100);
    document.getElementById('hero-day').textContent = day;
    document.getElementById('hero-pct').textContent = pct + '%';
    document.getElementById('hero-bar').style.width = pct + '%';

    const isFB = currentTheme() === 'football';
    const quotesPool = isFB ? QUOTES_FOOTBALL : QUOTES_AESTHETIC;
    const qi = Math.abs(new Date(today()).getDate() - 1) % quotesPool.length;
    document.getElementById('hero-quote').textContent = '"' + quotesPool[qi] + '"';

    const dateEl = document.getElementById('home-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

    const checks = getChecks();
    const mc = document.getElementById('home-checklist-mini');
    if (mc) {
        mc.innerHTML = TASKS.map(t => `<div class="check-item" onclick="toggleCheck('${t.id}')">
      <span class="check-icon">${t.icon}</span>
      <div class="check-box ${checks[t.id] ? 'done' : ''}">✓</div>
      <span class="check-label ${checks[t.id] ? 'done' : ''}">${t.label}</span>
    </div>`).join('');
    }
    document.getElementById('home-streak').textContent = calcStreak();

    const cups = parseInt(get('water-' + today()) || 0);
    const goal = parseInt(get('waterGoal') || 8);
    const hc = document.getElementById('home-cups');
    if (hc) {
        let html = '';
        for (let i = 0; i < Math.min(goal, 8); i++) {
            html += `<span class="cup ${i < cups ? 'filled' : ''}" onclick="toggleCup(${i + 1})">💧</span>`;
        }
        hc.innerHTML = html;
    }
    document.getElementById('home-water-fill').style.width = Math.min(100, Math.round((cups / goal) * 100)) + '%';
    document.getElementById('home-water-text').textContent = cups + ' / ' + goal + ' vasos';

    const eh = document.getElementById('home-extra-habits');
    const extra = getExtraHabits();
    if (eh) {
        eh.innerHTML = EXTRA_HABITS.map(h => `<span class="habit-chip ${extra[h.id] ? 'done' : ''}" onclick="toggleExtra('${h.id}')">${h.icon} ${h.label}</span>`).join('');
    }
    const homeCustomTasks = document.getElementById('home-custom-tasks');
    const homeCustomCard = document.getElementById('home-custom-card');
    if (homeCustomTasks && homeCustomCard) {
        const tasks = getCustomTasks();
        const checks = get('custom-checks-' + today()) || {};
        if (tasks.length > 0) {
            homeCustomCard.style.display = 'block';
            homeCustomTasks.innerHTML = tasks.map(t => `<span class="habit-chip ${checks[t.id] ? 'done' : ''}" onclick="toggleCustomCheck('${t.id}')">${t.label}</span>`).join('');
        } else {
            homeCustomCard.style.display = 'none';
            homeCustomTasks.innerHTML = '';
        }
    }
}

function calcStreak() {
    let streak = 0;
    const t = new Date();
    for (let i = 0; i < 75; i++) {
        const d = new Date(t); d.setDate(t.getDate() - i);
        const ds = formatLocal(d);
        const c = get('checks-' + ds);
        if (c && TASKS.every(t2 => c[t2.id])) streak++;
        else if (i > 0) break;
    }
    return streak;
}

function renderChecklist() {
    const checks = getChecks();
    const all = TASKS.every(t => checks[t.id]);
    const card = document.getElementById('checklist-card');
    const sub = document.getElementById('check-date-sub');
    if (sub) sub.textContent = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (card) {
        card.innerHTML = TASKS.map(t => `<div class="check-item" onclick="toggleCheck('${t.id}')">
      <span class="check-icon">${t.icon}</span>
      <div class="check-box ${checks[t.id] ? 'done' : ''}">✓</div>
      <span class="check-label ${checks[t.id] ? 'done' : ''}">${t.label}</span>
      ${checks[t.id] ? '<span style="margin-left:auto;font-size:16px">✨</span>' : ''}
    </div>`).join('');
    }
    const banner = document.getElementById('all-done-banner');
    if (banner) {
        if (all) { banner.classList.add('show'); launchConfetti(); }
        else banner.classList.remove('show');
    }
}

function toggleCheck(id) {
    const checks = getChecks();
    checks[id] = !checks[id];
    set('checks-' + today(), checks);
    const all = TASKS.every(t => checks[t.id]);
    if (all) { set('day-complete-' + today(), true); checkCelebration(); }
    spawnSparkleCenter();
    renderAll();
}

function toggleCup(n) {
    const goal = parseInt(get('waterGoal') || 8);
    const cur = parseInt(get('water-' + today()) || 0);
    const newV = cur >= n ? n - 1 : n;
    set('water-' + today(), Math.max(0, Math.min(goal, newV)));
    if (newV >= goal) {
        const checks = getChecks();
        checks['water'] = true;
        set('checks-' + today(), checks);
    }
    renderAll();
}

function renderWater() {
    const goal = parseInt(get('waterGoal') || 8);
    const cups = parseInt(get('water-' + today()) || 0);
    const main = document.getElementById('water-cups-main');
    if (main) {
        let html = '';
        for (let i = 0; i < goal; i++) {
            html += `<span class="cup ${i < cups ? 'filled' : ''}" style="font-size:34px" onclick="toggleCup(${i + 1})">💧</span>`;
        }
        main.innerHTML = html;
    }
    document.getElementById('water-fill-main').style.width = Math.min(100, Math.round((cups / goal) * 100)) + '%';
    const txt = document.getElementById('water-text-main');
    if (txt) { const L = (cups * 0.475).toFixed(1); txt.textContent = cups + ' / ' + goal + ' vasos  (' + L + ' / 3.8 L)'; }
}

function renderCalendar() {
    const hdr = document.getElementById('cal-header');
    const grid = document.getElementById('cal-grid');
    if (!hdr || !grid) return;
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    hdr.innerHTML = days.map(d => `<div class="cal-day-name">${d}</div>`).join('');
    const sdStr = get('startDate') || today();
    const sd = new Date(sdStr + 'T12:00:00');
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    let html = '';
    let lastMonth = -1;
    const startDow = (sd.getDay() + 6) % 7;
    for (let i = 0; i < startDow; i++) html += `<div class="cal-cell empty"></div>`;
    const now = today();
    for (let i = 0; i < 75; i++) {
        const d = new Date(sd); d.setDate(sd.getDate() + i);
        const m = d.getMonth();
        if (m !== lastMonth) {
            lastMonth = m;
            const label = months[m] + ' ' + d.getFullYear();
            html += `<div class="cal-month-label" colspan="7">${label}</div>`;
            const dow = (d.getDay() + 6) % 7;
            for (let j = 0; j < dow; j++) html += `<div class="cal-cell empty"></div>`;
        }
        const ds = formatLocal(d);
        const isToday = ds === now;
        const isFuture = ds > now;
        const checks = get('checks-' + ds);
        const complete = checks && TASKS.every(t2 => checks[t2.id]);
        const broken = get('broken-' + ds);
        let cls = 'cal-cell';
        if (isToday) cls += ' today';
        else if (isFuture) cls += ' future';
        else if (complete) cls += ' filled';
        else if (broken) cls += ' broken';
        const content = complete ? (currentTheme() === 'football' ? '🟢' : '🩷') : '';
        html += `<div class="${cls}" title="Día ${i + 1}">${content || d.getDate()}</div>`;
    }
    grid.innerHTML = html;
}

function restartChallenge() {
    if (!confirm('¿Segura que querés reiniciar el reto? Hoy se convierte en el nuevo Día 1.')) return;
    set('startDate', today());
    renderAll();
}

function renderJournal() {
    const entries = get('journal-entries') || [];
    const hist = document.getElementById('journal-history');
    if (!hist) return;
    if (entries.length === 0) {
        hist.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:13px;margin-top:8px">Tus entradas aparecerán acá 🌸</p>';
        return;
    }
    hist.innerHTML = [...entries].reverse().map(e => `
    <div class="card journal-entry">
      <div class="journal-entry-date">${new Date(e.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Día ${e.day || '?'}</div>
      <div class="journal-entry-text">${e.text.replace(/\n/g, '<br>')}</div>
    </div>`).join('');
}

function saveJournal() {
    const ji = document.getElementById('journal-input');
    if (!ji || !ji.value.trim()) return;
    const entries = get('journal-entries') || [];
    entries.push({ date: today(), text: ji.value.trim(), day: getDay() });
    set('journal-entries', entries);
    ji.value = '';
    renderJournal();
}

function renderMood() {
    const mb = document.getElementById('mood-buttons');
    const tm = get('mood-' + today());
    if (mb) {
        mb.innerHTML = MOODS.map(m => `<button class="mood-btn ${tm === m.v ? 'selected' : ''}" onclick="saveMood(${m.v})">
      ${m.e}<div style="font-size:10px;margin-top:2px;color:var(--text-muted)">${m.l}</div>
    </button>`).join('');
    }
}

function saveMood(v) { set('mood-' + today(), v); renderMood(); }

function renderAchievements() {
    const grid = document.getElementById('ach-grid');
    if (!grid) return;
    const day = getDay();
    const pool = currentTheme() === 'football' ? ACHIEVEMENTS_FOOTBALL : ACHIEVEMENTS_AESTHETIC;
    grid.innerHTML = pool.map(a => {
        const unlocked = day >= a.day;
        return `<div class="ach-card ${unlocked ? 'unlocked' : 'locked'}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-day">Día ${a.day}</div>
    </div>`;
    }).join('');
}

function renderStats() {
    const grid = document.getElementById('stats-grid');
    const fbc = document.getElementById('football-player-card');
    if (!grid) return;
    const day = getDay();
    const sd = new Date((get('startDate') || today()) + 'T12:00:00');
    const isFB = currentTheme() === 'football';

    let completeDays = 0, totalLiters = 0, totalWorkoutMins = 0, totalPages = 0, dietDays = 0;
    for (let i = 0; i < day; i++) {
        const d = new Date(sd); d.setDate(sd.getDate() + i);
        const ds = formatLocal(d);
        const c = get('checks-' + ds);
        if (c) {
            if (TASKS.every(t => c[t.id])) completeDays++;
            if (c['diet']) dietDays++;
        }
        totalLiters += parseInt(get('water-' + ds) || 0) * 0.475;
        const w1 = get('workout1-' + ds); const w2 = get('workout2-' + ds);
        if (w1) totalWorkoutMins += parseInt(w1.duration || 0);
        if (w2) totalWorkoutMins += parseInt(w2.duration || 0);
        totalPages += parseInt(get('pages-' + ds) || 0);
    }

    const waterPct = Math.min(100, Math.round(((totalLiters / 3.8) / day) * 100)) || 0;
    const trainingPct = Math.min(100, Math.round(((totalWorkoutMins / 90) / day) * 100)) || 0;
    const readingPct = Math.min(100, Math.round(((totalPages / 10) / day) * 100)) || 0;
    const dietPct = Math.min(100, Math.round((dietDays / day) * 100)) || 0;
    const overallConsistency = Math.round((completeDays / Math.max(1, day)) * 100);

    if (isFB) {
        grid.style.display = 'none';
        fbc.style.display = 'block';
        const container = document.getElementById('player-attributes-container');

        const attributes = [
            { name: 'Disciplina', val: Math.round(waterPct) },
            { name: 'Fuerza', val: Math.round(trainingPct) },
            { name: 'Constancia', val: Math.round(overallConsistency) },
            { name: 'Lectura', val: Math.round(readingPct) },
            { name: 'Hábitos (Dieta)', val: Math.round(dietPct) }
        ];

        container.innerHTML = attributes.map(a => `
          <div class="attribute-row">
              <div class="attribute-meta">
                  <span>${a.name}</span>
                  <span style="color:#22C55E;">${a.val}</span>
              </div>
              <div class="attribute-track">
                  <div class="attribute-fill" style="width:${a.val}%;"></div>
              </div>
          </div>
      `).join('');
    } else {
        grid.style.display = 'grid';
        fbc.style.display = 'none';
        const photos = get('photos') || {};
        const photoCount = Object.keys(photos).filter(k => photos[k]).length;
        const stats = [
            { icon: '📅', val: day, lbl: 'Días en el reto' },
            { icon: '🩷', val: completeDays, lbl: 'Días completos' },
            { icon: '🔥', val: calcStreak(), lbl: 'Racha actual' },
            { icon: '💧', val: totalLiters.toFixed(1) + 'L', lbl: 'Agua total' },
            { icon: '🏋️', val: Math.round(totalWorkoutMins / 60) + 'h', lbl: 'Horas entrenadas' },
            { icon: '📚', val: totalPages, lbl: 'Páginas leídas' },
            { icon: '📷', val: photoCount, lbl: 'Fotos subidas' },
            { icon: '📊', val: overallConsistency + '%', lbl: 'Tasa de éxito' }
        ];
        grid.innerHTML = stats.map(s => `<div class="stat-card">
        <div class="stat-icon">${s.icon}</div>
        <div class="stat-val">${s.val}</div>
        <div class="stat-lbl">${s.lbl}</div>
      </div>`).join('');
    }

    const cc = document.getElementById('completion-chart');
    if (cc) {
        let html = '';
        for (let i = 13; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const ds = formatLocal(d);
            const c = get('checks-' + ds);
            let pct = 0;
            if (c) { const done = TASKS.filter(t => c[t.id]).length; pct = Math.round((done / TASKS.length) * 100); }
            const dn = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][d.getDay()];
            html += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="width:100%;border-radius:3px 3px 0 0;height:${Math.max(2, pct * .6)}px;background:var(--accent-gradient)"></div>
        <div style="font-size:8px;color:var(--text-muted)">${dn}</div>
      </div>`;
        }
        cc.innerHTML = html;
    }
}

function renderPhotos() {
    const grid = document.getElementById('photos-grid');
    const saveRow = document.getElementById('photo-save-row');
    if (!grid) return;
    const photos = get('photos') || {};
    let html = '';
    for (let i = 1; i <= 10; i++) {
        const week = 'week' + i;
        const isPending = pendingPhotoSlot === week && pendingPhotoData;
        const imgSrc = isPending ? pendingPhotoData : photos[week];
        html += `<div class="photo-slot ${isPending ? 'pending' : ''}" onclick="openPhotoUpload('${week}')">
      ${imgSrc ? `<img src="${imgSrc}" alt="Semana ${i}">` : `<div class="upload-icon">📷</div><div class="upload-label">Semana ${i}</div>`}
      ${isPending ? '<div class="pending-badge">🆕 Vista previa</div>' : ''}
    </div>`;
    }
    grid.innerHTML = html;
    if (saveRow) saveRow.style.display = pendingPhotoData ? 'block' : 'none';
}

function openPhotoUpload(slot) { selectedPhotoSlot = slot; document.getElementById('photo-input').click(); }

let pendingPhotoData = null;
let pendingPhotoSlot = null;

document.getElementById('photo-input').addEventListener('change', function () {
    if (!this.files[0] || !selectedPhotoSlot) return;
    const reader = new FileReader();
    reader.onload = e => {
        pendingPhotoData = e.target.result;
        pendingPhotoSlot = selectedPhotoSlot;
        this.value = '';
        renderPhotos();
    };
    reader.readAsDataURL(this.files[0]);
    this.value = '';
});

function savePendingPhoto() {
    if (!pendingPhotoData || !pendingPhotoSlot) return;
    const photos = get('photos') || {};
    photos[pendingPhotoSlot] = pendingPhotoData;
    set('photos', photos);
    const checks = getChecks();
    checks['photo'] = true;
    set('checks-' + today(), checks);
    pendingPhotoData = null;
    pendingPhotoSlot = null;
    renderAll();
}

function cancelPendingPhoto() {
    pendingPhotoData = null;
    pendingPhotoSlot = null;
    renderPhotos();
}

function renderWorkout() {
    ['1', '2'].forEach(n => {
        const wt = document.getElementById('w' + n + '-types');
        if (!wt) return;
        const sel = get('workout-type' + n + '-' + today()) || '';
        wt.innerHTML = WORKOUT_TYPES.map(t => `<span class="type-chip ${sel === t ? 'sel' : ''}" onclick="selectWorkoutType(${n},'${t}')">${t}</span>`).join('');
        const status = document.getElementById('w' + n + '-status');
        const w = get('workout' + n + '-' + today());
        if (status) status.textContent = w ? '✓ ' + w.type + ' — ' + w.duration + ' min' : 'Sin registrar hoy';
        const dur = document.getElementById('w' + n + '-duration');
        if (dur && w) dur.value = w.duration || '';
    });
}

function selectWorkoutType(n, type) { set('workout-type' + n + '-' + today(), type); renderWorkout(); }

function saveWorkout(n) {
    const dur = document.getElementById('w' + n + '-duration');
    const type = get('workout-type' + n + '-' + today()) || 'General';
    if (!dur || !dur.value) return;
    set('workout' + n + '-' + today(), { type, duration: parseInt(dur.value) });
    const checks = getChecks();
    checks['workout' + n] = true;
    set('checks-' + today(), checks);
    renderAll();
}

/* Books */
function getBooks() { return get('books') || [] }
function saveBooks(list) { set('books', list) }

function addBook() {
    const nameEl = document.getElementById('book-name-input');
    const totalEl = document.getElementById('book-total-input');
    if (!nameEl || !totalEl) return;
    const name = nameEl.value.trim();
    const total = parseInt(totalEl.value);
    if (!name || !total || total < 1) return;
    const coverInput = document.getElementById('book-cover-input');
    const cover = coverInput?.files?.[0] ? coverInput.files[0] : null;
    if (cover) {
        const reader = new FileReader();
        reader.onload = e => {
            const books = getBooks();
            books.push({ id: 'b' + Date.now(), name, totalPages: total, cover: e.target.result });
            saveBooks(books);
            nameEl.value = ''; totalEl.value = ''; coverInput.value = '';
            renderReading();
        };
        reader.readAsDataURL(cover);
    } else {
        const books = getBooks();
        books.push({ id: 'b' + Date.now(), name, totalPages: total, cover: null });
        saveBooks(books);
        nameEl.value = ''; totalEl.value = '';
        renderReading();
    }
}

function removeBook(id) {
    const books = getBooks().filter(b => b.id !== id);
    saveBooks(books);
    renderReading();
}

function addBookPages(bookId) {
    const inp = document.getElementById('bp-' + bookId);
    if (!inp) return;
    const v = parseInt(inp.value);
    if (!v || v < 1) return;
    const key = 'book-progress-' + bookId;
    const current = parseInt(get(key) || 0);
    set(key, current + v);
    const dailyKey = 'book-daily-' + today() + '-' + bookId;
    const dailyCur = parseInt(get(dailyKey) || 0);
    set(dailyKey, dailyCur + v);
    const books = getBooks();
    let totalToday = 0;
    books.forEach(b => { totalToday += parseInt(get('book-daily-' + today() + '-' + b.id) || 0); });
    set('pages-' + today(), totalToday);
    const checks = getChecks();
    if (totalToday >= 10) { checks['reading'] = true; set('checks-' + today(), checks); }
    inp.value = '';
    renderReading();
}

function renderBooks() {
    const container = document.getElementById('books-container');
    if (!container) return;
    const books = getBooks();
    if (books.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:13px;padding:20px 0">Aún no agregaste libros. 📖</p>';
        return;
    }
    container.innerHTML = books.map(b => {
        const prog = parseInt(get('book-progress-' + b.id) || 0);
        const pct = b.totalPages > 0 ? Math.min(100, Math.round((prog / b.totalPages) * 100)) : 0;
        return `<div class="card">
            <div class="book-card">
                <div class="book-cover">${b.cover ? `<img src="${b.cover}" alt="${b.name}">` : b.name}</div>
                <div class="book-info">
                    <div>
                        <div class="book-name">${b.name}</div>
                        <div class="book-meta">${prog} / ${b.totalPages} páginas · ${pct}%</div>
                    </div>
                    <div class="book-bar-track"><div class="book-bar-fill" style="width:${pct}%"></div></div>
                    <div class="book-actions">
                        <input type="number" class="num-input" id="bp-${b.id}" min="1" placeholder="págs">
                        <button class="btn btn-pink" onclick="addBookPages('${b.id}')">+ Leer</button>
                        <button class="btn btn-outline btn-remove" onclick="removeBook('${b.id}')">✕</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function renderReading() {
    renderBooks();
    const pToday = get('pages-' + today()) || 0;
    const pd = document.getElementById('pages-input');
    if (pd && !pd.value) pd.value = pToday || '';
    document.getElementById('total-pages').textContent = calcTotalPagesEver();
}

function calcTotalPagesEver() {
    const books = getBooks();
    if (books.length > 0) {
        let total = 0;
        books.forEach(b => { total += parseInt(get('book-progress-' + b.id) || 0); });
        return total;
    }
    return parseInt(get('pages-' + today()) || 0);
}

function savePages() {
    const pd = document.getElementById('pages-input');
    if (!pd) return;
    const v = parseInt(pd.value) || 0;
    set('pages-' + today(), v);
    const checks = getChecks();
    if (v >= 10) { checks['reading'] = true; set('checks-' + today(), checks); }
    renderAll();
}

function toggleExtra(id) {
    const extra = getExtraHabits();
    extra[id] = !extra[id];
    set('extra-' + today(), extra);
    renderAll();
}

function renderLetter() {
    const day = getDay();
    const el = document.getElementById('letter-content');
    if (!el) return;
    if (day < 75) {
        el.innerHTML = `<div class="letter-wrap"><div class="letter-locked">
      <div class="lock-icon">🔒</div>
      <h3 style="font-family:'Playfair Display',serif;font-size:20px;margin-bottom:8px">Bloqueada</h3>
      <p class="text-sm">Esta carta se desbloqueará cuando completes los 75 días.<br><br>
      Te faltan <strong style="color:var(--pink-deep)">${75 - day} días</strong>. ¡Vos podés!</p>
    </div></div>`;
    }
}

function checkCelebration() {
    const sd = new Date((get('startDate') || today()) + 'T12:00:00');
    let allComplete = true;
    for (let i = 0; i < 75; i++) {
        const d = new Date(sd); d.setDate(sd.getDate() + i);
        const ds = formatLocal(d);
        const c = get('checks-' + ds);
        if (!c || !TASKS.every(t => c[t.id])) { allComplete = false; break; }
    }
    if (allComplete) {
        const el = document.getElementById('celebration');
        if (el) el.classList.add('show');
        launchConfetti();
    }
}
document.getElementById('celebration')?.addEventListener('click', function(e) {
    if (e.target.closest('.close-cel') || e.target === this) {
        this.classList.remove('show');
    }
});

/* Custom tasks */
function getCustomTasks() { return get('custom-tasks') || [] }
function saveCustomTasks(list) { set('custom-tasks', list) }

function addCustomTask() {
    const inp = document.getElementById('custom-task-input');
    if (!inp || !inp.value.trim()) return;
    const tasks = getCustomTasks();
    tasks.push({ id: 'c' + Date.now(), label: inp.value.trim() });
    saveCustomTasks(tasks);
    inp.value = '';
    renderCustomTasks();
}

function removeCustomTask(id) {
    const tasks = getCustomTasks().filter(t => t.id !== id);
    saveCustomTasks(tasks);
    renderCustomTasks();
}

function toggleCustomCheck(id) {
    const checks = get('custom-checks-' + today()) || {};
    checks[id] = !checks[id];
    set('custom-checks-' + today(), checks);
    renderCustomTasks();
}

function renderCustomTasks() {
    const el = document.getElementById('custom-tasks-list');
    if (!el) return;
    const tasks = getCustomTasks();
    const checks = get('custom-checks-' + today()) || {};
    if (tasks.length === 0) {
        el.innerHTML = '<p style="font-size:13px;color:var(--text-muted);margin-bottom:8px">No agregaste actividades extra todavía.</p>';
        return;
    }
    el.innerHTML = tasks.map(t => `<span class="custom-chip ${checks[t.id] ? 'done' : ''}">
        <span onclick="toggleCustomCheck('${t.id}')" style="cursor:pointer">${checks[t.id] ? '✓' : '○'} ${t.label}</span>
        <span class="remove-custom" onclick="removeCustomTask('${t.id}')">✕</span>
    </span>`).join('');
}

function updateStartDate() { const inp = document.getElementById('start-date-input'); if (inp) { set('startDate', inp.value); renderAll(); } }
function saveName() { const inp = document.getElementById('name-input'); if (inp) set('userName', inp.value); }
function saveWaterGoal() { const inp = document.getElementById('water-goal-input'); if (inp) { set('waterGoal', parseInt(inp.value) || 8); renderAll(); } }

function exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); data[k] = localStorage.getItem(k); }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '75hard-data.json'; a.click();
}

function confirmReset() {
    if (confirm('⚠️ ¿Segura que querés borrar TODOS los datos? Esta acción no se puede deshacer.')) { localStorage.clear(); location.reload(); }
}

function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#2563EB', '#22C55E', '#FFD700', '#FF8FAB', '#C9B8F5', '#FFFFFF'];
    const pieces = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        w: 5 + Math.random() * 9,
        h: 5 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        vx: (Math.random() - .5) * 5,
        vy: 3 + Math.random() * 4,
        vr: (Math.random() - .5) * 9
    }));
    let frames = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
            p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += .06;
        });
        frames++;
        if (frames < 130) requestAnimationFrame(draw);
        else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
    }
    draw();
}

function spawnSparkleCenter() {
    const emojis = currentTheme() === 'football' ? ['⚽', '🏆', '⭐', '🔥', '🥇'] : ['✨', '🌸', '💖', '⭐', '🌟'];
    const e = emojis[Math.floor(Math.random() * emojis.length)];
    const el = document.createElement('span');
    el.className = 'sparkle'; el.textContent = e;
    const x = 100 + Math.random() * (window.innerWidth - 200);
    const y = 100 + Math.random() * (window.innerHeight - 200);
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:9000;pointer-events:none;font-size:22px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
}

init();