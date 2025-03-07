// Define interfaces and types
interface HealthConditions {
    diabetes: boolean;
    hypertension: boolean;
    jointProblems: boolean;
    heartProblems: boolean;
}

interface IdealWeightRange {
    min: number;
    max: number;
}

interface BMIThresholds {
    severeUnderweight: number;
    underweight: number;
    normal: number;
    overweight: number;
    obese1: number;
    obese2: number;
}

type BMICategory = 'severe-underweight' | 'underweight' | 'normal' | 'overweight' | 'obese-1' | 'obese-2' | 'obese-3';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';
type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';

// DOM Elements
const heightInput = document.getElementById('height') as HTMLInputElement;
const weightInput = document.getElementById('weight') as HTMLInputElement;
const genderSelect = document.getElementById('gender') as HTMLSelectElement;
const ageInput = document.getElementById('age') as HTMLInputElement;
const activitySelect = document.getElementById('activity') as HTMLSelectElement;
const bodyTypeSelect = document.getElementById('body-type') as HTMLSelectElement;
const diabetesCheckbox = document.getElementById('health-diabetes') as HTMLInputElement;
const hypertensionCheckbox = document.getElementById('health-hypertension') as HTMLInputElement;
const jointCheckbox = document.getElementById('health-joint') as HTMLInputElement;
const heartCheckbox = document.getElementById('health-heart') as HTMLInputElement;
const calculateBtn = document.getElementById('calculate-btn') as HTMLButtonElement;
const bmiValueElement = document.getElementById('bmi-value') as HTMLElement;
const bmiCategoryElement = document.getElementById('bmi-category') as HTMLElement;
const bmiInfoElement = document.getElementById('bmi-info') as HTMLElement;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    calculateBtn.addEventListener('click', calculateBMI);
    
    [heightInput, weightInput, ageInput].forEach(input => {
        input.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                calculateBMI();
            }
        });
    });
});

// Functions
function calculateBMI(): void {
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    const gender = genderSelect.value as Gender;
    const age = parseInt(ageInput.value);
    const activity = activitySelect.value as ActivityLevel;
    const bodyType = bodyTypeSelect.value as BodyType;
    
    const healthConditions: HealthConditions = {
        diabetes: diabetesCheckbox.checked,
        hypertension: hypertensionCheckbox.checked,
        jointProblems: jointCheckbox.checked,
        heartProblems: heartCheckbox.checked
    };
    
    const bodyFrame = calculateBodyFrame(height, bodyType);
    const idealWeightRange = calculateIdealWeightRange(height, gender, bodyFrame);
    
    if (!validateInputs(height, weight, age)) return;
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    bmiValueElement.textContent = bmi.toFixed(1);
    
    const category = getBMICategory(bmi, age);
    displayBMICategory(category, bmi, gender, age, activity, bodyType, healthConditions, idealWeightRange);
    
    const resultSection = document.getElementById('result-section');
    resultSection?.classList.add('fade-in');
    
    highlightBMIScale(bmi);
}

function validateInputs(height: number, weight: number, age: number): boolean {
    if (!height || height < 50 || height > 250) {
        showError('Пожалуйста, введите корректный рост (50-250 см)');
        return false;
    }
    
    if (!weight || weight < 20 || weight > 300) {
        showError('Пожалуйста, введите корректный вес (20-300 кг)');
        return false;
    }
    
    if (!age || age < 1 || age > 120) {
        showError('Пожалуйста, введите корректный возраст (1-120 лет)');
        return false;
    }
    
    return true;
}

function getBMICategory(bmi: number, age: number): BMICategory {
    const thresholds = getAgeAdjustedThresholds(age);
    
    if (bmi < thresholds.severeUnderweight) return 'severe-underweight';
    if (bmi < thresholds.underweight) return 'underweight';
    if (bmi < thresholds.normal) return 'normal';
    if (bmi < thresholds.overweight) return 'overweight';
    if (bmi < thresholds.obese1) return 'obese-1';
    if (bmi < thresholds.obese2) return 'obese-2';
    return 'obese-3';
}

function getAgeAdjustedThresholds(age: number): BMIThresholds {
    let adjustment = 0;
    
    if (age < 18) {
        adjustment = -1;
    } else if (age > 65) {
        adjustment = 1;
    }
    
    return {
        severeUnderweight: 16 + adjustment,
        underweight: 18.5 + adjustment,
        normal: 25 + adjustment,
        overweight: 30 + adjustment,
        obese1: 35 + adjustment,
        obese2: 40 + adjustment
    };
}

