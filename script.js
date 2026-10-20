// Текущий язык
let currentLanguage = localStorage.getItem('language') || 'ru';

// Порядок упражнений (для drag & drop)
let exerciseOrder = {};

// Выбранные альтернативные упражнения {workoutId-exerciseIndex: alternativeIndex}
let selectedAlternatives = {};

// Переводы интерфейса
const translations = {
    ru: {
        // Главный экран
        mainTitle: "💪 Мои Тренировки",
        start: "Начать",
        history: "История",
        stats: "Статистика",
        advice: "Советы",

        // Тренировка
        back: "← Назад",
        finish: "✓ Завершить",
        totalTime: "Общее время:",
        weight: "Вес:",
        target: "Цель:",
        warmup: "+Разминка",
        warmupLabel: "🔥 Разминка",
        set: "Подход",
        reps: "раз",
        cardio: "Кардио",
        minutes: "минут",
        start: "▶ Старт",

        // Кнопки
        changeWeight: "⚙️ Вес",
        superset: "➕ Суперсет",
        alternative: "🔄 Занят?",
        optional: "ОПЦИОНАЛЬНО",

        // Таймеры
        rest: "⏱️ Отдых",
        cardioTitle: "🏃 Кардио",
        supersetRest: "⚡ СУПЕРСЕТ - Быстро!",
        ready: "Готов!",
        addTime: "+15 сек",

        // Акценты
        technique: "Техника:",
        footPosition: "Положение стоп:",
        focus: "Акцент:",

        // История
        historyTitle: "📊 История тренировок",
        clear: "Очистить",
        noHistory: "История пуста",

        // Суперсет модал
        supersetModalTitle: "Выбери партнера для суперсета",
        supersetModalSubtitle: "Упражнения с разными группами мышц - лучший выбор!",
        supersetBreak: "Разорвать суперсет",
        supersetGood: "Отлично! Разные группы мышц",
        supersetOk: "Можно, одна группа мышц",
        supersetBad: "Не рекомендую - оба тяжелые",
        cancel: "Отмена",

        // Order score
        orderScore: "Оптимальность порядка:",
        perfect: "Идеально!",
        good: "Хорошо",
        ok: "Норм",
        needsWork: "Можно лучше",
        poor: "Неоптимально",
        dragHint: "Перетащи упражнения для изменения порядка",
        orderWarning: "⚠️ Порядок не оптимален"
    },
    en: {
        // Main screen
        mainTitle: "💪 My Workouts",
        start: "Start",
        history: "History",
        stats: "Statistics",
        advice: "Advice",

        // Workout
        back: "← Back",
        finish: "✓ Finish",
        totalTime: "Total time:",
        weight: "Weight:",
        target: "Target:",
        warmup: "+Warm-up",
        warmupLabel: "🔥 Warm-up",
        set: "Set",
        reps: "reps",
        cardio: "Cardio",
        minutes: "minutes",
        start: "▶ Start",

        // Buttons
        changeWeight: "⚙️ Weight",
        superset: "➕ Superset",
        alternative: "🔄 Busy?",
        optional: "OPTIONAL",

        // Timers
        rest: "⏱️ Rest",
        cardioTitle: "🏃 Cardio",
        supersetRest: "⚡ SUPERSET - Fast!",
        ready: "Ready!",
        addTime: "+15 sec",

        // Accents
        technique: "Technique:",
        footPosition: "Foot position:",
        focus: "Focus:",

        // History
        historyTitle: "📊 Workout History",
        clear: "Clear",
        noHistory: "No history",

        // Superset modal
        supersetModalTitle: "Choose superset partner",
        supersetModalSubtitle: "Different muscle groups - best choice!",
        supersetBreak: "Break superset",
        supersetGood: "Great! Different muscle groups",
        supersetOk: "OK, same muscle group",
        supersetBad: "Not recommended - both heavy",
        cancel: "Cancel",

        // Order score
        orderScore: "Order optimality:",
        perfect: "Perfect!",
        good: "Good",
        ok: "OK",
        needsWork: "Could be better",
        poor: "Not optimal",
        dragHint: "Drag exercises to reorder",
        orderWarning: "⚠️ Order is not optimal"
    }
};

// Функция получения перевода
function t(key) {
    return translations[currentLanguage][key] || translations['ru'][key] || key;
}

// Словарь для автоматического перевода названий упражнений
const exerciseTranslations = {
    "Ягодичный мостик": "Glute Bridge",
    "Поднятие на носки": "Calf Raises",
    "Подъем на носки": "Calf Raises",
    "Разгибание ног": "Leg Extension",
    "Сгибание ног": "Leg Curl",
    "Болгарский выпад": "Bulgarian Split Squat",
    "Гиперэкстензия": "Hyperextension",
    "Бицепс": "Bicep",
    "Трицепс": "Triceps",
    "Планка": "Plank",
    "Скручивания": "Crunches",
    "Подъем ног": "Leg Raises",
    "Разведение": "Flyes",
    "Сведение": "Flyes",
    "Тяга": "Row",
    "Жим": "Press",
    "Румынская тяга": "Romanian Deadlift",
    "Отведение": "Abduction",
    "Разминка - Кардио": "Warm-up - Cardio"
};

// Функция для автоматического перевода названия упражнения
function getExerciseName(exercise) {
    if (currentLanguage === 'ru') {
        return exercise.name;
    }

    // Если есть явный перевод - используем его
    if (exercise.nameEn) {
        return exercise.nameEn;
    }

    // Иначе пытаемся найти в словаре
    let translated = exercise.name;
    for (const [ru, en] of Object.entries(exerciseTranslations)) {
        if (exercise.name.includes(ru)) {
            translated = translated.replace(ru, en);
        }
    }

    return translated;
}

// Функция оценки оптимальности порядка упражнений
function calculateOrderScore(exercises, order) {
    if (!order || order.length === 0) {
        // Если порядок не задан, используем исходный
        order = exercises.map((_, i) => i);
    }

    let score = 100;
    const orderedExercises = order.map(i => exercises[i]);

    // Критерий 1: Кардио должно быть первым (если есть)
    const cardioIndex = orderedExercises.findIndex(ex => ex.type === 'cardio');
    if (cardioIndex > 0) {
        score -= 15; // Кардио не первое
    }

    // Критерий 2: Compound (базовые) перед isolation (изолирующими)
    for (let i = 0; i < orderedExercises.length - 1; i++) {
        const current = orderedExercises[i];
        const next = orderedExercises[i + 1];

        // Пропускаем кардио и опциональные
        if (current.type === 'cardio' || current.optional) continue;
        if (next.type === 'cardio' || next.optional) continue;

        // Если isolation перед compound - штраф
        if (current.type === 'isolation' && next.type === 'compound') {
            score -= 10;
        }
    }

    // Критерий 3: Чередование групп мышц
    for (let i = 0; i < orderedExercises.length - 1; i++) {
        const current = orderedExercises[i];
        const next = orderedExercises[i + 1];

        if (current.type === 'cardio' || next.type === 'cardio') continue;
        if (current.optional || next.optional) continue;

        const currentGroup = getExerciseMuscleGroup(current);
        const nextGroup = getExerciseMuscleGroup(next);

        // Если две подряд на одну группу мышц
        if (currentGroup === nextGroup) {
            // Если обе compound/legs - больший штраф
            if ((current.type === 'compound' || current.type === 'legs') &&
                (next.type === 'compound' || next.type === 'legs')) {
                score -= 8;
            } else {
                score -= 4;
            }
        }
    }

    // Критерий 4: Опциональные упражнения в конце
    const firstOptionalIndex = orderedExercises.findIndex(ex => ex.optional);
    if (firstOptionalIndex !== -1) {
        for (let i = firstOptionalIndex + 1; i < orderedExercises.length; i++) {
            if (!orderedExercises[i].optional && orderedExercises[i].type !== 'cardio') {
                score -= 5; // Обычное упражнение после опционального
            }
        }
    }

    return Math.max(0, Math.min(100, score));
}

// Функция получения текстовой оценки
function getScoreText(score) {
    if (score >= 90) return t('perfect');
    if (score >= 75) return t('good');
    if (score >= 60) return t('ok');
    if (score >= 40) return t('needsWork');
    return t('poor');
}

// Функция получения звезд по оценке
function getScoreStars(score) {
    if (score >= 90) return '⭐⭐⭐⭐⭐';
    if (score >= 75) return '⭐⭐⭐⭐';
    if (score >= 60) return '⭐⭐⭐';
    if (score >= 40) return '⭐⭐';
    return '⭐';
}

