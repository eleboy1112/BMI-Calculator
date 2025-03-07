document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const genderSelect = document.getElementById('gender');
    const ageInput = document.getElementById('age');
    const activitySelect = document.getElementById('activity');
    const bodyTypeSelect = document.getElementById('body-type');
    const diabetesCheckbox = document.getElementById('health-diabetes');
    const hypertensionCheckbox = document.getElementById('health-hypertension');
    const jointCheckbox = document.getElementById('health-joint');
    const heartCheckbox = document.getElementById('health-heart');
    const calculateBtn = document.getElementById('calculate-btn');
    const bmiValueElement = document.getElementById('bmi-value');
    const bmiCategoryElement = document.getElementById('bmi-category');
    const bmiInfoElement = document.getElementById('bmi-info');
    
    // Add event listener to the calculate button
    calculateBtn.addEventListener('click', calculateBMI);
    
    // Add event listeners for Enter key press on inputs
    [heightInput, weightInput, ageInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateBMI();
            }
        });
    });
    
    // Function to calculate BMI
    function calculateBMI() {
        // Get input values
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);
        const gender = genderSelect.value;
        const age = parseInt(ageInput.value);
        const activity = activitySelect.value;
        const bodyType = bodyTypeSelect.value;
        
        // Get health conditions
        const hasDiabetes = diabetesCheckbox.checked;
        const hasHypertension = hypertensionCheckbox.checked;
        const hasJointProblems = jointCheckbox.checked;
        const hasHeartProblems = heartCheckbox.checked;
        
        // Calculate body frame size based on height and body type
        const bodyFrame = calculateBodyFrame(height, bodyType);
        
        // Calculate ideal weight range based on height, gender, and frame
        const idealWeightRange = calculateIdealWeightRange(height, gender, bodyFrame);
        
        // Validate inputs
        if (!height || height < 50 || height > 250) {
            showError('Пожалуйста, введите корректный рост (50-250 см)');
            return;
        }
        
        if (!weight || weight < 20 || weight > 300) {
            showError('Пожалуйста, введите корректный вес (20-300 кг)');
            return;
        }
        
        if (!age || age < 1 || age > 120) {
            showError('Пожалуйста, введите корректный возраст (1-120 лет)');
            return;
        }
        
        // Convert height from cm to m and calculate BMI
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        
        // Display BMI value (rounded to 1 decimal place)
        bmiValueElement.textContent = bmi.toFixed(1);
        
        // Determine BMI category and display appropriate information
        const category = getBMICategory(bmi, age, activity, bodyType, {
            diabetes: hasDiabetes,
            hypertension: hasHypertension,
            jointProblems: hasJointProblems,
            heartProblems: hasHeartProblems
        });
        displayBMICategory(category, bmi, gender, age, activity, bodyType, {
            diabetes: hasDiabetes,
            hypertension: hasHypertension,
            jointProblems: hasJointProblems,
            heartProblems: hasHeartProblems
        }, idealWeightRange);
        
        // Add fade-in animation to result section
        const resultSection = document.getElementById('result-section');
        resultSection.classList.add('fade-in');
        
        // Highlight the marker on the BMI scale
        highlightBMIScale(bmi);
    }
    
    // Function to determine BMI category
    function getBMICategory(bmi, age, activity, bodyType, healthConditions) {
        // Adjust BMI thresholds based on age and other factors
        let thresholds = getAgeAdjustedThresholds(age, activity, bodyType, healthConditions);
        
        if (bmi < thresholds.severeUnderweight) return 'severe-underweight';
        if (bmi < thresholds.underweight) return 'underweight';
        if (bmi < thresholds.normal) return 'normal';
        if (bmi < thresholds.overweight) return 'overweight';
        if (bmi < thresholds.obese1) return 'obese-1';
        if (bmi < thresholds.obese2) return 'obese-2';
        return 'obese-3';
    }

    function getAgeAdjustedThresholds(age, activity, bodyType, healthConditions) {
        // Default adult thresholds
        let thresholds = {
            severeUnderweight: 16,
            underweight: 18.5,
            normal: 25,
            overweight: 30,
            obese1: 35,
            obese2: 40
        };
        
        // Extract health conditions
        const hasDiabetes = healthConditions.diabetes;
        const hasHypertension = healthConditions.hypertension;
        const hasJointProblems = healthConditions.jointProblems;
        const hasHeartProblems = healthConditions.heartProblems;
        
        // Adjust thresholds based on activity level
        let activityFactor = 1.0;
        switch(activity) {
            case 'very_high':
                activityFactor = 1.2;
                break;
            case 'high':
                activityFactor = 1.15;
                break;
            case 'moderate':
                activityFactor = 1.1;
                break;
            case 'light':
                activityFactor = 1.05;
                break;
            default: // sedentary
                activityFactor = 1.0;
        }
        
        // Adjust thresholds based on body type
        let bodyTypeFactor = 1.0;
        switch(bodyType) {
            case 'ectomorph':
                bodyTypeFactor = 0.95;
                break;
            case 'endomorph':
                bodyTypeFactor = 1.1;
                break;
            default: // mesomorph
                bodyTypeFactor = 1.0;
        }
        
        // Apply activity and body type adjustments
        Object.keys(thresholds).forEach(key => {
            thresholds[key] *= (activityFactor * bodyTypeFactor);
        });
        
        // Further adjust thresholds for health conditions
        if (hasDiabetes || hasHypertension || hasHeartProblems) {
            // Lower thresholds for people with metabolic/cardiovascular conditions
            Object.keys(thresholds).forEach(key => {
                thresholds[key] *= 0.95;
            });
        }
        
        if (hasJointProblems) {
            // Lower overweight/obese thresholds for people with joint problems
            thresholds.overweight *= 0.95;
            thresholds.obese1 *= 0.95;
            thresholds.obese2 *= 0.95;
        }
        
        // Adjust thresholds for elderly (65+)
        if (age >= 65) {
            thresholds.underweight = 22 * (activityFactor * bodyTypeFactor);
            thresholds.normal = 27 * (activityFactor * bodyTypeFactor);
            thresholds.overweight = 32 * (activityFactor * bodyTypeFactor);
        }
        // Adjust thresholds for youth (under 18)
        else if (age < 18) {
            thresholds.underweight = 17 * (activityFactor * bodyTypeFactor);
            thresholds.normal = 23 * (activityFactor * bodyTypeFactor);
            thresholds.overweight = 28 * (activityFactor * bodyTypeFactor);
        }
        
        return thresholds;
    }

    function calculateBodyFrame(height, bodyType) {
        // Calculate body frame based on height and body type
        let frame = 'medium';
        
        // Adjust frame based on body type
        if (bodyType === 'ectomorph') {
            if (height < 170) return 'small';
            if (height > 185) return 'medium';
            return 'small';
        } else if (bodyType === 'endomorph') {
            if (height < 165) return 'medium';
            if (height > 180) return 'large';
            return 'large';
        } else { // mesomorph
            if (height < 160) return 'small';
            if (height > 180) return 'large';
            return 'medium';
        }
    }

    function calculateIdealWeightRange(height, gender, frame) {
        // Height in meters
        const heightM = height / 100;
        
        // Base calculation using Hamwi formula
        let baseWeight = gender === 'male' 
            ? 48 + 2.7 * (height - 152.4) / 2.54
            : 45.5 + 2.2 * (height - 152.4) / 2.54;
        
        // Adjust for frame size
        let range = {
            min: baseWeight,
            max: baseWeight
        };
        
        switch(frame) {
            case 'small':
                range.min -= 10;
                range.max -= 5;
                break;
            case 'large':
                range.min += 5;
                range.max += 10;
                break;
        }
        
        return range;
    }
    
    // Function to display BMI category and information
    function displayBMICategory(category, bmi, gender, age, activity, bodyType, healthConditions, idealWeightRange) {
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
                        <li>Разработка индивидуального плана питания с диетологом (рекомендуемый дефицит калорий: 750-1000 ккал/день)</li>
                        <li>Программа физической активности под наблюдением специалиста, начиная с низкоинтенсивных нагрузок</li>
                        <li>Рассмотрение возможности медикаментозной терапии ожирения (по назначению врача)</li>
                        <li>Психологическая поддержка для изменения пищевого поведения и образа жизни</li>
                    </ul>
                    <p><strong>Рекомендации по питанию:</strong></p>
                    <ul>
                        <li>Целевая калорийность: ${Math.round((gender === 'male' ? 2500 : 2000) * (age < 30 ? 0.95 : age > 60 ? 0.75 : 0.8) - 1000)} ккал в день под наблюдением специалиста</li>
                        <li>Высокое потребление белка: ${Math.round(idealWeightRange.min * 2)} - ${Math.round(idealWeightRange.min * 2.2)} г в день для сохранения мышечной массы</li>
                        <li>Строгое ограничение простых углеводов и продуктов с высоким гликемическим индексом</li>
                        <li>Дробное питание: 4-5 приемов пищи небольшими порциями</li>
                        <li>Контроль водного баланса: не менее ${Math.round(idealWeightRange.min * 0.035 * 100) / 100} л воды в день</li>
                    </ul>
                    <p><strong>Начальная программа физической активности:</strong></p>
                    <ul>
                        <li>Ежедневная ходьба, начиная с ${age < 50 ? '15-20' : '10-15'} минут, постепенно увеличивая до 30-45 минут</li>
                        <li>Водные виды активности (плавание, аквааэробика) для снижения нагрузки на суставы</li>
                        <li>Легкие силовые упражнения под наблюдением специалиста ${age < 60 ? '2 раза в неделю' : '1-2 раза в неделю'}</li>
                        <li>Упражнения на гибкость и равновесие для улучшения подвижности</li>
                    </ul>
                    <p><strong>Важно:</strong> При ожирении II степени настоятельно рекомендуется медицинское наблюдение. Самостоятельное снижение веса без контроля специалистов может быть небезопасным. Реалистичная цель: снижение веса на 15-20% (${Math.round(weight * 0.15)} - ${Math.round(weight * 0.2)} кг) в течение 12-18 месяцев.</p>
                `;
                break;
            case 'obese-3':
                categoryText = 'Ожирение III степени';
                categoryClass = 'category-obese-3';
                infoHTML = `
                    <h3>Ожирение III степени (морбидное ожирение)</h3>
                    <p>Ваш ИМТ указывает на ожирение III степени, что связано с крайне высоким риском для здоровья и требует немедленного медицинского вмешательства.</p>
                    <p><strong>Критические риски для здоровья:</strong></p>
                    <ul>
                        <li>Экстремально высокий риск сердечно-сосудистых катастроф (инфаркт, инсульт)</li>
                        <li>Тяжелые метаболические нарушения и высокая вероятность диабета с осложнениями</li>
                        <li>Тяжелая дыхательная недостаточность и синдром обструктивного апноэ сна</li>
                        <li>Высокий риск тромбоэмболических осложнений</li>
                        <li>Выраженные дегенеративные изменения опорно-двигательного аппарата</li>
                        <li>Значительно повышенный риск онкологических заболеваний</li>
                        <li>${gender === 'female' ? 'Серьезные нарушения репродуктивной функции и высокий риск осложнений при беременности' : 'Выраженные гормональные нарушения и сексуальная дисфункция'}</li>
                    </ul>
                    <p><strong>Необходимые медицинские меры:</strong></p>
                    <ul>
                        <li>Срочная консультация с врачом-эндокринологом и кардиологом</li>
                        <li>Комплексное обследование всех систем организма</li>
                        <li>Разработка индивидуальной программы снижения веса под строгим медицинским контролем</li>
                        <li>Рассмотрение возможности медикаментозной терапии ожирения</li>
                        <li>Оценка показаний к бариатрической хирургии (хирургическое лечение ожирения)</li>
                        <li>Психологическая поддержка и когнитивно-поведенческая терапия</li>
                    </ul>
                    <p><strong>Важно:</strong> При морбидном ожирении самостоятельное снижение веса без медицинского наблюдения может быть опасным для жизни. Необходимо немедленно обратиться к специалистам для разработки комплексного плана лечения.</p>
                    <p><strong>Первые шаги:</strong> Запишитесь на консультацию к эндокринологу или в центр лечения ожирения. До консультации с врачом рекомендуется:</p>
                    <ul>
                        <li>Начать вести дневник питания</li>
                        <li>Увеличить потребление воды</li>
                        <li>Начать очень легкую физическую активность (короткие прогулки) при отсутствии противопоказаний</li>
                        <li>Исключить из рациона сладкие напитки, фастфуд и высококалорийные снеки</li>
                    </ul>
                `;
                break;
        }
        
        // Add age and gender specific advice
        if (age < 18) {
            infoHTML += `<p><strong>Важно:</strong> ИМТ для детей и подростков интерпретируется иначе, чем для взрослых. Для точной оценки необходима консультация педиатра.</p>`;
        } else if (age > 65) {
            infoHTML += `<p><strong>Важно:</strong> Для пожилых людей нормальный диапазон ИМТ может быть немного выше (23-28). Проконсультируйтесь с врачом для индивидуальной оценки.</p>`;
        }
        
        if (gender === 'female') {
            infoHTML += `<p>У женщин естественно более высокий процент жира в организме, чем у мужчин. При оценке ИМТ важно учитывать и другие факторы, такие как распределение жира в организме.</p>`;
        }
        
        // Update DOM elements
        bmiCategoryElement.textContent = categoryText;
        bmiCategoryElement.className = 'bmi-category ' + categoryClass;
        bmiInfoElement.innerHTML = infoHTML;
    }
    
    // Function to show error message
    function showError(message) {
        bmiValueElement.textContent = '--';
        bmiCategoryElement.textContent = 'Ошибка';
        bmiCategoryElement.className = 'bmi-category';
        bmiInfoElement.innerHTML = `<p class="error-message">${message}</p>`;
    }
    
    // Function to highlight the BMI scale
    function highlightBMIScale(bmi) {
        const scaleBar = document.querySelector('.scale-bar');
        const scaleWidth = scaleBar.offsetWidth;
        
        // Remove existing marker if any
        const existingMarker = document.querySelector('.bmi-marker');
        if (existingMarker) {
            existingMarker.remove();
        }
        
        // Create marker element
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
        
        // Calculate marker position
        let position;
        if (bmi < 16) {
            position = (16 - 16) / (40 - 16) * scaleWidth;
        } else if (bmi > 40) {
            position = scaleWidth;
        } else {
            position = (bmi - 16) / (40 - 16) * scaleWidth;
        }
        
        marker.style.left = `${position}px`;
        
        // Add value tooltip
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
        
        // Animate tooltip
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 100);
        
        // Add hover effect
        marker.addEventListener('mouseenter', () => {
            marker.style.height = '35px';
            tooltip.style.bottom = '35px';
        });
        
        marker.addEventListener('mouseleave', () => {
            marker.style.height = '30px';
            tooltip.style.bottom = '30px';
        });
    }
});