function calculateBodyFrame(height: number, bodyType: BodyType): number {
    let baseFrame = height / 100;
    
    switch(bodyType) {
        case 'ectomorph': return baseFrame * 0.9;
        case 'mesomorph': return baseFrame * 1.0;
        case 'endomorph': return baseFrame * 1.1;
        default: return baseFrame;
    }
}

function calculateIdealWeightRange(height: number, gender: Gender, bodyFrame: number): IdealWeightRange {
    const baseWeight = (height - 100) * bodyFrame;
    const adjustment = gender === 'male' ? 1.1 : 0.9;
    
    return {
        min: baseWeight * adjustment * 0.9,
        max: baseWeight * adjustment * 1.1
    };
}

function showError(message: string): void {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    const container = document.querySelector('.calculator-card');
    container?.appendChild(errorElement);
    
    setTimeout(() => {
        errorElement.remove();
    }, 3000);
}

function highlightBMIScale(bmi: number): void {
    const scaleBar = document.querySelector('.scale-bar') as HTMLElement;
    const scaleWidth = scaleBar.offsetWidth;
    
    const existingMarker = document.querySelector('.bmi-marker');
    existingMarker?.remove();
    
    const marker = document.createElement('div');
    marker.className = 'bmi-marker';
    marker.style.cssText = `
        position: absolute;
        width: 4px;
        height: 30px;
        background: #2c3e50;
        border-radius: 2px;
        bottom: -5px;
        transform: translateX(-50%);
        transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    `;
    
    let position: number;
    if (bmi < 16) {
        position = 0;
    } else if (bmi > 40) {
        position = scaleWidth;
    } else {
        position = (bmi - 16) / (40 - 16) * scaleWidth;
    }
    
    marker.style.left = `${position}px`;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'bmi-marker-tooltip';
    tooltip.textContent = bmi.toFixed(1);
    tooltip.style.cssText = `
        position: absolute;
        background: #2c3e50;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    marker.appendChild(tooltip);
    scaleBar.style.position = 'relative';
    scaleBar.appendChild(marker);
    
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 100);
    
    marker.addEventListener('mouseenter', () => {
        marker.style.height = '35px';
        tooltip.style.bottom = '35px';
    });
    
    marker.addEventListener('mouseleave', () => {
        marker.style.height = '30px';
        tooltip.style.bottom = '30px';
    });
}

function displayBMICategory(
    category: BMICategory,
    bmi: number,
    gender: Gender,
    age: number,
    activity: ActivityLevel,
    bodyType: BodyType,
    healthConditions: HealthConditions,
    idealWeightRange: IdealWeightRange
): void {
    // Set category text and styling
    let categoryText = '';
    let categoryClass = '';
    let infoHTML = '';
    
    // Calculate activity factor for recommendations
    let activityFactor = 1.0;
    switch(activity) {
        case 'sedentary': activityFactor = 1.2; break;
        case 'light': activityFactor = 1.375; break;
        case 'moderate': activityFactor = 1.55; break;
        case 'high': activityFactor = 1.725; break;
        case 'very_high': activityFactor = 1.9; break;
    }
    
    // Get weight from input for BMR calculation
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    
    // Calculate base metabolic rate (BMR) using Mifflin-St Jeor equation
    const bmr = gender === 'male' 
        ? (10 * weight) + (6.25 * height) - (5 * age) + 5
        : (10 * weight) + (6.25 * height) - (5 * age) - 161;
    
    // Calculate daily calorie needs
    const dailyCalories = Math.round(bmr * activityFactor);
    
    switch(category) {
        case 'severe-underweight':
            categoryText = 'Выраженный дефицит массы';
            categoryClass = 'category-underweight';
            infoHTML = `
                <h3>Выраженный дефицит массы тела</h3>
                <p>Ваш ИМТ указывает на серьезный недостаток веса, что может привести к проблемам со здоровьем, включая ослабление иммунной системы, нарушения питания, гормональный дисбаланс, остеопороз и анемию.</p>
                <p><strong>Риски для здоровья:</strong></p>
                <ul>
                    <li>Ослабленная иммунная система</li>
                    <li>Нарушение менструального цикла у женщин</li>
                    <li>Потеря костной массы</li>
                    <li>Анемия и дефицит витаминов</li>
                    <li>Проблемы с фертильностью</li>
                </ul>
                <p><strong>Рекомендации по питанию:</strong></p>
                <ul>
                    <li>Увеличьте калорийность рациона на 500-700 ккал в день</li>
                    <li>Употребляйте продукты, богатые полезными жирами (авокадо, орехи, оливковое масло)</li>
                    <li>Включите в рацион продукты с высоким содержанием белка (мясо, рыба, яйца, бобовые)</li>
                    <li>Питайтесь часто, небольшими порциями (5-6 раз в день)</li>
                    <li>Используйте протеиновые коктейли между основными приемами пищи</li>
                </ul>
                <p><strong>Физическая активность:</strong> Сосредоточьтесь на силовых тренировках для наращивания мышечной массы, избегая чрезмерных кардионагрузок.</p>
                <p><strong>Важно:</strong> Настоятельно рекомендуется обратиться к врачу для оценки состояния здоровья и разработки индивидуального плана по безопасному набору веса.</p>
            `;
            break;
        case 'underweight':
            categoryText = 'Недостаточный вес';
            categoryClass = 'category-underweight';
            infoHTML = `
                <h3>Недостаточный вес</h3>
                <p>Ваш ИМТ ниже нормы. Для вашего роста и телосложения рекомендуемый вес: ${idealWeightRange.min.toFixed(1)} - ${idealWeightRange.max.toFixed(1)} кг.</p>
                <p><strong>Индивидуальные факторы риска:</strong></p>
                <ul>
                    <li>Ослабленный иммунитет и повышенная восприимчивость к инфекциям</li>
                    <li>${gender === 'female' ? 'Нарушения менструального цикла и репродуктивной функции' : 'Снижение уровня тестостерона'}</li>
                    <li>Дефицит питательных веществ и витаминов</li>
                    <li>Повышенная утомляемость и снижение работоспособности</li>
                    <li>${age > 60 ? 'Повышенный риск остеопороза и переломов' : 'Замедленное восстановление после физических нагрузок'}</li>
                </ul>
                <p><strong>Персонализированный план питания:</strong></p>
                <ul>
                    <li>Целевая калорийность: ${Math.round((gender === 'male' ? 2500 : 2000) * (age < 30 ? 1.2 : age > 60 ? 1.1 : 1.15) + 500)} ккал в день</li>
                    <li>Оптимальное потребление белка: ${Math.round(idealWeightRange.min * 1.8)} - ${Math.round(idealWeightRange.min * 2.2)} г в день</li>
                    <li>Здоровые жиры: ${Math.round(((gender === 'male' ? 2500 : 2000) + 500) * 0.3 / 9)} г в день (авокадо, орехи, оливковое масло)</li>
                    <li>Частота приемов пищи: 5-6 раз в день небольшими порциями</li>
                    <li>Питательные коктейли между основными приемами пищи</li>
                </ul>
                <p><strong>Оптимальная физическая активность:</strong></p>
                <ul>
                    <li>Силовые тренировки: ${age < 50 ? '3-4 раза в неделю' : '2-3 раза в неделю'} с акцентом на базовые упражнения</li>
                    <li>Кардионагрузки: умеренные, не более ${age < 30 ? '30' : '20'} минут ${age < 50 ? '3' : '2'} раза в неделю</li>
                    <li>Восстановление: полноценный сон ${age < 18 ? '8-10' : '7-9'} часов и отдых между тренировками</li>
                </ul>
                <p><strong>Важно:</strong> При недостаточном весе рекомендуется консультация с врачом для исключения скрытых заболеваний и разработки безопасного плана набора веса.</p>
            `;
            break;
        case 'normal':
            categoryText = 'Нормальный вес';
            categoryClass = 'category-normal';
            infoHTML = `
                <h3>Нормальный вес</h3>
                <p>Поздравляем! Ваш ИМТ находится в пределах нормы. Ваш идеальный диапазон веса: ${idealWeightRange.min.toFixed(1)} - ${idealWeightRange.max.toFixed(1)} кг.</p>
                <p><strong>Преимущества нормального веса:</strong></p>
                <ul>
                    <li>Оптимальная работа сердечно-сосудистой системы</li>
                    <li>Сбалансированный гормональный фон</li>
                    <li>Здоровый обмен веществ</li>
                    <li>Хорошая физическая форма и выносливость</li>
                    <li>Крепкий иммунитет</li>
                </ul>
                <p><strong>Персонализированные рекомендации:</strong></p>
                <ul>
                    <li>Суточная норма калорий: ${Math.round((gender === 'male' ? 2500 : 2000) * (age < 30 ? 1.1 : age > 60 ? 0.9 : 1))} ккал</li>
                    <li>Оптимальное потребление белка: ${Math.round(weight * 1.5)} - ${Math.round(weight * 2)} г в день</li>
                    <li>Питьевой режим: ${Math.round(weight * 0.03 * 100) / 100} л воды в день</li>
                    <li>Физическая активность: ${age < 50 ? '150-300 минут умеренной или 75-150 минут интенсивной' : '120-180 минут умеренной'} активности в неделю</li>
                    <li>Силовые тренировки: ${age < 65 ? '2-3 раза в неделю' : '1-2 раза в неделю под наблюдением специалиста'}</li>
                </ul>
                <p><strong>Рекомендации по образу жизни:</strong></p>
                <ul>
                    <li>Регулярный режим сна (${age < 18 ? '8-10' : age > 65 ? '7-8' : '7-9'} часов)</li>
                    <li>Контроль уровня стресса через медитацию или йогу</li>
                    <li>Регулярные медицинские обследования</li>
                    <li>Сбалансированное питание с акцентом на цельные продукты</li>
                    <li>Поддержание активного образа жизни</li>
                </ul>
            `;
            break;
        case 'overweight':
            categoryText = 'Избыточный вес';
            categoryClass = 'category-overweight';
            infoHTML = `
                <h3>Избыточный вес</h3>
                <p>Ваш ИМТ указывает на избыточный вес. Рекомендуемый диапазон веса для вашего роста и телосложения: ${idealWeightRange.min.toFixed(1)} - ${idealWeightRange.max.toFixed(1)} кг.</p>
                <p><strong>Персонализированная оценка рисков:</strong></p>
                <ul>
                    <li>${gender === 'male' ? 'Повышенный риск сердечно-сосудистых заболеваний (особенно при абдоминальном ожирении)' : 'Повышенный риск метаболического синдрома и гормональных нарушений'}</li>
                    <li>${age > 45 ? 'Высокий риск развития диабета 2 типа и метаболического синдрома' : 'Повышенный риск развития инсулинорезистентности'}</li>
                    <li>Повышенная нагрузка на опорно-двигательный аппарат (особенно на колени и позвоночник)</li>
                    <li>${age > 50 ? 'Риск апноэ сна и проблем с дыханием' : 'Снижение качества сна и дневной энергии'}</li>
                    <li>${gender === 'female' && age < 50 ? 'Возможные нарушения менструального цикла и фертильности' : 'Снижение общей физической выносливости'}</li>
                </ul>
                <p><strong>Индивидуальный план питания:</strong></p>
                <ul>
                    <li>Оптимальная калорийность: ${Math.round((gender === 'male' ? 2500 : 2000) * (age < 30 ? 1.1 : age > 60 ? 0.85 : 0.9) - 500)} ккал в день</li>
                    <li>Белок: ${Math.round(idealWeightRange.min * 1.6)} - ${Math.round(idealWeightRange.min * 2)} г в день (${Math.round(idealWeightRange.min * 1.6 / weight * 100)}% от текущего веса)</li>
                    <li>Углеводы: преимущественно сложные, с низким гликемическим индексом</li>
                    <li>Клетчатка: ${Math.round(25 + (age > 50 ? 5 : 0))} г в день для улучшения пищеварения и контроля аппетита</li>
                    <li>Режим питания: 3 основных приема пищи и 1-2 перекуса, последний прием пищи за 3 часа до сна</li>
                </ul>
                <p><strong>Эффективная программа физической активности:</strong></p>
                <ul>
                    <li>Кардио: ${age < 60 ? '150-250 минут в неделю умеренной интенсивности' : '120-180 минут в неделю низкой или умеренной интенсивности'}</li>
                    <li>Силовые тренировки: ${age < 50 ? '2-3 раза в неделю' : '1-2 раза в неделю'} для увеличения мышечной массы и ускорения метаболизма</li>
                    <li>Ежедневная активность: не менее ${Math.round(7000 + (age < 60 ? 3000 : 0))} шагов в день</li>
                    <li>Интервальные тренировки: ${age < 50 ? 'эффективны для сжигания жира' : 'только после консультации с врачом'}</li>
                </ul>
                <p><strong>Реалистичные цели:</strong> Снижение веса на 5-10% (${Math.round(weight * 0.05)} - ${Math.round(weight * 0.1)} кг) в течение 3-6 месяцев значительно улучшит показатели здоровья. Оптимальная скорость снижения веса: 0.5-1 кг в неделю.</p>
            `;
            break;
        case 'obese-1':
            categoryText = 'Ожирение I степени';
            categoryClass = 'category-obese-1';
            infoHTML = `
                <h3>Ожирение I степени</h3>
                <p>Ваш ИМТ указывает на ожирение I степени. Рекомендуемый диапазон веса для вашего роста и телосложения: ${idealWeightRange.min.toFixed(1)} - ${idealWeightRange.max.toFixed(1)} кг.</p>
                <p><strong>Индивидуальная оценка рисков:</strong></p>
                <ul>
                    <li>${gender === 'male' ? 'Повышенный риск ишемической болезни сердца и инфаркта миокарда' : 'Повышенный риск гипертонии и инсульта'}</li>
                    <li>${age > 40 ? 'Высокий риск развития диабета 2 типа и метаболического синдрома' : 'Риск раннего развития инсулинорезистентности'}</li>
                    <li>Значительная нагрузка на опорно-двигательный аппарат (${age > 50 ? 'особенно высокий риск артроза коленных и тазобедренных суставов' : 'риск раннего износа суставов'})</li>
                    <li>${age > 45 ? 'Высокий риск апноэ сна и дыхательной недостаточности' : 'Нарушения дыхания во время сна и снижение качества отдыха'}</li>
                    <li>${gender === 'female' ? 'Повышенный риск гормональных нарушений и проблем с фертильностью' : 'Снижение уровня тестостерона и возможные проблемы с потенцией'}</li>
                    <li>Повышенный риск ${age > 50 ? 'колоректального рака и рака поджелудочной железы' : 'неалкогольной жировой болезни печени'}</li>
                </ul>
                <p><strong>Персонализированный план снижения веса:</strong></p>
                <ul>
                    <li>Целевая калорийность: ${Math.round((gender === 'male' ? 2500 : 2000) * (age < 30 ? 1 : age > 60 ? 0.8 : 0.85) - 750)} ккал в день</li>
                    <li>Белок: ${Math.round(idealWeightRange.min * 1.8)} - ${Math.round(idealWeightRange.min * 2.2)} г в день для сохранения мышечной массы</li>
                    <li>Углеводы: преимущественно с низким гликемическим индексом, ${Math.round(((gender === 'male' ? 2500 : 2000) - 750) * 0.4 / 4)} г в день</li>
                    <li>Клетчатка: ${Math.round(30 + (age > 50 ? 5 : 0))} г в день для улучшения пищеварения и контроля аппетита</li>
                    <li>Жиры: предпочтение ненасыщенным жирам, ${Math.round(((gender === 'male' ? 2500 : 2000) - 750) * 0.3 / 9)} г в день</li>
                    <li>Режим питания: 3 основных приема пищи и 1 перекус, последний прием пищи за 4 часа до сна</li>
                </ul>
                <p><strong>Эффективная программа физической активности:</strong></p>
                <ul>
                    <li>Начальный этап: ежедневная ходьба, начиная с ${age < 50 ? '20-30' : '15-20'} минут, постепенно увеличивая до 45-60 минут</li>
                    <li>Кардио: ${age < 60 ? '150-250 минут в неделю умеренной интенсивности' : '120-180 минут в неделю низкой или умеренной интенсивности'}</li>
                    <li>Силовые тренировки: ${age < 50 ? '2-3 раза в неделю' : '1-2 раза в неделю под наблюдением специалиста'}</li>
                    <li>Водные виды спорта: особенно рекомендованы для снижения нагрузки на суставы</li>
                </ul>
                <p><strong>Медицинское наблюдение:</strong> При ожирении I степени рекомендуется консультация с врачом для исключения сопутствующих заболеваний и разработки безопасного плана снижения веса. Регулярный контроль артериального давления, уровня сахара и липидного профиля.</p>
                <p><strong>Реалистичные цели:</strong> Снижение веса на 10-15% (${Math.round(weight * 0.1)} - ${Math.round(weight * 0.15)} кг) в течение 6-12 месяцев значительно улучшит показатели здоровья. Оптимальная скорость снижения веса: 0.5-1 кг в неделю.</p>
            `;
            break;
        case 'obese-2':
            categoryText = 'Ожирение II степени';
            categoryClass = 'category-obese-2';
            infoHTML = `
                <h3>Ожирение II степени</h3>
                <p>Ваш ИМТ указывает на ожирение II степени. Рекомендуемый диапазон веса для вашего роста и телосложения: ${idealWeightRange.min.toFixed(1)} - ${idealWeightRange.max.toFixed(1)} кг.</p>
                <p><strong>Индивидуальная оценка рисков для здоровья:</strong></p>
                <ul>
                    <li>${gender === 'male' ? 'Высокий риск ишемической болезни сердца, инфаркта миокарда и внезапной сердечной смерти' : 'Высокий риск гипертонической болезни, инсульта и тромбоэмболии'}</li>
                    <li>${age > 40 ? 'Очень высокий риск развития диабета 2 типа и его осложнений' : 'Высокий риск раннего развития метаболического синдрома и диабета'}</li>
                    <li>Тяжелая нагрузка на опорно-двигательный аппарат с высоким риском дегенеративных изменений суставов</li>
                    <li>${age > 40 ? 'Высокий риск обструктивного апноэ сна и дыхательной недостаточности' : 'Значительные нарушения дыхания во время сна и снижение качества жизни'}</li>
                    <li>${gender === 'female' ? 'Серьезные гормональные нарушения, риск бесплодия и осложнений при беременности' : 'Значительное снижение уровня тестостерона, эректильная дисфункция'}</li>
                    <li>Высокий риск ${age > 50 ? 'онкологических заболеваний (колоректальный рак, рак поджелудочной железы, рак молочной железы у женщин)' : 'неалкогольного стеатогепатита и цирроза печени'}</li>
                    <li>Повышенный риск психологических проблем: депрессии, тревожности, социальной изоляции</li>
                </ul>
                <p><strong>Комплексный медицинский подход:</strong></p>
                <ul>
                    <li>Обязательное медицинское обследование: оценка сердечно-сосудистой системы, метаболических показателей, функции печени и почек</li>
                    <li>Консультация эндокринолога для исключения гормональных причин ожирения</li>
                    <li>Регулярный мониторинг артериального давления, уровня глюкозы и липидного профиля</li>
                    <li>Возможное медикаментозное лечение под наблюдением врача</li>
                </ul>
                <p><strong>Структурированный план питания:</strong></p>
                <ul>
                    <li>Целевая калорийность: ${Math.round((gender === 'male' ? 2500 : 2000) * (age < 30 ? 0.9 : age > 60 ? 0.75 : 0.8) - 750)} ккал в день</li>
                    <li>Белок: ${Math.round(idealWeightRange.min * 2)} - ${Math.round(idealWeightRange.min * 2.4)} г в день для сохранения мышечной массы</li>
                    <li>Углеводы: строгое ограничение простых углеводов, предпочтение продуктам с низким гликемическим индексом</li>
                    <li>Дробное питание: 4-5 приемов пищи небольшими порциями</li>
                    <li>Ведение дневника питания для контроля калорийности и пищевого поведения</li>
                </ul>
                <p><strong>Адаптированная программа физической активности:</strong></p>
                <ul>
                    <li>Начальный этап: ежедневная ходьба, начиная с ${age < 50 ? '15-20' : '10-15'} минут, постепенно увеличивая до 30-45 минут</li>
                    <li>Низкоударные кардионагрузки: плавание, велотренажер, эллиптический тренажер</li>
                    <li>Силовые тренировки: ${age < 50 ? '2 раза в неделю под наблюдением тренера' : 'только под наблюдением специалиста с учетом сопутствующих заболеваний'}</li>
                    <li>Упражнения на гибкость и равновесие для снижения риска травм</li>
                </ul>
                <p><strong>Важно:</strong> При ожирении II степени настоятельно рекомендуется медицинское наблюдение на протяжении всего процесса снижения веса. В некоторых случаях может рассматриваться вопрос о бариатрической хирургии.</p>
            `;
            break;
        case 'obese-3':
            categoryText = 'Ожирение III степени';
            categoryClass = 'category-obese-3';
            infoHTML = `
                <h3>Ожирение III степени (морбидное ожирение)</h3>
                <p>Ваш ИМТ указывает на ожирение III степени. Рекомендуемый диапазон веса для вашего роста и телосложения: ${idealWeightRange.min.toFixed(1)} - ${idealWeightRange.max.toFixed(1)} кг.</p>
                <p><strong>Серьезные риски для здоровья:</strong></p>
                <ul>
                    <li>Критически высокий риск сердечно-сосудистых заболеваний и внезапной смерти</li>
                    <li>Очень высокий риск диабета 2 типа и его осложнений</li>
                    <li>Тяжелая нагрузка на суставы с высоким риском инвалидизации</li>
                    <li>Высокий риск тяжелого апноэ сна и дыхательной недостаточности</li>
                    <li>Значительно повышенный риск онкологических заболеваний</li>
                    <li>Высокий риск тромбоэмболии и варикозной болезни</li>
                    <li>Серьезные психологические проблемы и социальная изоляция</li>
                </ul>
                <p><strong>Медицинское вмешательство:</strong></p>
                <ul>
                    <li>Обязательная консультация с врачом и комплексное обследование</li>
                    <li>Рассмотрение возможности бариатрической хирургии</li>
                    <li>Медикаментозная терапия под строгим наблюдением специалиста</li>
                    <li>Регулярный мониторинг жизненно важных показателей</li>
                    <li>Психологическая поддержка и терапия пищевого поведения</li>
                </ul>
                <p><strong>Специализированный план питания:</strong></p>
                <ul>
                    <li>Строго контролируемая диета под наблюдением диетолога</li>
                    <li>Возможное использование программ с очень низкой калорийностью под медицинским контролем</li>
                    <li>Исключение простых углеводов и насыщенных жиров</li>
                    <li>Контроль водного баланса и электролитов</li>
                </ul>
                <p><strong>Адаптированная физическая активность:</strong></p>
                <ul>
                    <li>Только под наблюдением специалиста по лечебной физкультуре</li>
                    <li>Начало с минимальных нагрузок: короткие прогулки, упражнения сидя или в воде</li>
                    <li>Постепенное увеличение активности по мере снижения веса</li>
                </ul>
                <p><strong>Важно:</strong> При морбидном ожирении самостоятельное снижение веса может быть опасным. Необходимо комплексное лечение под наблюдением команды специалистов, включая эндокринолога, диетолога, кардиолога и психотерапевта.</p>
            `;
            break;
    }
    
    // Add additional information based on health conditions
    if (healthConditions.diabetes) {
        infoHTML += `<p><strong>Рекомендации при диабете/преддиабете:</strong> Строгий контроль углеводов, предпочтение продуктам с низким гликемическим индексом, регулярный мониторинг уровня глюкозы в крови.</p>`;
    }
    
    if (healthConditions.hypertension) {
        infoHTML += `<p><strong>Рекомендации при гипертонии:</strong> Ограничение потребления соли до 5-6 г в день, регулярный контроль артериального давления, предпочтение продуктам, богатым калием и магнием.</p>`;
    }
    
    if (healthConditions.jointProblems) {
        infoHTML += `<p><strong>Рекомендации при проблемах с суставами:</strong> Низкоударные виды физической активности (плавание, велотренажер), упражнения на укрепление мышц вокруг суставов, контроль веса для снижения нагрузки.</p>`;
    }
    
    if (healthConditions.heartProblems) {
        infoHTML += `<p><strong>Рекомендации при сердечно-сосудистых заболеваниях:</strong> Ограничение насыщенных жиров, предпочтение омега-3 жирным кислотам, умеренные кардионагрузки после консультации с кардиологом.</p>`;
    }
    
    if (gender === 'female') {
        infoHTML += `<p>У женщин естественно более высокий процент жира в организме, чем у мужчин. При оценке ИМТ важно учитывать и другие факторы, такие как распределение жира в организме.</p>`;
    }
    
    // Update DOM elements
    bmiCategoryElement.textContent = categoryText;
    bmiCategoryElement.className = 'bmi-category ' + categoryClass;
    bmiInfoElement.innerHTML = infoHTML;
}