// Данные тренировок
const workouts = {
    1: {
        name: "Тренировка 1: Спина и Грудь",
        nameEn: "Workout 1: Back and Chest",
        title: "Спина и Грудь",
        titleEn: "Back and Chest",
        description: "Акцент на верх тела",
        descriptionEn: "Upper body focus",
        duration: "60-90 мин",
        durationEn: "60-90 min",
        hasWarmup: true,
        exercises: [
            {
                name: "🏃 Разминка - Кардио (8 минут)",
                nameEn: "🏃 Warm-up - Cardio (8 minutes)",
                type: "cardio",
                duration: 480, // 8 минут в секундах
                sets: 1,
                note: "Эллипсоид / Степпер / Велосипед",
                noteEn: "Elliptical / Stepper / Bike"
            },
            {
                name: "Подтягивания в гравитроне",
                nameEn: "Assisted Pull-ups (Gravitron)",
                currentWeight: -35,
                targetReps: [8, 10],
                sets: 4,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                warmupSets: 1,
                warmupWeight: -20,
                warmupReps: 15,
                technique: "Лопатки вниз и назад, грудь вперед",
                techniqueEn: "Shoulder blades down and back, chest forward",
                focus: "Тянуть локтями, не руками. Подбородок выше перекладины",
                focusEn: "Pull with elbows, not arms. Chin above bar"
            },
            {
                name: "Тяга в универсальном тренажере",
                nameEn: "Universal Row Machine",
                currentWeight: 20,
                targetReps: [8, 10],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                technique: "Тянуть к поясу, лопатки назад",
                techniqueEn: "Pull to waist, shoulder blades back",
                focus: "Широчайшие мышцы спины",
                focusEn: "Latissimus dorsi muscles",
                alternatives: [
                    {
                        name: "Наклонный жим в универсальном тренажере",
                        nameEn: "Universal Incline Press Machine",
                        type: "compound",
                        weightMultiplier: 0.75,
                        technique: "Локти под углом 45°, полная амплитуда",
                        techniqueEn: "Elbows at 45°, full range of motion",
                        focus: "Верхняя часть груди",
                        focusEn: "Upper chest"
                    },
                    {
                        name: "Тяга штанги в наклоне",
                        nameEn: "Barbell Bent-Over Row",
                        type: "compound",
                        weightMultiplier: 1.2,
                        technique: "Наклон корпуса 45°, тянуть к низу живота",
                        techniqueEn: "45° torso bend, pull to lower abdomen",
                        focus: "Толщина спины",
                        focusEn: "Back thickness"
                    },
                    {
                        name: "Тяга горизонтального блока",
                        nameEn: "Seated Cable Row",
                        type: "compound",
                        weightMultiplier: 1.0,
                        technique: "Тянуть к животу, спина прямая",
                        techniqueEn: "Pull to abdomen, straight back",
                        focus: "Середина спины",
                        focusEn: "Mid-back"
                    }
                ]
            },
            {
                name: "Тяга вертикального блока",
                nameEn: "Lat Pulldown Machine",
                currentWeight: 35,
                targetReps: [8, 10],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                technique: "Широкий хват, тянуть к верху груди",
                techniqueEn: "Wide grip, pull to upper chest",
                focus: "Лопатки назад и вниз, грудь вперед",
                focusEn: "Shoulder blades back and down, chest forward",
                alternatives: [
                    {
                        name: "Тяга горизонтального блока",
                        nameEn: "Seated Cable Row",
                        type: "compound",
                        weightMultiplier: 1.0,
                        technique: "Тянуть к животу, спина прямая",
                        techniqueEn: "Pull to abdomen, straight back",
                        focus: "Середина спины",
                        focusEn: "Mid-back"
                    },
                    {
                        name: "Тяга в рычажном тренажере",
                        nameEn: "Hammer Row Machine",
                        type: "compound",
                        weightMultiplier: 1.1,
                        technique: "Грудь к подушке, тянуть локтями",
                        techniqueEn: "Chest to pad, pull with elbows",
                        focus: "Толщина спины",
                        focusEn: "Back thickness"
                    }
                ]
            },
            {
                name: "Жим в тренажере на грудь",
                nameEn: "Chest Press Machine",
                currentWeight: 32.5,
                targetReps: [8, 10],
                sets: 4,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                technique: "Лопатки прижаты к спинке, ноги на полу",
                techniqueEn: "Shoulder blades pressed to backrest, feet on floor",
                focus: "Локти под углом 45°, полная амплитуда",
                focusEn: "Elbows at 45°, full range of motion",
                alternatives: [
                    {
                        name: "Жим гантелей лежа",
                        nameEn: "Dumbbell Bench Press",
                        type: "compound",
                        weightMultiplier: 0.4,
                        technique: "Лопатки сведены, ноги на полу",
                        techniqueEn: "Shoulder blades together, feet on floor",
                        focus: "Больше растяжка, стабилизация",
                        focusEn: "More stretch, stabilization"
                    },
                    {
                        name: "Жим штанги лежа",
                        nameEn: "Barbell Bench Press",
                        type: "compound",
                        weightMultiplier: 1.5,
                        technique: "Штанга к низу груди, мост",
                        techniqueEn: "Bar to lower chest, arch",
                        focus: "База для груди",
                        focusEn: "Chest foundation"
                    }
                ]
            },
            {
                name: "Сгибание ног в тренажере",
                nameEn: "Leg Curl Machine",
                currentWeight: 45,
                targetReps: [8, 10],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                technique: "Таз прижат к сидению, не отрывать",
                techniqueEn: "Pelvis pressed to seat, don't lift",
                focus: "Полная амплитуда, задняя поверхность бедра",
                focusEn: "Full range of motion, hamstrings"
            },
            {
                name: "Сведение-разведение бедер в блоке",
                nameEn: "Hip Adduction/Abduction Machine",
                currentWeight: 55,
                targetReps: [12, 12],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                technique: "Спина прямая, таз на сидении",
                techniqueEn: "Back straight, pelvis on seat",
                focus: "Контролируемое движение, пауза в сведении",
                focusEn: "Controlled movement, pause at contraction"
            },
            {
                name: "ОПЦИОНАЛЬНО (КОР): Планка",
                nameEn: "OPTIONAL (CORE): Plank",
                currentWeight: 0,
                targetReps: [45, 60],
                sets: 3,
                optional: true,
                type: "bodyweight",
                isTime: true,
                technique: "Локти под плечами, тело прямое",
                techniqueEn: "Elbows under shoulders, body straight",
                focus: "Пресс напряжен, таз не провисает",
                focusEn: "Core engaged, hips don't sag"
            }
        ]
    },
    2: {
        name: "Тренировка 2: Тяжелые Ноги",
        nameEn: "Workout 2: Heavy Legs",
        subtitle: "Акцент на низ",
        subtitleEn: "Lower body focus",
        duration: "55-65 мин",
        durationEn: "55-65 min",
        hasWarmup: true,
        exercises: [
            {
                name: "🏃 Разминка - Кардио (8 минут)",
                nameEn: "🏃 Warm-up - Cardio (8 minutes)",
                type: "cardio",
                duration: 480,
                sets: 1,
                note: "Эллипсоид / Степпер / Велосипед",
                noteEn: "Elliptical / Stepper / Bike"
            },
            {
                name: "Приседания в Смите",
                nameEn: "Smith Machine Squats",
                currentWeight: 50,
                targetReps: [10, 10],
                sets: 4,
                optional: false,
                type: "legs",
                weightStep: 5,
                warmupSets: 1,
                warmupWeight: 25,
                warmupReps: 15,
                technique: "Стопы немного впереди грифа",
                focus: "Акцент на ягодицы, колени не выходят за носки"
            },
            {
                name: "Жим ногами",
                nameEn: "Leg Press",
                currentWeight: 120,
                targetReps: [10, 12],
                sets: 3,
                optional: false,
                type: "legs",
                weightStep: 10,
                footPosition: "Стопы ВЫСОКО и ШИРОКО на платформе",
                focus: "Акцент на ягодицы и бицепс бедра"
            },
            {
                name: "Ягодичный мостик",
                currentWeight: 100,
                targetReps: [10, 10],
                sets: 4,
                optional: false,
                type: "legs",
                weightStep: 5,
                technique: "Пауза 1 секунду вверху, сжимай ягодицы",
                focus: "Максимальное сокращение ягодиц в верхней точке"
            },
            {
                name: "Поднятие на носки в Смите",
                currentWeight: 50,
                targetReps: [12, 12],
                sets: 4,
                optional: false,
                type: "isolation",
                weightStep: 5,
                technique: "Полная амплитуда, растяжка внизу",
                focus: "Икроножные мышцы, медленный темп"
            },
            {
                name: "Разгибание ног в тренажере",
                currentWeight: 40,
                targetReps: [10, 12],
                sets: 4,
                optional: false,
                type: "isolation",
                weightStep: 2.5
            },
            {
                name: "ОПЦИОНАЛЬНО (КОР): Подъем ног в висе или лежа",
                currentWeight: 0,
                targetReps: [15, 20],
                sets: 3,
                optional: true,
                type: "bodyweight"
            }
        ]
    },
    3: {
        name: "Тренировка 3: Плечи, Грудь и Ягодицы",
        nameEn: "Workout 3: Shoulders, Chest and Glutes",
        subtitle: "Доработка + Разминка/Заминка",
        subtitleEn: "Additional work + Warm-up/Cool-down",
        duration: "90-120 мин",
        durationEn: "90-120 min",
        hasWarmup: true,
        exercises: [
            {
                name: "🏃 Разминка - Кардио (8 минут)",
                type: "cardio",
                duration: 480,
                sets: 1,
                note: "Эллипсоид / Степпер / Велосипед"
            },
            {
                name: "Болгарский выпад в Смите",
                currentWeight: 37.5,
                targetReps: [8, 8],
                sets: 4,
                optional: false,
                type: "legs",
                weightStep: 2.5,
                warmupSets: 1,
                warmupWeight: 20,
                warmupReps: 15,
                footPosition: "Задняя нога на скамье, передняя далеко вперед",
                technique: "Колено передней ноги не выходит за носок",
                focus: "Акцент на ягодицу передней ноги, спина прямая"
            },
            {
                name: "Жим штанги в Смите (наклон 30°)",
                currentWeight: 30,
                targetReps: [10, 10],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                technique: "Штангу опускать к верху груди, лопатки сведены",
                focus: "Верх груди, локти под 45°, полная амплитуда"
            },
            {
                name: "Сведения и разведения в Пек-дек",
                currentWeight: 17.5, // Сведение
                currentWeight2: 12.5, // Разведение
                targetReps: [10, 10],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                isDual: true,
                technique: "Сведение - грудь, Разведение - задняя дельта",
                focus: "Контролируемое движение, пауза в точке напряжения"
            },
            {
                name: "Тренажер на дельты",
                currentWeight: 27.5,
                targetReps: [8, 8],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                technique: "Локти немного согнуты, движение через плечи",
                focus: "Средняя дельта, не поднимать плечи вверх"
            },
            {
                name: "Гиперэкстензия",
                currentWeight: 15,
                targetReps: [10, 10],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                technique: "Таз на подушке, спина прямая при подъеме",
                focus: "Ягодицы и поясница, не переразгибаться"
            },
            {
                name: "Сгибание рук в тренажере на бицепс",
                currentWeight: 45,
                targetReps: [8, 8],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                technique: "Локти зафиксированы, плавное движение",
                focus: "Пиковое сокращение вверху, полная растяжка внизу"
            },
            {
                name: "ОПЦИОНАЛЬНО (КОР): Скручивания в кроссовере или на фитболе",
                currentWeight: 0,
                targetReps: [15, 20],
                sets: 3,
                optional: true,
                type: "bodyweight",
                technique: "Скручивать грудную клетку к тазу",
                focus: "Верх пресса, медленный темп"
            }
        ]
    },
    4: {
        name: "Тренировка 4: Верх тела + Жиросжигание",
        nameEn: "Workout 4: Upper Body + Fat Burn",
        subtitle: "Подтянутые руки и плечи",
        subtitleEn: "Toned arms and shoulders",
        duration: "50-60 мин",
        durationEn: "50-60 min",
        hasWarmup: true,
        hasCooldown: true,
        exercises: [
            {
                name: "🏃 Разминка - Кардио (8 минут)",
                type: "cardio",
                duration: 480,
                sets: 1,
                note: "Эллипсоид / Степпер / Велосипед"
            },
            {
                name: "Тяга горизонтального блока",
                currentWeight: 30,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                warmupSets: 1,
                warmupWeight: 15,
                warmupReps: 15,
                technique: "Тянуть к поясу, лопатки назад",
                focus: "Спина работает, не руки. Грудь вперед"
            },
            {
                name: "Жим в тренажере на плечи",
                currentWeight: 20,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                technique: "Спина прижата, жать строго вверх",
                focus: "Средняя дельта, не разводить локти в стороны"
            },
            {
                name: "Разгибание рук на блоке (Трицепс)",
                currentWeight: 15,
                targetReps: [15, 15],
                sets: 4,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                note: "Для подтянутых рук!",
                technique: "Локти прижаты к телу, не двигаются",
                focus: "Разгибать ТОЛЬКО предплечья, полное разгибание"
            },
            {
                name: "Сгибание рук в тренажере (Бицепс)",
                currentWeight: 20,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                technique: "Локти зафиксированы, плавное сгибание",
                focus: "Контролируй опускание, пиковое сокращение"
            },
            {
                name: "Разведение рук в тренажере (обратный хват)",
                currentWeight: 15,
                targetReps: [15, 15],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                note: "Для задней дельты",
                technique: "Грудь к подушке, разводить через плечи",
                focus: "Задняя дельта, сводить лопатки назад"
            },
            {
                name: "Скручивания в кроссовере стоя",
                currentWeight: 20,
                targetReps: [15, 20],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                note: "Для живота",
                technique: "Скручивать корпус, тянуть пресс к тазу",
                focus: "Пресс напряжен, не тянуть руками"
            },
            {
                name: "КАРДИО: Эллипсоид интервалы",
                currentWeight: 0,
                targetReps: [5, 5],
                sets: 1,
                optional: false,
                type: "cardio",
                isTime: true,
                note: "5 мин: 30 сек быстро / 30 сек медленно"
            }
        ]
    },
    5: {
        name: "Тренировка 5: Ноги и Ягодицы (Тонус)",
        nameEn: "Workout 5: Legs and Glutes (Toning)",
        subtitle: "Подтянутые ноги без перекачки",
        subtitleEn: "Toned legs without bulk",
        duration: "55-65 мин",
        durationEn: "55-65 min",
        hasWarmup: true,
        hasCooldown: true,
        exercises: [
            {
                name: "🏃 Разминка - Кардио (8 минут)",
                type: "cardio",
                duration: 480,
                sets: 1,
                note: "Эллипсоид / Степпер / Велосипед"
            },
            {
                name: "Ягодичный мостик в тренажере",
                currentWeight: 80,
                targetReps: [15, 15],
                sets: 4,
                optional: false,
                type: "legs",
                weightStep: 5,
                warmupSets: 1,
                warmupWeight: 40,
                warmupReps: 15,
                technique: "Пауза 1-2 секунды вверху, сжимай ягодицы",
                focus: "Максимальное сокращение ягодиц, медленный темп",
                note: "Легче чем в тренировке 2, больше повторений"
            },
            {
                name: "Отведение ноги в тренажере",
                currentWeight: 40,
                targetReps: [15, 20],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 5,
                technique: "МЕДЛЕННО! 2 сек вверх, 2 сек вниз",
                focus: "Средняя ягодичная мышца (округлость сбоку)",
                note: "Для ягодиц"
            },
            {
                name: "Сведение ног в тренажере",
                currentWeight: 45,
                targetReps: [15, 20],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 5,
                note: "Внутренняя часть бедра"
            },
            {
                name: "Разгибание ног в тренажере",
                currentWeight: 30,
                targetReps: [15, 15],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5
            },
            {
                name: "Сгибание ног в тренажере",
                currentWeight: 30,
                targetReps: [15, 15],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5
            },
            {
                name: "Жим одной ногой в тренажере",
                currentWeight: 40,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "legs",
                weightStep: 5,
                note: "Каждой ногой отдельно"
            },
            {
                name: "КАРДИО: Степпер интервалы",
                currentWeight: 0,
                targetReps: [5, 5],
                sets: 1,
                optional: false,
                type: "cardio",
                isTime: true,
                note: "5 мин: 30 сек быстро / 30 сек медленно"
            }
        ]
    },
    6: {
        name: "Тренировка 6: Круговая (Все тело)",
        nameEn: "Workout 6: Circuit (Full Body)",
        subtitle: "Жиросжигание + общий тонус",
        subtitleEn: "Fat burn + overall tone",
        duration: "45-55 мин",
        durationEn: "45-55 min",
        hasWarmup: true,
        hasCooldown: true,
        isCircuit: true,
        exercises: [
            {
                name: "🏃 Разминка - Кардио (8 минут)",
                type: "cardio",
                duration: 480,
                sets: 1,
                note: "Эллипсоид / Степпер / Велосипед"
            },
            {
                name: "КРУГ 1-3: Жим в тренажере на грудь",
                currentWeight: 20,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                warmupSets: 1,
                warmupWeight: 10,
                warmupReps: 15,
                note: "3 круга, минимум отдыха",
                technique: "Лопатки прижаты, полная амплитуда",
                focus: "Грудь, локти 45°, быстрый темп"
            },
            {
                name: "КРУГ 1-3: Тяга вертикального блока",
                currentWeight: 25,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                technique: "Тянуть к груди, лопатки назад",
                focus: "Спина, быстрый темп для жиросжигания"
            },
            {
                name: "КРУГ 1-3: Жим ногами",
                currentWeight: 60,
                targetReps: [15, 15],
                sets: 3,
                optional: false,
                type: "legs",
                weightStep: 10,
                footPosition: "Стопы по середине платформы, на ширине плеч",
                technique: "Колени не выходят за носки",
                focus: "Ноги и ягодицы, полная амплитуда"
            },
            {
                name: "КРУГ 1-3: Жим на плечи",
                currentWeight: 15,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                technique: "Жать строго вверх, спина прижата",
                focus: "Плечи, без раскачки"
            },
            {
                name: "КРУГ 1-3: Скручивания на блоке",
                currentWeight: 15,
                targetReps: [20, 20],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                note: "Для живота",
                technique: "Скручивать корпус, пресс к тазу",
                focus: "Быстрый темп, 20 повторений"
            },
            {
                name: "Велосипед / Эллипсоид",
                currentWeight: 0,
                targetReps: [10, 10],
                sets: 1,
                optional: false,
                type: "cardio",
                isTime: true,
                note: "10 мин средний темп в конце"
            }
        ]
    },
    7: {
        name: "Тренировка 7: Upper/Lower - Верх",
        nameEn: "Workout 7: Upper/Lower - Upper",
        subtitle: "Популярная схема сплита",
        subtitleEn: "Popular split routine",
        duration: "60-70 мин",
        durationEn: "60-70 min",
        hasWarmup: true,
        isPopular: true,
        exercises: [
            {
                name: "🏃 Разминка - Кардио (8 минут)",
                type: "cardio",
                duration: 480,
                sets: 1,
                note: "Эллипсоид / Степпер / Велосипед"
            },
            {
                name: "Жим штанги в Смите (наклон 30°)",
                currentWeight: 30,
                targetReps: [8, 12],
                sets: 4,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                warmupSets: 1,
                warmupWeight: 15,
                warmupReps: 15,
                note: "Верх груди",
                technique: "Штанга к верху груди, лопатки сведены",
                focus: "Верхняя часть груди, полная амплитуда"
            },
            {
                name: "Тяга вертикального блока (широкий хват)",
                currentWeight: 35,
                targetReps: [10, 12],
                sets: 4,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                note: "Спина - ширина",
                technique: "Широкий хват, тянуть к груди",
                focus: "Ширина спины, лопатки назад и вниз"
            },
            {
                name: "Жим гантелей на плечи в тренажере",
                currentWeight: 20,
                targetReps: [10, 12],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                technique: "Жать строго вверх, спина прямая",
                focus: "Средняя дельта, контролируемое движение"
            },
            {
                name: "Тяга горизонтального блока",
                currentWeight: 30,
                targetReps: [10, 12],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                note: "Спина - толщина",
                technique: "Тянуть к поясу, лопатки назад",
                focus: "Толщина спины, грудь вперед"
            },
            {
                name: "Разгибание рук на блоке (канат)",
                currentWeight: 15,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                note: "Трицепс",
                technique: "Локти прижаты, разводить канат в стороны внизу",
                focus: "Трицепс, полное разгибание"
            },
            {
                name: "Сгибание рук со штангой EZ в тренажере",
                currentWeight: 20,
                targetReps: [10, 12],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                note: "Бицепс",
                technique: "Локти зафиксированы, плавное сгибание",
                focus: "Бицепс, пиковое сокращение вверху"
            },
            {
                name: "Разведение рук в тренажере (обратное)",
                currentWeight: 15,
                targetReps: [15, 15],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                note: "Задняя дельта",
                technique: "Грудь к подушке, разводить через плечи",
                focus: "Задняя дельта, сводить лопатки"
            }
        ]
    },
    8: {
        name: "Тренировка 8: Upper/Lower - Низ",
        nameEn: "Workout 8: Upper/Lower - Lower",
        subtitle: "Популярная схема сплита",
        subtitleEn: "Popular split routine",
        duration: "60-70 мин",
        durationEn: "60-70 min",
        hasWarmup: true,
        isPopular: true,
        exercises: [
            {
                name: "🏃 Разминка - Кардио (8 минут)",
                type: "cardio",
                duration: 480,
                sets: 1,
                note: "Эллипсоид / Степпер / Велосипед"
            },
            {
                name: "Приседания в Смите (стопы вперед)",
                currentWeight: 45,
                targetReps: [8, 12],
                sets: 4,
                optional: false,
                type: "legs",
                weightStep: 5,
                warmupSets: 1,
                warmupWeight: 22.5,
                warmupReps: 15,
                note: "Акцент на ягодицы",
                footPosition: "Стопы впереди грифа, широко",
                technique: "Колени не выходят за носки, спина прямая",
                focus: "Акцент на ягодицы, глубокий присед"
            },
            {
                name: "Румынская тяга в Смите",
                currentWeight: 40,
                targetReps: [10, 12],
                sets: 4,
                optional: false,
                type: "legs",
                weightStep: 5,
                note: "Задняя поверхность бедра",
                footPosition: "Стопы под грифом, узко",
                technique: "Ноги почти прямые, штанга вдоль ног",
                focus: "Задняя поверхность бедра, ягодицы"
            },
            {
                name: "Жим ногами (стопы высоко и широко)",
                currentWeight: 100,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "legs",
                weightStep: 10,
                note: "Акцент на ягодицы",
                footPosition: "Стопы ВЫСОКО и ШИРОКО на платформе",
                technique: "Колени не выходят за носки, полная амплитуда",
                focus: "Ягодицы и задняя поверхность бедра"
            },
            {
                name: "Болгарский выпад в Смите",
                currentWeight: 35,
                targetReps: [10, 12],
                sets: 3,
                optional: false,
                type: "legs",
                weightStep: 2.5,
                note: "Каждой ногой",
                footPosition: "Задняя нога на скамье, передняя далеко",
                technique: "Колено передней не выходит за носок",
                focus: "Ягодица передней ноги, спина прямая"
            },
            {
                name: "Сгибание ног лежа",
                currentWeight: 35,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                technique: "Таз прижат, сгибать до касания ягодиц",
                focus: "Задняя поверхность бедра, полная амплитуда"
            },
            {
                name: "Разгибание ног в тренажере",
                currentWeight: 35,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                technique: "Спина прижата, разгибать полностью",
                focus: "Передняя поверхность бедра (квадрицепс)"
            },
            {
                name: "Поднятие на носки в тренажере",
                currentWeight: 50,
                targetReps: [15, 20],
                sets: 4,
                optional: false,
                type: "isolation",
                weightStep: 5,
                note: "Икры",
                technique: "Полная амплитуда, пауза вверху",
                focus: "Икроножные мышцы, растяжка внизу"
            }
        ]
    },
    9: {
        name: "Тренировка 9: Booty Builder 🍑",
        nameEn: "Workout 9: Booty Builder 🍑",
        subtitle: "Популярная инста-программа",
        subtitleEn: "Popular Instagram program",
        duration: "55-65 мин",
        durationEn: "55-65 min",
        hasWarmup: true,
        isPopular: true,
        exercises: [
            {
                name: "🏃 Разминка - Кардио (8 минут)",
                type: "cardio",
                duration: 480,
                sets: 1,
                note: "Эллипсоид / Степпер / Велосипед"
            },
            {
                name: "Ягодичный мостик (пауза вверху 2 сек)",
                currentWeight: 90,
                targetReps: [12, 15],
                sets: 4,
                optional: false,
                type: "legs",
                weightStep: 5,
                warmupSets: 1,
                warmupWeight: 45,
                warmupReps: 15,
                note: "ГЛАВНОЕ упражнение! Сжимай ягодицы вверху",
                technique: "ПАУЗА 2 СЕКУНДЫ вверху, сжимай ягодицы",
                focus: "Максимальное сокращение ягодиц, медленный темп"
            },
            {
                name: "Отведение ноги в кроссовере (стоя)",
                currentWeight: 10,
                targetReps: [15, 20],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                note: "Каждой ногой, медленно",
                technique: "Корпус немного наклонен, отводить прямой ногой",
                focus: "Ягодица работающей ноги, МЕДЛЕННО 2 сек вверх и вниз"
            },
            {
                name: "Жим одной ногой в тренажере",
                currentWeight: 50,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "legs",
                weightStep: 5,
                note: "Каждой ногой, пятка в платформе",
                footPosition: "Стопа ВЫСОКО на платформе, пятка в центре",
                technique: "Толкать пяткой, колено не выходит за носок",
                focus: "Ягодица и задняя поверхность бедра"
            },
            {
                name: "Отведение ноги в тренажере",
                currentWeight: 50,
                targetReps: [15, 20],
                sets: 4,
                optional: false,
                type: "isolation",
                weightStep: 5,
                note: "Медленно, чувствуй ягодицы",
                technique: "Разводить ноги максимально, пауза",
                focus: "Средняя и малая ягодичная, МЕДЛЕННО"
            },
            {
                name: "Сгибание ног в тренажере (с паузой)",
                currentWeight: 35,
                targetReps: [12, 15],
                sets: 3,
                optional: false,
                type: "isolation",
                weightStep: 2.5,
                note: "Пауза 1 сек вверху",
                technique: "Сгибать до ягодиц, ПАУЗА 1 секунда",
                focus: "Задняя поверхность бедра, связь с ягодицами"
            },
            {
                name: "Гиперэкстензия (акцент на ягодицы)",
                currentWeight: 10,
                targetReps: [15, 20],
                sets: 3,
                optional: false,
                type: "compound",
                weightStep: 2.5,
                note: "Округляй спину, работают ягодицы",
                technique: "Спину ОКРУГЛЯТЬ, не прямую",
                focus: "Ягодицы, не поясница! Округляй спину"
            },
            {
                name: "Ходьба на степпере",
                currentWeight: 0,
                targetReps: [10, 10],
                sets: 1,
                optional: false,
                type: "cardio",
                isTime: true,
                note: "10 мин финиш - добить ягодицы"
            }
        ]
    }
};

