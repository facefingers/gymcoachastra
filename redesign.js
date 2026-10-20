
/* Presentation helpers: uses the original storage schema and workout definitions. */
(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const ru = () => currentLanguage === 'ru';
    const text = (r, e) => ru() ? r : e;
    const localDate = date => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    function dashboard() {
        let history = [];
        try { history = getWorkoutHistory(); } catch (_) { /* Never overwrite saved data. */ }
        if (!Array.isArray(history)) history = [];
        const now = new Date();
        const monday = new Date(now);
        monday.setHours(0,0,0,0);
        monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
        const nextMonday = new Date(monday);
        nextMonday.setDate(nextMonday.getDate() + 7);
        const week = history.filter(item => {
            const date = new Date(item.date);
            return date >= monday && date < nextMonday && date <= now;
        });
        const locale = ru() ? 'ru-RU' : 'en-US';
        $('weekCount').textContent = week.length;
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        $('weekRange').textContent = `${monday.getDate()}–${sunday.toLocaleDateString(locale,{day:'numeric',month:'short'})}`;
        $('weekDays').replaceChildren();
        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(day.getDate() + i);
            const trained = week.some(item => localDate(new Date(item.date)) === localDate(day));
            const today = localDate(day) === localDate(now);
            const el = document.createElement('div');
            el.className = `week-day${trained ? ' trained' : ''}${today ? ' today' : ''}`;
            el.title = day.toLocaleDateString(locale) + (trained ? text(' · Есть тренировка',' · Workout logged') : '');
            if (today) el.setAttribute('aria-current','date');
            const badge = document.createElement('b');
            badge.textContent = trained ? '✓' : String(day.getDate());
            const label = document.createElement('span');
            label.textContent = day.toLocaleDateString(locale,{weekday:'short'});
            el.append(badge,label);
            $('weekDays').append(el);
        }
        $('weekMessage').textContent = week.length
            ? text('Каждая тренировка — шаг вперёд.','Every workout is a step forward.')
            : text('Новая неделя. Начни с первой тренировки.','A fresh week. Start with your first workout.');
        const sum = key => history.reduce((total,item) => total + (Number(item[key]) || 0),0);
        $('allWorkouts').textContent = history.length.toLocaleString(locale);
        $('allMinutes').textContent = Math.round(sum('duration') / 60).toLocaleString(locale);
        $('allSets').textContent = sum('completedSets').toLocaleString(locale);
        $('heroStartBtn').textContent = currentWorkout
            ? text('Продолжить тренировку ↗','Resume workout ↗')
            : text('Выбрать тренировку ↗','Choose a workout ↗');
    }

    function session() {
        if (!currentWorkout) return;
        const workout = workouts[currentWorkout];
        $('sessionTitle').textContent = ru() ? workout.name : (workout.nameEn || workout.name);
        const boxes = [...document.querySelectorAll('#exercisesList .set-checkbox')];
        const done = boxes.filter(box => box.checked).length;
        $('sessionCount').textContent = `${done} / ${boxes.length}`;
        $('sessionProgress').max = boxes.length || 1;
        $('sessionProgress').value = done;
        $('sessionProgress').setAttribute('aria-label', text('Прогресс тренировки','Workout progress'));
    }

    function navigation() {
        const active = document.querySelector('.screen.active')?.id;
        document.querySelectorAll('[data-screen]').forEach(button => {
            const isActive = button.dataset.screen === active ||
                (active === 'workoutScreen' && button.dataset.screen === 'mainScreen');
            button.classList.toggle('nav-current', isActive);
            if (isActive) button.setAttribute('aria-current','page');
            else button.removeAttribute('aria-current');
        });
        dashboard();
        session();
    }

    function localize() {
        document.documentElement.lang = currentLanguage;
        document.querySelectorAll('[data-ru][data-en]').forEach(el => {
            el.textContent = ru() ? el.dataset.ru : el.dataset.en;
        });
        $('homeBtn').textContent = text('Тренировки','Workouts');
        document.querySelectorAll('.workout-card').forEach(card => {
            const id = card.dataset.workout;
            card.querySelector('h2').textContent = text('Тренировка ','Workout ') + id;
            card.querySelector('.start-btn').textContent = text('Начать тренировку','Start workout');
        });
        $('themeToggle').setAttribute('aria-label', text('Светлая тема','Light theme'));
        $('languageToggle').setAttribute('aria-label', text('English language','English language'));
        $('weekDays').setAttribute('aria-label',text('Активность за неделю','Activity this week'));
        document.querySelector('.program-filters').setAttribute('aria-label',text('Фильтр программ','Program filter'));
        dashboard();
        session();
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.workout-card').forEach(card => {
            const id = Number(card.dataset.workout);
            card.dataset.category = id <= 3 ? 'strength' : id <= 6 ? 'tone' : 'split';
            const number = document.createElement('div');
            number.className = 'card-index';
            number.setAttribute('aria-hidden','true');
            number.textContent = String(id).padStart(2,'0');
            card.querySelector('h3').before(number);
        });
        document.querySelectorAll('.filter').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter').forEach(other => {
                    other.classList.toggle('active',other === button);
                    other.setAttribute('aria-pressed',String(other === button));
                });
                document.querySelectorAll('.workout-card').forEach(card => {
                    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
                });
            });
        });
        $('homeBtn').addEventListener('click',() => showScreen('mainScreen'));
        $('mainTitle').addEventListener('keydown',event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                $('mainTitle').click();
            }
        });
        document.querySelectorAll('.mobile-nav [data-target]').forEach(button => {
            button.addEventListener('click',() => {
                $(button.dataset.target).click();
                window.scrollTo({top:0,behavior:'instant'});
            });
        });
        $('heroStartBtn').addEventListener('click',() => {
            if (currentWorkout) {
                showScreen('workoutScreen');
                window.scrollTo({top:0,behavior:'instant'});
            } else {
                $('programs').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
            }
        });
        $('languageToggle').addEventListener('change',localize);
        $('clearHistoryBtn').addEventListener('click',dashboard);
        $('exercisesList').addEventListener('change',session);
        const screenObserver = new MutationObserver(navigation);
        document.querySelectorAll('.screen').forEach(screen => screenObserver.observe(screen,{attributes:true,attributeFilter:['class']}));
        new MutationObserver(session).observe($('exercisesList'),{childList:true});
        window.addEventListener('storage',dashboard);
        window.addEventListener('focus',dashboard);
        localize();
        navigation();
    });
})();