// Глобальные переменные
let currentWorkout = null;
let mainTimerInterval = null;
let mainTimerSeconds = 0;
let cardioTimerInterval = null;
let cardioSeconds = 8 * 60;
let restTimerInterval = null;
let restSeconds = 60;
let workoutStartTime = null;
let completedSets = {};
let repsData = {}; // Хранит количество повторений для каждого подхода
let weightsData = {}; // Хранит актуальные веса упражнений
let supersets = {}; // Хранит созданные суперсеты: {exerciseIndex: partnerIndex}

// Загрузка сохраненных весов
function loadWeights() {
    const saved = localStorage.getItem('exerciseWeights');
    if (saved) {
        weightsData = JSON.parse(saved);
    }
}

// Загрузка альтернатив из localStorage
function loadAlternatives() {
    const saved = localStorage.getItem('alternatives');
    if (saved) {
        selectedAlternatives = JSON.parse(saved);
    }
}

// Сохранение весов
function saveWeights() {
    localStorage.setItem('exerciseWeights', JSON.stringify(weightsData));
}

// Получить текущий вес упражнения
function getExerciseWeight(workoutId, exerciseIndex) {
    const key = `${workoutId}-${exerciseIndex}`;
    if (weightsData[key]) {
        return weightsData[key];
    }
    const exercise = workouts[workoutId].exercises[exerciseIndex];
    return {
        weight: exercise.currentWeight,
        weight2: exercise.currentWeight2 || null
    };
}

// Обновить вес упражнения
function updateExerciseWeight(workoutId, exerciseIndex, newWeight, newWeight2 = null) {
    const key = `${workoutId}-${exerciseIndex}`;
    weightsData[key] = {
        weight: newWeight,
        weight2: newWeight2,
        lastUpdated: new Date().toISOString()
    };
    saveWeights();
}

// Проверить, пора ли увеличивать вес
function shouldIncreaseWeight(exerciseIndex) {
    const exercise = workouts[currentWorkout]?.exercises[exerciseIndex];
    if (!exercise || !exercise.targetReps || exercise.type === 'cardio' || !exercise.sets) return false;
    const targetMax = exercise.targetReps[1];

    // Проверяем все подходы упражнения
    let allSetsComplete = true;
    let allSetsMaxReps = true;

    for (let i = 0; i < exercise.sets; i++) {
        const setKey = `${exerciseIndex}-${i}`;
        const repsKey = `${exerciseIndex}-${i}-reps`;

        if (!completedSets[setKey]) {
            allSetsComplete = false;
            break;
        }

        const reps = parseInt(repsData[repsKey]) || 0;
        if (reps < targetMax) {
            allSetsMaxReps = false;
        }
    }

    return allSetsComplete && allSetsMaxReps;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadWeights();
    loadAlternatives();
    initializeApp();
});

function initializeApp() {
    // Кнопки навигации
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const workoutId = parseInt(e.target.dataset.workout);
            startWorkout(workoutId);
        });
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        if (confirm('Вы уверены? Прогресс тренировки будет потерян.')) {
            endWorkout(false);
        }
    });

    document.getElementById('finishBtn').addEventListener('click', () => {
        finishWorkout();
    });

    // Клик на заголовок - возврат на главную
    document.getElementById('mainTitle').addEventListener('click', () => {
        showScreen('mainScreen');
    });

    document.getElementById('historyBtn').addEventListener('click', () => {
        showScreen('historyScreen');
        loadHistory();
    });

    document.getElementById('adviceBtn').addEventListener('click', () => {
        showScreen('adviceScreen');
    });

    document.getElementById('statsBtn').addEventListener('click', () => {
        showScreen('statsScreen');
        loadStats();
    });

    document.querySelectorAll('.back-to-main').forEach(btn => {
        btn.addEventListener('click', () => showScreen('mainScreen'));
    });

    // Кардио таймер убран - теперь это обычное упражнение

    // Таймер отдыха
    document.getElementById('restAddBtn').addEventListener('click', () => {
        restSeconds += 15;
        updateRestTimer();
    });

    document.getElementById('restStopBtn').addEventListener('click', stopRestTimer);

    // Калькулятор
    document.getElementById('calculateBtn').addEventListener('click', calculateCalories);

    // Очистка истории
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Удалить всю историю тренировок?')) {
            localStorage.removeItem('workoutHistory');
            loadHistory();
        }
    });
}

// Управление экранами
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Начало тренировки
function startWorkout(workoutId) {
    if (currentWorkout) {
        if (Number(currentWorkout) === Number(workoutId)) {
            showScreen('workoutScreen');
            return;
        }
        const message = currentLanguage === 'ru'
            ? 'Начать другую тренировку? Текущий незавершённый прогресс будет потерян.'
            : 'Start a different workout? Unsaved progress will be lost.';
        if (!confirm(message)) return;
        endWorkout(false);
    }
    currentWorkout = workoutId;
    completedSets = {};
    repsData = {};
    supersets = {}; // Сброс суперсетов
    mainTimerSeconds = 0;
    workoutStartTime = new Date();

    const workout = workouts[workoutId];

    // Показываем экран тренировки
    showScreen('workoutScreen');

    // Показываем кардио разминку (8 минут для всех тренировок)
    // Рендерим упражнения
    renderExercises(workout);

    // Запускаем основной таймер
    startMainTimer();
}

// Восстановление состояния тренировки (после перерисовки)
function restoreWorkoutState() {
    Object.keys(completedSets).forEach(key => {
        if (completedSets[key]) {
            const [exerciseIndex, setIndex] = key.split('-');
            const checkbox = document.getElementById(`set-${exerciseIndex}-${setIndex}`);
            if (checkbox) {
                checkbox.checked = true;
                const setItem = checkbox.closest('.set-item');
                if (setItem) setItem.classList.add('completed');
            }
        }
    });

    Object.keys(repsData).forEach(key => {
        const reps = repsData[key];
        // Находим display для повторений
        const [exerciseIndex, setIndex] = key.replace('-reps', '').split('-');
        const setItem = document.querySelector(`[data-exercise="${exerciseIndex}"][data-set="${setIndex}"]`);
        if (setItem) {
            const repsDisplay = setItem.querySelector('.reps-display');
            if (repsDisplay) {
                repsDisplay.textContent = reps;
                repsDisplay.dataset.reps = reps;
            }
        }
    });

    // Проверяем индикаторы прогресса
    const workout = workouts[currentWorkout];
    workout.exercises.forEach((_, exerciseIndex) => {
        checkProgressIndicator(exerciseIndex);
    });
}

// Создание одного подхода
function createSetItem(exerciseIndex, setIndex, exercise, isWarmup = false) {
    const setItem = document.createElement('div');
    setItem.className = 'set-item' + (isWarmup ? ' warmup-set' : '');
    setItem.dataset.exercise = exerciseIndex;
    setItem.dataset.set = setIndex;

    const checkboxRow = document.createElement('div');
    checkboxRow.className = 'set-checkbox-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'set-checkbox';
    checkbox.id = `set-${exerciseIndex}-${setIndex}`;

    const label = document.createElement('label');
    label.className = 'set-label';
    label.htmlFor = `set-${exerciseIndex}-${setIndex}`;

    const weightUnit = currentLanguage === 'ru' ? 'кг' : 'kg';

    if (isWarmup) {
        label.innerHTML = `🔥 ${t('warmupLabel')} <span style="font-size: 0.85em; color: var(--secondary);">${exercise.warmupWeight} ${weightUnit} × ${exercise.warmupReps}</span>`;
    } else if (exercise.type === 'cardio') {
        const minutes = Math.floor(exercise.duration / 60);
        label.innerHTML = `${t('cardio')} ${minutes} ${t('minutes')}`;
    } else {
        label.textContent = `${t('set')} ${setIndex + 1}`;
    }

    checkboxRow.appendChild(checkbox);
    checkboxRow.appendChild(label);

    // Для кардио - кнопка таймера вместо счетчика повторений
    if (exercise.type === 'cardio') {
        const timerButton = document.createElement('button');
        timerButton.className = 'btn btn-primary';
        timerButton.textContent = t('start');
        timerButton.style.marginTop = '8px';
        timerButton.style.width = '100%';
        timerButton.onclick = () => startCardioTimer(exercise.duration);

        setItem.appendChild(checkboxRow);
        setItem.appendChild(timerButton);

        // Обработчик чекбокса для кардио
        checkbox.addEventListener('change', (e) => {
            const isCompleted = e.target.checked;
            if (isCompleted) {
                setItem.classList.add('completed');
            } else {
                setItem.classList.remove('completed');
            }
            const key = `${exerciseIndex}-${setIndex}`;
            completedSets[key] = isCompleted;
        });

        return setItem;
    }

    // Контейнер для счетчика повторений (для обычных упражнений)
    const repsCounter = document.createElement('div');
    repsCounter.className = 'reps-counter';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'reps-btn minus';
    minusBtn.textContent = '−';
    minusBtn.type = 'button';

    const repsDisplay = document.createElement('div');
    repsDisplay.className = 'reps-display';
    const repsKey = `${exerciseIndex}-${setIndex}-reps`;

    // Значение по умолчанию - середина диапазона или сохраненное
    const defaultReps = repsData[repsKey] || Math.floor((exercise.targetReps[0] + exercise.targetReps[1]) / 2);
    repsData[repsKey] = defaultReps;
    repsDisplay.textContent = defaultReps;
    repsDisplay.dataset.reps = defaultReps;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'reps-btn plus';
    plusBtn.textContent = '+';
    plusBtn.type = 'button';

    const repsLabel = document.createElement('span');
    repsLabel.className = 'reps-label';
    const repsUnit = currentLanguage === 'ru' ? (exercise.isTime ? 'сек' : 'раз') : (exercise.isTime ? 'sec' : 'reps');
    repsLabel.textContent = repsUnit;

    repsCounter.appendChild(minusBtn);
    repsCounter.appendChild(repsDisplay);
    repsCounter.appendChild(plusBtn);
    repsCounter.appendChild(repsLabel);

    setItem.appendChild(checkboxRow);
    setItem.appendChild(repsCounter);

    // Обработчик клика на чекбокс
    checkbox.addEventListener('change', (e) => {
        const currentReps = parseInt(repsDisplay.dataset.reps);
        handleSetComplete(exerciseIndex, setIndex, e.target.checked, currentReps);
    });

    // Обработчик кнопки минус
    minusBtn.addEventListener('click', () => {
        let currentReps = parseInt(repsDisplay.dataset.reps);
        if (currentReps > 0) {
            currentReps--;
            repsDisplay.textContent = currentReps;
            repsDisplay.dataset.reps = currentReps;
            repsData[repsKey] = currentReps;
            checkProgressIndicator(exerciseIndex);
        }
    });

    // Обработчик кнопки плюс
    plusBtn.addEventListener('click', () => {
        let currentReps = parseInt(repsDisplay.dataset.reps);
        currentReps++;
        repsDisplay.textContent = currentReps;
        repsDisplay.dataset.reps = currentReps;
        repsData[repsKey] = currentReps;
        checkProgressIndicator(exerciseIndex);
    });

    return setItem;
}

// Переменные для drag & drop
let draggedElement = null;
let draggedIndex = null;

// Обработчики drag & drop
function handleDragStart(e) {
    draggedElement = e.target;
    draggedIndex = parseInt(e.target.dataset.exerciseIndex);
    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (e.target.classList.contains('exercise-card')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('exercise-card')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== e.target && e.target.classList.contains('exercise-card')) {
        const dropIndex = parseInt(e.target.dataset.exerciseIndex);

        // Обновляем порядок упражнений
        if (!exerciseOrder[currentWorkout]) {
            exerciseOrder[currentWorkout] = workouts[currentWorkout].exercises.map((_, i) => i);
        }

        const order = exerciseOrder[currentWorkout];
        const draggedOrderIndex = order.indexOf(draggedIndex);
        const dropOrderIndex = order.indexOf(dropIndex);

        // Меняем местами
        [order[draggedOrderIndex], order[dropOrderIndex]] = [order[dropOrderIndex], order[draggedOrderIndex]];

        // Перерисовываем упражнения
        renderExercises(workouts[currentWorkout]);

        // Восстанавливаем состояние
        restoreWorkoutState();
    }

    e.target.classList.remove('drag-over');
    return false;
}

function handleDragEnd(e) {
    e.target.style.opacity = '';
    document.querySelectorAll('.exercise-card').forEach(card => {
        card.classList.remove('drag-over');
    });
}

// Рендер упражнений
function renderExercises(workout) {
    const container = document.getElementById('exercisesList');
    container.innerHTML = '';

    // Проверка что тренировка существует
    if (!workout || !workout.exercises) {
        console.error('Invalid workout:', workout);
        return;
    }

    // Проверка currentWorkout
    if (!currentWorkout) {
        console.error('currentWorkout is not set');
        return;
    }

    // Получаем или создаем порядок упражнений
    if (!exerciseOrder[currentWorkout]) {
        exerciseOrder[currentWorkout] = workout.exercises.map((_, i) => i);
    }

    const order = exerciseOrder[currentWorkout];

    // Вычисляем оценку порядка
    const score = calculateOrderScore(workout.exercises, order);
    const scoreText = getScoreText(score);
    const scoreStars = getScoreStars(score);

    // Добавляем индикатор оценки (только если порядок не идеален)
    if (score < 100) {
        const scoreIndicator = document.createElement('div');
        scoreIndicator.className = 'order-score-indicator';
        scoreIndicator.innerHTML = `
            <div class="score-content">
                <span class="score-text">💡 ${t('dragHint')}</span>
            </div>
        `;
        container.appendChild(scoreIndicator);
    }

    // Рендерим упражнения в заданном порядке
    order.forEach((exerciseIndex, orderIndex) => {
        const baseExercise = workout.exercises[exerciseIndex];

        // Проверка на существование упражнения
        if (!baseExercise) {
            console.error('Exercise not found:', exerciseIndex);
            return;
        }

        // Получаем активное упражнение (основное или альтернативное)
        const exercise = getActiveExercise(baseExercise, exerciseIndex);

        // Проверяем суперсет
        const isInSuperset = supersets[exerciseIndex] !== undefined;
        const partnerId = supersets[exerciseIndex];
        const isFirstInSuperset = isInSuperset && order.indexOf(partnerId) > orderIndex;
        const isSecondInSuperset = isInSuperset && order.indexOf(partnerId) < orderIndex;

        // Добавляем заголовок суперсета перед первым упражнением
        if (isFirstInSuperset) {
            const supersetHeader = document.createElement('div');
            supersetHeader.className = 'superset-group-header';
            const supersetTitle = currentLanguage === 'ru' ? '⚡ СУПЕРСЕТ' : '⚡ SUPERSET';
            supersetHeader.innerHTML = supersetTitle;
            container.appendChild(supersetHeader);
        }

        const card = document.createElement('div');
        const cardClasses = ['exercise-card'];
        if (exercise.optional) cardClasses.push('optional');
        if (exercise.type === 'cardio') cardClasses.push('cardio');
        if (isInSuperset) cardClasses.push('in-superset');
        if (isSecondInSuperset) cardClasses.push('superset-last');
        card.className = cardClasses.join(' ');
        card.id = `exercise-${exerciseIndex}`;

        // Добавляем drag & drop функционал
        card.draggable = true;
        card.dataset.exerciseIndex = exerciseIndex;

        // Обработчики drag & drop
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);
        card.addEventListener('dragenter', handleDragEnter);
        card.addEventListener('dragleave', handleDragLeave);

        const header = document.createElement('div');
        header.className = 'exercise-header';

        const title = document.createElement('div');
        title.className = 'exercise-title';

        // Для кардио отдельная логика
        let weightDisplay, repsDisplay;

        if (exercise.type === 'cardio') {
            weightDisplay = '—';
            const minutes = Math.floor(exercise.duration / 60);
            repsDisplay = `${minutes} ${t('minutes')}`;
        } else {
            const weights = getExerciseWeight(currentWorkout, exerciseIndex);
            const weightUnit = currentLanguage === 'ru' ? 'кг' : 'kg';
            weightDisplay = exercise.isDual
                ? `${Math.abs(weights.weight)} ${weightUnit} / ${Math.abs(weights.weight2)} ${weightUnit}`
                : exercise.type === 'bodyweight'
                    ? (currentLanguage === 'ru' ? 'Без веса' : 'Bodyweight')
                    : `${Math.abs(weights.weight)} ${weightUnit}`;

            const repsUnit = currentLanguage === 'ru' ? 'раз' : 'reps';
            const secUnit = currentLanguage === 'ru' ? 'сек' : 'sec';
            repsDisplay = exercise.isTime
                ? `${exercise.targetReps[0]}-${exercise.targetReps[1]} ${secUnit}`
                : `${exercise.targetReps[0]}-${exercise.targetReps[1]} ${repsUnit}`;
        }

        const exerciseName = getExerciseName(exercise);
        const note = currentLanguage === 'ru' ? exercise.note : (exercise.noteEn || exercise.note);
        const technique = currentLanguage === 'ru' ? exercise.technique : (exercise.techniqueEn || exercise.technique);
        const footPosition = currentLanguage === 'ru' ? exercise.footPosition : (exercise.footPositionEn || exercise.footPosition);
        const focus = currentLanguage === 'ru' ? exercise.focus : (exercise.focusEn || exercise.focus);

        const noteHtml = note ? `<div class="exercise-note">💡 ${note}</div>` : '';

        // Техника и акценты
        const techniqueHtml = technique ? `<div class="exercise-technique">🎯 <strong>${t('technique')}</strong> ${technique}</div>` : '';
        const footPositionHtml = footPosition ? `<div class="exercise-technique">👣 <strong>${t('footPosition')}</strong> ${footPosition}</div>` : '';
        const focusHtml = focus ? `<div class="exercise-technique">🔥 <strong>${t('focus')}</strong> ${focus}</div>` : '';

        // Суперсет (динамический)
        let supersetHtml = '';
        if (supersets[exerciseIndex] !== undefined) {
            const partnerId = supersets[exerciseIndex];
            const partnerExercise = workout.exercises[partnerId];
            const partnerName = getExerciseName(partnerExercise);
            const supersetText = currentLanguage === 'ru' ? 'СУПЕРСЕТ с:' : 'SUPERSET with:';
            supersetHtml = `<div class="exercise-superset">⚡ ${supersetText} ${partnerName}</div>`;
        }

        title.innerHTML = `
            <h3>${exerciseName}</h3>
            <div class="exercise-details">
                <strong>${t('weight')}</strong> ${weightDisplay} |
                <strong>${t('target')}</strong> ${repsDisplay}
                ${exercise.warmupSets ? ` | <strong style="color: var(--secondary);">🔥 ${t('warmup')}</strong>` : ''}
            </div>
            ${supersetHtml}
            ${footPositionHtml}
            ${techniqueHtml}
            ${focusHtml}
            ${noteHtml}
        `;

        header.appendChild(title);

        const controls = document.createElement('div');
        controls.className = 'exercise-controls';

        if (exercise.optional) {
            const badge = document.createElement('span');
            badge.className = 'optional-badge';
            badge.textContent = t('optional');
            controls.appendChild(badge);
        }

        if (exercise.type !== 'bodyweight' && exercise.type !== 'cardio') {
            const weightBtn = document.createElement('button');
            weightBtn.className = 'btn btn-secondary btn-small';
            weightBtn.textContent = t('changeWeight');
            weightBtn.onclick = () => openWeightModal(exerciseIndex, exercise);
            controls.appendChild(weightBtn);
        }

        // Кнопка суперсета (не для кардио)
        if (exercise.type !== 'cardio') {
            const supersetBtn = document.createElement('button');
            supersetBtn.className = 'btn btn-secondary btn-small superset-btn';
            supersetBtn.id = `superset-btn-${exerciseIndex}`;

            // Проверяем, есть ли уже суперсет
            if (supersets[exerciseIndex] !== undefined) {
                const partnerId = supersets[exerciseIndex];
                const partnerExercise = workout.exercises[partnerId];
                const partnerName = getExerciseName(partnerExercise);
                supersetBtn.innerHTML = '⚡ ' + partnerName.substring(0, 15) + '...';
                supersetBtn.onclick = () => breakSuperset(exerciseIndex);
                supersetBtn.style.background = '#ff9800';
            } else {
                supersetBtn.textContent = t('superset');
                supersetBtn.onclick = () => openSupersetModal(exerciseIndex, exercise);
            }

            controls.appendChild(supersetBtn);
        }

        // Кнопка альтернативы (если есть альтернативы)
        if (baseExercise.alternatives && baseExercise.alternatives.length > 0) {
            const altBtn = document.createElement('button');
            altBtn.className = 'btn btn-secondary btn-small alternative-btn';
            altBtn.id = `alternative-btn-${exerciseIndex}`;

            // Проверяем, выбрана ли альтернатива
            const altKey = `${currentWorkout}-${exerciseIndex}`;
            if (selectedAlternatives[altKey] !== undefined) {
                const altIndex = selectedAlternatives[altKey];
                const altExercise = baseExercise.alternatives[altIndex];
                const altName = currentLanguage === 'ru' ? altExercise.name : (altExercise.nameEn || altExercise.name);
                altBtn.innerHTML = '🔄 ' + altName.substring(0, 12) + '...';
                altBtn.onclick = () => clearAlternative(exerciseIndex);
                altBtn.style.background = '#2196F3';
            } else {
                altBtn.textContent = t('alternative');
                altBtn.onclick = () => openAlternativeModal(exerciseIndex, baseExercise);
            }

            controls.appendChild(altBtn);
        }

        header.appendChild(controls);

        // Индикатор увеличения веса
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        progressIndicator.id = `progress-${exerciseIndex}`;
        progressIndicator.style.display = 'none';

        const setsGrid = document.createElement('div');
        setsGrid.className = 'sets-grid';

        // Добавляем разминочный подход если есть
        if (exercise.warmupSets) {
            const warmupItem = createSetItem(exerciseIndex, -1, exercise, true);
            setsGrid.appendChild(warmupItem);
        }

        // Обычные подходы
        for (let i = 0; i < exercise.sets; i++) {
            const setItem = createSetItem(exerciseIndex, i, exercise, false);
            setsGrid.appendChild(setItem);
        }

        card.appendChild(header);
        card.appendChild(progressIndicator);
        card.appendChild(setsGrid);
        container.appendChild(card);
    });
}

// Обработка завершения подхода
function handleSetComplete(exerciseIndex, setIndex, isCompleted, reps) {
    const key = `${exerciseIndex}-${setIndex}`;
    const repsKey = `${exerciseIndex}-${setIndex}-reps`;

    completedSets[key] = isCompleted;

    if (reps) {
        repsData[repsKey] = reps;
    }

    const setItem = document.querySelector(`[data-exercise="${exerciseIndex}"][data-set="${setIndex}"]`);
    if (isCompleted) {
        setItem.classList.add('completed');
        // Запускаем таймер отдыха (учитываем суперсет)
        const isInSuperset = supersets[exerciseIndex] !== undefined;
        startRestTimer(isInSuperset);
        // Проверяем прогресс
        checkProgressIndicator(exerciseIndex);
    } else {
        setItem.classList.remove('completed');
    }
}

// Проверка индикатора прогресса
function checkProgressIndicator(exerciseIndex) {
    const indicator = document.getElementById(`progress-${exerciseIndex}`);
    if (!indicator) return;

    if (shouldIncreaseWeight(exerciseIndex)) {
        const exercise = workouts[currentWorkout].exercises[exerciseIndex];
        indicator.innerHTML = `
            <div class="progress-alert">
                🎉 Отлично! Пора увеличить вес на +${exercise.weightStep} кг
            </div>
        `;
        indicator.style.display = 'block';
    } else {
        indicator.style.display = 'none';
    }
}

// Модальное окно для изменения веса
function openWeightModal(exerciseIndex, exercise) {
    const weights = getExerciseWeight(currentWorkout, exerciseIndex);
    const currentWeight = weights.weight;
    const currentWeight2 = weights.weight2;

    let promptText = `Текущий вес: ${Math.abs(currentWeight)} кг\n`;
    if (exercise.isDual && currentWeight2 !== null) {
        promptText += `Второй вес: ${Math.abs(currentWeight2)} кг\n`;
    }
    promptText += `Рекомендуемый шаг: +${exercise.weightStep} кг\n\n`;
    promptText += `Введите новый вес (кг):`;

    const newWeightStr = prompt(promptText, Math.abs(currentWeight));
    if (newWeightStr === null) return;

    const newWeight = parseFloat(newWeightStr);
    if (isNaN(newWeight)) {
        alert('Неверный формат веса');
        return;
    }

    let newWeight2 = currentWeight2;
    if (exercise.isDual && currentWeight2 !== null) {
        const newWeight2Str = prompt(`Введите второй вес (кг):`, Math.abs(currentWeight2));
        if (newWeight2Str !== null) {
            newWeight2 = parseFloat(newWeight2Str);
            if (isNaN(newWeight2)) {
                alert('Неверный формат второго веса');
                return;
            }
        }
    }

    // Для гравитрона вес отрицательный
    const finalWeight = exercise.name.includes('гравитрон') ? -Math.abs(newWeight) : newWeight;
    const finalWeight2 = newWeight2 !== null && !exercise.name.includes('гравитрон') ? newWeight2 : newWeight2;

    updateExerciseWeight(currentWorkout, exerciseIndex, finalWeight, finalWeight2);

    // Перерендерим упражнение
    const workout = workouts[currentWorkout];
    renderExercises(workout);
    restoreWorkoutState();
}

// Основной таймер
function startMainTimer() {
    if (mainTimerInterval) clearInterval(mainTimerInterval);

    mainTimerInterval = setInterval(() => {
        mainTimerSeconds++;
        updateMainTimer();
    }, 1000);
}

function updateMainTimer() {
    const hours = Math.floor(mainTimerSeconds / 3600);
    const minutes = Math.floor((mainTimerSeconds % 3600) / 60);
    const seconds = mainTimerSeconds % 60;

    document.getElementById('mainTimer').textContent =
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Кардио таймер
// Кардио таймер в модальном окне
function startCardioTimer(duration) {
    cardioSeconds = duration;
    const modal = document.getElementById('restTimer');
    const timeDisplay = document.getElementById('restTime');
    const titleElement = modal.querySelector('h3');
    const addButton = document.getElementById('restAddBtn');

    titleElement.textContent = '🏃 Кардио';
    addButton.style.display = 'none'; // Скрыть кнопку +15 сек для кардио
    modal.classList.add('active');

    const minutes = Math.floor(cardioSeconds / 60);
    const seconds = cardioSeconds % 60;
    timeDisplay.textContent = `${pad(minutes)}:${pad(seconds)}`;

    if (cardioTimerInterval) {
        clearInterval(cardioTimerInterval);
    }

    cardioTimerInterval = setInterval(() => {
        if (cardioSeconds > 0) {
            cardioSeconds--;
            const mins = Math.floor(cardioSeconds / 60);
            const secs = cardioSeconds % 60;
            timeDisplay.textContent = `${pad(mins)}:${pad(secs)}`;
        } else {
            clearInterval(cardioTimerInterval);
            cardioTimerInterval = null;
            modal.classList.remove('active');
            titleElement.textContent = '⏱️ Отдых';
            addButton.style.display = ''; // Вернуть кнопку
        }
    }, 1000);
}

// Таймер отдыха
function startRestTimer(isInSuperset = false) {
    // Для суперсетов - короткий отдых (20 сек), обычно - 60 сек
    restSeconds = isInSuperset ? 20 : 60;
    updateRestTimer();

    const restTimerEl = document.getElementById('restTimer');
    const addButton = document.getElementById('restAddBtn');

    addButton.style.display = ''; // Показать кнопку +15 сек для отдыха
    restTimerEl.classList.add('active');

    // Показываем что это суперсет
    const restContent = restTimerEl.querySelector('.rest-content h3');
    if (restContent) {
        restContent.textContent = isInSuperset ? '⚡ СУПЕРСЕТ - Быстро!' : '⏱️ Отдых';
    }

    if (restTimerInterval) clearInterval(restTimerInterval);

    restTimerInterval = setInterval(() => {
        if (restSeconds > 0) {
            restSeconds--;
            updateRestTimer();
        } else {
            stopRestTimer();
            // Звуковое уведомление
            playBeep();
        }
    }, 1000);
}

function updateRestTimer() {
    const minutes = Math.floor(restSeconds / 60);
    const seconds = restSeconds % 60;
    document.getElementById('restTime').textContent = `${pad(minutes)}:${pad(seconds)}`;
}

function stopRestTimer() {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
    clearInterval(cardioTimerInterval);
    cardioTimerInterval = null;

    const modal = document.getElementById('restTimer');
    const addButton = document.getElementById('restAddBtn');

    modal.classList.remove('active');
    addButton.style.display = ''; // Вернуть кнопку
    // Вернуть заголовок
    modal.querySelector('h3').textContent = '⏱️ Отдых';
}

function playBeep() {
    // Простой звуковой сигнал
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Завершение тренировки
function finishWorkout() {
    const completedCount = Object.values(completedSets).filter(v => v).length;
    const totalSets = Object.keys(completedSets).length;

    if (completedCount === 0) {
        if (!confirm('Вы не отметили ни одного подхода. Всё равно завершить?')) {
            return;
        }
    }

    // Подсчитываем общий вес
    const workout = workouts[currentWorkout];
    let totalWeight = 0;

    workout.exercises.forEach((exercise, exerciseIndex) => {
        if (exercise.type === 'cardio') return;

        const weights = getExerciseWeight(currentWorkout, exerciseIndex);

        for (let i = 0; i < exercise.sets; i++) {
            const key = `${exerciseIndex}-${i}`;
            if (completedSets[key]) {
                const repsKey = `${exerciseIndex}-${i}-reps`;
                const reps = repsData[repsKey] || exercise.targetReps[0];

                if (exercise.isDual) {
                    totalWeight += Math.abs(weights.weight) * reps;
                    totalWeight += Math.abs(weights.weight2) * reps;
                } else {
                    totalWeight += Math.abs(weights.weight) * reps;
                }
            }
        }
    });

    // Сохраняем в историю
    saveWorkoutToHistory(mainTimerSeconds, completedCount, totalWeight);

    // Stop timers and clear the active session after saving.
    endWorkout(true);

    // Показываем уведомление
    alert(currentLanguage === 'ru' ? '✅ Тренировка завершена!' : '✅ Workout completed!');
}

// Показать summary для записи из истории
function showHistoryItemSummary(historyItem) {
    const timeFormatted = formatTime(historyItem.duration);
    const weightFormatted = (historyItem.totalWeight || 0).toLocaleString('ru-RU');
    const workoutName = currentLanguage === 'ru'
        ? historyItem.workoutName
        : (historyItem.workoutNameEn || historyItem.workoutName);

    // Извлекаем название без префикса "Тренировка X:"
    const workoutTitle = workoutName.includes(':')
        ? workoutName.split(':')[1].trim()
        : workoutName;

    // Обновляем экран
    document.getElementById('summaryTime').textContent = timeFormatted;
    document.getElementById('summarySets').textContent = historyItem.completedSets;
    document.getElementById('summaryWeight').textContent = weightFormatted + (currentLanguage === 'en' ? ' kg' : ' кг');
    document.getElementById('summaryWorkoutName').textContent = workoutTitle;

    // Переводим если нужно
    if (currentLanguage === 'en') {
        const headerTitle = document.querySelector('.summary-header-title');
        if (headerTitle) headerTitle.textContent = 'MY WORKOUT';

        document.querySelectorAll('.summary-card-label')[0].textContent = 'time';
        document.querySelectorAll('.summary-card-label')[1].textContent = 'sets';
        document.querySelectorAll('.summary-card-label')[2].textContent = 'lifted';
        document.getElementById('summaryCloseBtn').textContent = 'Done';
    } else {
        const headerTitle = document.querySelector('.summary-header-title');
        if (headerTitle) headerTitle.textContent = 'МОЯ ТРЕНИРОВКА';

        document.querySelectorAll('.summary-card-label')[0].textContent = 'время';
        document.querySelectorAll('.summary-card-label')[1].textContent = 'подходов';
        document.querySelectorAll('.summary-card-label')[2].textContent = 'поднято';
        document.getElementById('summaryCloseBtn').textContent = 'Готово';
    }

    // Показываем экран
    showScreen('summaryScreen');

    // Обработчик кнопки закрытия - возвращаемся в историю
    document.getElementById('summaryCloseBtn').onclick = () => {
        showScreen('historyScreen');
    };
}

function endWorkout(completed) {
    stopRestTimer();
    clearInterval(mainTimerInterval);
    clearInterval(cardioTimerInterval);
    clearInterval(restTimerInterval);

    mainTimerSeconds = 0;
    currentWorkout = null;
    completedSets = {};

    showScreen('mainScreen');
}

// Сохранение истории
function saveWorkoutToHistory(timeSeconds, setsCompleted, totalWeight) {
    const workout = workouts[currentWorkout];

    const workoutData = {
        id: Date.now(),
        date: new Date().toISOString(),
        workoutId: currentWorkout,
        workoutName: workout.name,
        workoutNameEn: workout.nameEn,
        duration: timeSeconds,
        completedSets: setsCompleted,
        totalSets: Object.keys(completedSets).length,
        totalWeight: Math.round(totalWeight)
    };

    const history = getWorkoutHistory();
    history.unshift(workoutData);

    // Храним последние 50 тренировок
    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem('workoutHistory', JSON.stringify(history));
}

function getWorkoutHistory() {
    const history = localStorage.getItem('workoutHistory');
    return history ? JSON.parse(history) : [];
}

// Загрузка истории
function loadHistory() {
    const history = getWorkoutHistory();
    const container = document.getElementById('historyList');

    if (history.length === 0) {
        container.innerHTML = '<div class="history-item empty">История пуста. Начните свою первую тренировку!</div>';
        return;
    }

    container.innerHTML = '';

    history.forEach(workout => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(workout.date);
        const dateStr = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const weightInfo = workout.totalWeight ? `<span>🏋️ ${workout.totalWeight.toLocaleString('ru-RU')} кг</span>` : '';

        item.innerHTML = `
            <div class="history-header">
                <h3>${workout.workoutName}</h3>
                <span class="history-date">${dateStr}</span>
            </div>
            <div class="history-stats">
                <span>⏱️ ${formatTime(workout.duration)}</span>
                <span>✅ ${workout.completedSets}/${workout.totalSets} подходов</span>
                ${weightInfo}
            </div>
            <button class="btn btn-secondary share-workout-btn" data-workout-id="${workout.id}">
                📤 Поделиться
            </button>
        `;

        // Добавляем обработчик на кнопку поделиться
        const shareBtn = item.querySelector('.share-workout-btn');
        shareBtn.addEventListener('click', () => {
            showHistoryItemSummary(workout);
        });

        container.appendChild(item);
    });
}

// Загрузка статистики
function loadStats() {
    const history = getWorkoutHistory();
    const container = document.getElementById('statsContent');

    if (history.length === 0) {
        container.innerHTML = '<div class="stat-card"><p>Нет данных для статистики</p></div>';
        return;
    }

    // Подсчет статистики
    const totalWorkouts = history.length;
    const totalTime = history.reduce((sum, w) => sum + w.duration, 0);
    const avgTime = totalTime / totalWorkouts;
    const totalSets = history.reduce((sum, w) => sum + w.completedSets, 0);

    // Подсчет по типам тренировок
    const workoutCounts = {};
    history.forEach(w => {
        workoutCounts[w.workoutId] = (workoutCounts[w.workoutId] || 0) + 1;
    });

    container.innerHTML = `
        <div class="stat-card">
            <h3>💪 Всего тренировок</h3>
            <div class="stat-value">${totalWorkouts}</div>
            <div class="stat-label">тренировок</div>
        </div>

        <div class="stat-card">
            <h3>⏱️ Общее время</h3>
            <div class="stat-value">${Math.round(totalTime / 3600)}</div>
            <div class="stat-label">часов</div>
        </div>

        <div class="stat-card">
            <h3>📊 Среднее время</h3>
            <div class="stat-value">${Math.round(avgTime / 60)}</div>
            <div class="stat-label">минут</div>
        </div>

        <div class="stat-card">
            <h3>✅ Всего подходов</h3>
            <div class="stat-value">${totalSets}</div>
            <div class="stat-label">подходов</div>
        </div>

        <div class="stat-card">
            <h3>🏋️ Тренировка 1</h3>
            <div class="stat-value">${workoutCounts[1] || 0}</div>
            <div class="stat-label">раз</div>
        </div>

        <div class="stat-card">
            <h3>🦵 Тренировка 2</h3>
            <div class="stat-value">${workoutCounts[2] || 0}</div>
            <div class="stat-label">раз</div>
        </div>

        <div class="stat-card">
            <h3>💪 Тренировка 3</h3>
            <div class="stat-value">${workoutCounts[3] || 0}</div>
            <div class="stat-label">раз</div>
        </div>
    `;
}

// Калькулятор калорий
function calculateCalories() {
    const weight = parseFloat(document.getElementById('weightInput').value);
    const height = parseFloat(document.getElementById('heightInput').value);
    const age = parseInt(document.getElementById('ageInput').value);
    const gender = document.getElementById('genderInput').value;

    if (!weight || !height || !age) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    // Формула Mifflin-St Jeor
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Умножаем на коэффициент активности (3 тренировки в неделю = 1.55)
    const tdee = Math.round(bmr * 1.55);
    const bulkCalories = tdee + 300; // Для набора массы
    const cutCalories = tdee - 300; // Для похудения
    const protein = Math.round(weight * 2); // 2г на кг

    const resultDiv = document.getElementById('calcResult');
    resultDiv.innerHTML = `
        <h4>📊 Результаты:</h4>
        <p><strong>Базовый метаболизм (BMR):</strong> ${Math.round(bmr)} ккал/день</p>
        <p><strong>Поддержка веса (TDEE):</strong> ${tdee} ккал/день</p>
        <p><strong>Набор массы:</strong> ${bulkCalories} ккал/день (+300)</p>
        <p><strong>Похудение:</strong> ${cutCalories} ккал/день (-300)</p>
        <p><strong>Белок:</strong> ${protein}г в день (2г на кг веса)</p>
        <br>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
            💡 Совет: Начни с поддержки веса на 2 недели, затем увеличь на +200-300 ккал
            для набора массы. Отслеживай вес каждую неделю.
        </p>
    `;
    resultDiv.classList.add('active');
}

// Вспомогательные функции
function pad(num) {
    return num.toString().padStart(2, '0');
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м ${secs}с`;
}

// Супер сеты
function openSupersetModal(exerciseIndex, exercise) {
    const workout = workouts[currentWorkout];

    // Создаем список доступных упражнений
    let options = '<div class="superset-modal-content">';

    const exerciseName = getExerciseName(exercise);
    const modalTitle = currentLanguage === 'ru' ? 'Создать суперсет' : 'Create Superset';
    const modalSubtitle = currentLanguage === 'ru'
        ? `Выбери упражнение для суперсета с: <strong>${exerciseName}</strong>`
        : `Choose exercise to superset with: <strong>${exerciseName}</strong>`;

    options += `<h3>${modalTitle}</h3>`;
    options += `<p>${modalSubtitle}</p>`;
    options += '<div class="superset-options">';

    let hasAvailableExercises = false;

    workout.exercises.forEach((ex, idx) => {
        // Пропускаем: себя, кардио, и упражнения уже в суперсете
        if (idx === exerciseIndex || ex.type === 'cardio' || supersets[idx] !== undefined) return;

        hasAvailableExercises = true;

        // Получаем рекомендацию
        const recommendation = getSupersetRecommendation(exercise, ex);

        const exName = getExerciseName(ex);

        options += `
            <div class="superset-option ${recommendation.class}" onclick="createSuperset(${exerciseIndex}, ${idx})">
                <div class="superset-option-header">
                    <strong>${exName}</strong>
                    <span class="${recommendation.class}">${recommendation.icon}</span>
                </div>
                <div class="superset-recommendation">${recommendation.text}</div>
            </div>
        `;
    });

    if (!hasAvailableExercises) {
        const noExercisesText = currentLanguage === 'ru'
            ? '😅 Все остальные упражнения уже в суперсетах или недоступны'
            : '😅 All other exercises are already in supersets or unavailable';
        options += `<div class="superset-option" style="opacity: 0.7; cursor: default; border-color: var(--text-secondary);">
            <div class="superset-recommendation">${noExercisesText}</div>
        </div>`;
    }

    options += '</div>';

    const cancelText = currentLanguage === 'ru' ? 'Отмена' : 'Cancel';
    options += `<button class="btn btn-secondary" onclick="closeSupersetModal()">${cancelText}</button>`;
    options += '</div>';

    // Показываем модальное окно
    const modal = document.createElement('div');
    modal.className = 'superset-modal active';
    modal.id = 'supersetModal';
    modal.innerHTML = options;
    document.body.appendChild(modal);
}

function closeSupersetModal() {
    const modal = document.getElementById('supersetModal');
    if (modal) modal.remove();
}

function createSuperset(exerciseIndex1, exerciseIndex2) {
    // Создаем двусторонний суперсет
    supersets[exerciseIndex1] = exerciseIndex2;
    supersets[exerciseIndex2] = exerciseIndex1;

    // Подтягиваем упражнения друг к другу в порядке
    const order = exerciseOrder[currentWorkout];
    const index1 = order.indexOf(exerciseIndex1);
    const index2 = order.indexOf(exerciseIndex2);

    if (index1 !== -1 && index2 !== -1 && Math.abs(index1 - index2) > 1) {
        // Удаляем второе упражнение из его текущей позиции
        order.splice(index2, 1);

        // Вставляем его сразу после первого
        const newIndex1 = order.indexOf(exerciseIndex1);
        order.splice(newIndex1 + 1, 0, exerciseIndex2);

        // Сохраняем новый порядок
        exerciseOrder[currentWorkout] = order;
    }

    closeSupersetModal();

    // Перерисовываем упражнения
    const workout = workouts[currentWorkout];
    renderExercises(workout);
    restoreWorkoutState();
}

function breakSuperset(exerciseIndex) {
    const confirmText = currentLanguage === 'ru'
        ? 'Разорвать суперсет?'
        : 'Break superset?';

    if (confirm(confirmText)) {
        const partnerId = supersets[exerciseIndex];

        // Удаляем с обеих сторон
        delete supersets[exerciseIndex];
        delete supersets[partnerId];

        // Перерисовываем
        const workout = workouts[currentWorkout];
        renderExercises(workout);
        restoreWorkoutState();
    }
}

function getSupersetRecommendation(exercise1, exercise2) {
    const type1 = exercise1.type;
    const type2 = exercise2.type;

    // Определяем группы мышц
    const group1 = getExerciseMuscleGroup(exercise1);
    const group2 = getExerciseMuscleGroup(exercise2);

    // Оба базовых/тяжелых
    if ((type1 === 'legs' || type1 === 'compound') && (type2 === 'legs' || type2 === 'compound') && group1 === group2) {
        return {
            class: 'bad',
            icon: '❌',
            text: currentLanguage === 'ru'
                ? 'Не рекомендую: оба упражнения тяжелые для одной группы'
                : 'Not recommended: both exercises are heavy for the same muscle group'
        };
    }

    // Разные группы мышц
    if (group1 !== group2) {
        return {
            class: 'good',
            icon: '✅',
            text: currentLanguage === 'ru'
                ? 'Отлично! Разные группы мышц - успеешь восстановиться'
                : 'Great! Different muscle groups - you\'ll have time to recover'
        };
    }

    // Одна группа, но одно изоляция
    if (type1 === 'isolation' || type2 === 'isolation') {
        return {
            class: 'ok',
            icon: '⚠️',
            text: currentLanguage === 'ru'
                ? 'Можно: одна группа мышц, но не очень тяжело'
                : 'OK: same muscle group, but not too heavy'
        };
    }

    // По умолчанию
    return {
        class: 'ok',
        icon: '⚠️',
        text: currentLanguage === 'ru'
            ? 'Осторожно: может быть тяжеловато'
            : 'Caution: might be a bit challenging'
    };
}

function getExerciseMuscleGroup(exercise) {
    const name = exercise.name.toLowerCase();

    if (name.includes('приседан') || name.includes('жим ногами') || name.includes('ягодиц') ||
        name.includes('выпад') || name.includes('ног') || name.includes('икр') || name.includes('носки')) {
        return 'legs';
    }

    if (name.includes('грудь') || name.includes('жим') && !name.includes('ногами') && !name.includes('плеч')) {
        return 'chest';
    }

    if (name.includes('спина') || name.includes('тяга') || name.includes('подтягива')) {
        return 'back';
    }

    if (name.includes('плеч') || name.includes('дельт')) {
        return 'shoulders';
    }

    if (name.includes('бицепс') || name.includes('сгибан') && name.includes('рук')) {
        return 'biceps';
    }

    if (name.includes('трицепс') || name.includes('разгибан') && name.includes('рук')) {
        return 'triceps';
    }

    if (name.includes('пресс') || name.includes('скручива') || name.includes('кор')) {
        return 'abs';
    }

    return 'other';
}

// ===== АЛЬТЕРНАТИВНЫЕ УПРАЖНЕНИЯ =====

function openAlternativeModal(exerciseIndex, exercise) {
    const modal = document.createElement('div');
    modal.className = 'superset-modal active';
    modal.id = 'alternativeModal';

    const exerciseName = getExerciseName(exercise);
    const modalTitle = currentLanguage === 'ru'
        ? `Тренажер занят? Выбери замену для "${exerciseName}"`
        : `Machine busy? Choose alternative for "${exerciseName}"`;
    const modalSubtitle = currentLanguage === 'ru'
        ? 'Вес будет пересчитан автоматически'
        : 'Weight will be recalculated automatically';
    const closeText = currentLanguage === 'ru' ? 'Отмена' : 'Cancel';

    let optionsHtml = '';
    exercise.alternatives.forEach((alt, altIndex) => {
        const altName = currentLanguage === 'ru' ? alt.name : (alt.nameEn || alt.name);
        const altTechnique = currentLanguage === 'ru' ? alt.technique : (alt.techniqueEn || alt.technique);
        const altFocus = currentLanguage === 'ru' ? alt.focus : (alt.focusEn || alt.focus);

        // Рассчитываем новый вес
        let newWeight = '';
        if (exercise.isDual) {
            const weight1 = Math.round(exercise.currentWeight * alt.weightMultiplier * 2) / 2;
            const weight2 = Math.round(exercise.currentWeight2 * alt.weightMultiplier * 2) / 2;
            const weightUnit = currentLanguage === 'ru' ? 'кг' : 'kg';
            newWeight = `${weight1} ${weightUnit} / ${weight2} ${weightUnit}`;
        } else {
            const weight = Math.round(exercise.currentWeight * alt.weightMultiplier * 2) / 2;
            const weightUnit = currentLanguage === 'ru' ? 'кг' : 'kg';
            newWeight = `${weight} ${weightUnit}`;
        }

        optionsHtml += `
            <div class="superset-option good" onclick="selectAlternative(${exerciseIndex}, ${altIndex})">
                <div class="superset-option-header">
                    <strong>${altName}</strong>
                    <span>📊 ${newWeight}</span>
                </div>
                <div class="superset-recommendation">
                    🎯 ${altTechnique || ''}
                    ${altFocus ? `<br>🔥 ${altFocus}` : ''}
                </div>
            </div>
        `;
    });

    modal.innerHTML = `
        <div class="superset-modal-content">
            <h3>${modalTitle}</h3>
            <p>${modalSubtitle}</p>
            <div class="superset-options">
                ${optionsHtml}
            </div>
            <button class="btn btn-secondary" onclick="closeAlternativeModal()">${closeText}</button>
        </div>
    `;

    document.body.appendChild(modal);
}

function selectAlternative(exerciseIndex, altIndex) {
    const altKey = `${currentWorkout}-${exerciseIndex}`;
    selectedAlternatives[altKey] = altIndex;

    // Сохраняем в localStorage
    localStorage.setItem('alternatives', JSON.stringify(selectedAlternatives));

    closeAlternativeModal();

    // Перерисовываем упражнения с новыми весами
    const workout = workouts[currentWorkout];
    renderExercises(workout);
    restoreWorkoutState();
}

function clearAlternative(exerciseIndex) {
    const confirmText = currentLanguage === 'ru'
        ? 'Вернуть основное упражнение?'
        : 'Return to main exercise?';

    if (confirm(confirmText)) {
        const altKey = `${currentWorkout}-${exerciseIndex}`;
        delete selectedAlternatives[altKey];

        // Сохраняем в localStorage
        localStorage.setItem('alternatives', JSON.stringify(selectedAlternatives));

        // Перерисовываем
        const workout = workouts[currentWorkout];
        renderExercises(workout);
        restoreWorkoutState();
    }
}

function closeAlternativeModal() {
    const modal = document.getElementById('alternativeModal');
    if (modal) {
        modal.remove();
    }
}

function getActiveExercise(exercise, exerciseIndex) {
    // Проверяем, выбрана ли альтернатива
    const altKey = `${currentWorkout}-${exerciseIndex}`;
    if (selectedAlternatives[altKey] !== undefined && exercise.alternatives) {
        const altIndex = selectedAlternatives[altKey];
        const alternative = exercise.alternatives[altIndex];

        // Создаем копию альтернативного упражнения с пересчитанными весами
        return {
            ...exercise,
            name: alternative.name,
            nameEn: alternative.nameEn || alternative.name,
            technique: alternative.technique,
            techniqueEn: alternative.techniqueEn || alternative.technique,
            focus: alternative.focus,
            focusEn: alternative.focusEn || alternative.focus,
            currentWeight: Math.round(exercise.currentWeight * alternative.weightMultiplier * 2) / 2,
            currentWeight2: exercise.currentWeight2 ? Math.round(exercise.currentWeight2 * alternative.weightMultiplier * 2) / 2 : undefined,
            type: alternative.type,
            isAlternative: true
        };
    }

    return exercise;
}

// Theme toggle
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'light';
    updateThemeLabel(savedTheme);

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';

        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeLabel(newTheme);
    });
}

function updateThemeLabel(theme) {
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
}

// Language toggle
function initLanguage() {
    const languageToggle = document.getElementById('languageToggle');
    const languageLabel = document.getElementById('languageLabel');
    const savedLanguage = localStorage.getItem('language') || 'ru';
    currentLanguage = savedLanguage;

    languageToggle.checked = savedLanguage === 'en';
    updateLanguageLabel(savedLanguage);
    updateLanguage();

    languageToggle.addEventListener('change', () => {
        currentLanguage = languageToggle.checked ? 'en' : 'ru';
        localStorage.setItem('language', currentLanguage);
        updateLanguageLabel(currentLanguage);
        updateLanguage();
    });
}

function updateLanguageLabel(language) {
    const languageLabel = document.getElementById('languageLabel');
    if (languageLabel) {
        languageLabel.textContent = language === 'ru' ? 'Ru' : 'En';
    }
}

function updateLanguage() {
    // Обновить все текстовые элементы интерфейса
    const mainTitle = document.querySelector('header h1');
    if (mainTitle) {
        mainTitle.textContent = currentLanguage === 'ru' ? 'Тренировочный Трекер' : 'Workout Tracker';
    }

    // Обновить карточки тренировок
    document.querySelectorAll('.workout-card').forEach((card, index) => {
        const workoutId = parseInt(card.dataset.workout);
        const workout = workouts[workoutId];
        if (workout) {
            // Название тренировки
            const workoutNumber = currentLanguage === 'ru' ? `Тренировка ${workoutId}` : `Workout ${workoutId}`;
            const h2 = card.querySelector('.workout-header h2');
            if (h2) {
                // Сохраняем эмодзи если есть
                const emoji = h2.textContent.match(/[🏋️‍♀️💪🔥⚡🎬🍑]/g);
                h2.textContent = emoji ? `${workoutNumber} ${emoji.join('')}` : workoutNumber;
            }

            // Название, описание и длительность
            // Извлекаем название из name (после двоеточия)
            const nameWithPrefix = currentLanguage === 'ru' ? workout.name : (workout.nameEn || workout.name);
            const titleFromName = nameWithPrefix.includes(':') ? nameWithPrefix.split(':')[1].trim() : nameWithPrefix;

            const title = currentLanguage === 'ru'
                ? (workout.title || titleFromName)
                : (workout.titleEn || titleFromName);

            const description = currentLanguage === 'ru'
                ? (workout.description || workout.subtitle || '')
                : (workout.descriptionEn || workout.subtitleEn || workout.description || workout.subtitle || '');

            const duration = currentLanguage === 'ru' ? workout.duration : (workout.durationEn || workout.duration);

            const h3Tag = card.querySelector('h3');
            if (h3Tag) h3Tag.textContent = title;

            const pTag = card.querySelector('p');
            if (pTag) {
                if (description) {
                    pTag.textContent = description;
                    pTag.style.display = '';
                } else {
                    pTag.style.display = 'none';
                }
            }

            card.querySelector('.workout-badge').textContent = `~${duration}`;

            // Обновить информацию о тренировке (упражнения и подходы)
            const workoutInfo = card.querySelector('.workout-info');
            if (workoutInfo && workout.exercises) {
                const exerciseCount = workout.exercises.filter(ex => ex.type !== 'cardio').length;
                const totalSets = workout.exercises.reduce((sum, ex) => {
                    return sum + (ex.sets || 0) + (ex.warmupSets || 0);
                }, 0);

                const cardioText = currentLanguage === 'ru' ? '8 мин кардио' : '8 min cardio';
                const exercisesText = currentLanguage === 'ru'
                    ? `${exerciseCount} упражнений`
                    : `${exerciseCount} exercises`;
                const setsText = currentLanguage === 'ru'
                    ? `${totalSets} подходов`
                    : `${totalSets} sets`;

                // Найти spans и обновить
                const spans = workoutInfo.querySelectorAll('span');
                if (spans.length >= 2) {
                    spans[0].textContent = `${cardioText} + ${exercisesText}`;
                    spans[1].textContent = setsText;
                }
            }
        }
    });

    // Обновить кнопки
    document.querySelectorAll('.start-btn').forEach(btn => {
        const icon = currentLanguage === 'ru' ? '▶ ' : '▶ ';
        btn.textContent = icon + (currentLanguage === 'ru' ? 'Начать' : 'Start');
    });

    // Обновить кнопки навигации
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) historyBtn.textContent = currentLanguage === 'ru' ? 'История' : 'History';

    const adviceBtn = document.getElementById('adviceBtn');
    if (adviceBtn) adviceBtn.textContent = currentLanguage === 'ru' ? 'Советы' : 'Advice';

    const statsBtn = document.getElementById('statsBtn');
    if (statsBtn) statsBtn.textContent = currentLanguage === 'ru' ? 'Статистика' : 'Statistics';

    // Обновить экран тренировки если он открыт
    if (currentWorkout && document.getElementById('workoutScreen').classList.contains('active')) {
        renderExercises(workouts[currentWorkout]);
        restoreWorkoutState();
    }
}

// Initialize theme and language on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initLanguage();
    });
} else {
    initTheme();
    initLanguage();
}
