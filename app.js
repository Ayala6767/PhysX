// ======================================================
// PHYSX 2.0
// Виртуальная лаборатория механики
// ======================================================


// ======================================================
// CANVAS
// ======================================================

const canvas =
    document.getElementById("simulationCanvas");

const ctx =
    canvas.getContext("2d");

const graphCanvas =
    document.getElementById("graphCanvas");

const graphCtx =
    graphCanvas.getContext("2d");


// ======================================================
// STATE
// ======================================================

const state = {

    experiment: "projectile",

    xp:
        Number(localStorage.getItem("physx_xp")) || 0,

    experiments:
        JSON.parse(
            localStorage.getItem("physx_experiments")
            || "{}"
        ),

    achievements:
        JSON.parse(
            localStorage.getItem("physx_achievements")
            || "{}"
        ),

    projectileHistory: [],

    pendulumHistory: [],

    hypothesis: null,

    animation: null
};


// ======================================================
// ACHIEVEMENTS
// ======================================================

const achievementData = {

    first: {
        icon: "🔬",
        title: "Первый эксперимент",
        description:
            "Проведи свой первый эксперимент.",
        xp: 50
    },

    hypothesis: {
        icon: "🔮",
        title: "Исследователь",
        description:
            "Сделай прогноз перед экспериментом.",
        xp: 50
    },

    five: {
        icon: "🧪",
        title: "Юный исследователь",
        description:
            "Проведи 5 экспериментов.",
        xp: 100
    },

    analyst: {
        icon: "📊",
        title: "Аналитик",
        description:
            "Проведи эксперименты с разными параметрами.",
        xp: 100
    },

    conclusion: {
        icon: "🧠",
        title: "Научный вывод",
        description:
            "Сформулируй собственный вывод.",
        xp: 100
    },

    mechanic: {
        icon: "⚙️",
        title: "Механик",
        description:
            "Проведи эксперименты в двух разделах.",
        xp: 150
    }
};


// ======================================================
// EXPERIMENT DEFINITIONS
// ======================================================

const experiments = {

    projectile: {

        title:
            "🏀 Бросок тела под углом",

        hypothesis:
            "Какой угол броска даст наибольшую дальность при одинаковой начальной скорости?",

        options:
            ["30°", "45°", "60°", "90°"],

        controls: [

            {
                id: "speed",
                label: "Начальная скорость",
                min: 5,
                max: 40,
                value: 20,
                step: 1,
                unit: "м/с"
            },

            {
                id: "angle",
                label: "Угол броска",
                min: 5,
                max: 85,
                value: 45,
                step: 1,
                unit: "°"
            },

            {
                id: "height",
                label: "Начальная высота",
                min: 0,
                max: 15,
                value: 2,
                step: .5,
                unit: "м"
            }

        ]

    },


    pendulum: {

        title:
            "🪀 Исследование маятника",

        hypothesis:
            "Как изменится период маятника, если увеличить длину нити?",

        options:
            ["Увеличится", "Уменьшится", "Не изменится"],

        controls: [

            {
                id: "length",
                label: "Длина нити",
                min: 0.2,
                max: 3,
                value: 1,
                step: .1,
                unit: "м"
            },

            {
                id: "mass",
                label: "Масса груза",
                min: 0.1,
                max: 2,
                value: 0.5,
                step: .1,
                unit: "кг"
            },

            {
                id: "pendulumAngle",
                label: "Угол отклонения",
                min: 5,
                max: 45,
                value: 20,
                step: 1,
                unit: "°"
            }

        ]

    }

};


// ======================================================
// DOM
// ======================================================

const xpElement =
    document.getElementById("xp");

const controlsContent =
    document.getElementById("controlsContent");

const hypothesisOptions =
    document.getElementById("hypothesisOptions");

const experimentTitle =
    document.getElementById("experimentTitle");

const hypothesisText =
    document.getElementById("hypothesisText");

const launchButton =
    document.getElementById("launchButton");

const resetButton =
    document.getElementById("resetButton");

const resultGrid =
    document.getElementById("resultGrid");

const experimentHistory =
    document.getElementById("experimentHistory");

const conclusionInput =
    document.getElementById("conclusionInput");

const conclusionResult =
    document.getElementById("conclusionResult");

const notification =
    document.getElementById("notification");


// ======================================================
// INIT
// ======================================================

xpElement.textContent = state.xp;

renderExperiment();

renderAchievements();

resizeCanvases();

window.addEventListener(
    "resize",
    resizeCanvases
);


// ======================================================
// EXPERIMENT SWITCHING
// ======================================================

document
    .querySelectorAll(".experiment-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".experiment-card"
                    )
                    .forEach(c =>
                        c.classList.remove("active")
                    );

                card.classList.add("active");

                state.experiment =
                    card.dataset.experiment;

                state.hypothesis = null;

                renderExperiment();

                drawInitialScene();

            }
        );

    });


// ======================================================
// RENDER EXPERIMENT
// ======================================================

function renderExperiment() {

    const experiment =
        experiments[state.experiment];

    experimentTitle.textContent =
        experiment.title;

    hypothesisText.textContent =
        experiment.hypothesis;

    renderHypothesis();

    renderControls();

    renderHistory();

    resultGrid.innerHTML = "";

    conclusionResult.innerHTML = "";

    conclusionInput.value = "";

    document.getElementById(
        "simulationInfo"
    ).textContent =
        state.experiment === "projectile"
            ? "g = 9.81 м/с²"
            : "g = 9.81 м/с²";

}


// ======================================================
// HYPOTHESIS
// ======================================================

function renderHypothesis() {

    hypothesisOptions.innerHTML = "";

    experiments[state.experiment]
        .options
        .forEach(option => {

            const button =
                document.createElement("button");

            button.className =
                "hypothesis-option";

            button.textContent =
                option;

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".hypothesis-option"
                        )
                        .forEach(btn =>
                            btn.classList.remove(
                                "selected"
                            )
                        );

                    button.classList.add("selected");

                    state.hypothesis =
                        option;

                    unlockAchievement(
                        "hypothesis"
                    );

                }
            );

            hypothesisOptions.appendChild(
                button
            );

        });
}


// ======================================================
// CONTROLS
// ======================================================

function renderControls() {

    controlsContent.innerHTML = "";

    experiments[state.experiment]
        .controls
        .forEach(control => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "control";

            wrapper.innerHTML = `

                <div class="control-top">

                    <span class="control-label">
                        ${control.label}
                    </span>

                    <span
                        class="control-value"
                        id="value-${control.id}"
                    >
                        ${control.value}
                        ${control.unit}
                    </span>

                </div>

                <input
                    type="range"
                    id="${control.id}"
                    min="${control.min}"
                    max="${control.max}"
                    step="${control.step}"
                    value="${control.value}"
                >

            `;

            controlsContent.appendChild(
                wrapper
            );


            const input =
                wrapper.querySelector(
                    "input"
                );

            const value =
                wrapper.querySelector(
                    ".control-value"
                );

            input.addEventListener(
                "input",
                () => {

                    value.textContent =
                        `${input.value} ${control.unit}`;

                }
            );

        });
}


// ======================================================
// LAUNCH
// ======================================================

launchButton.addEventListener(
    "click",
    () => {

        if (state.experiment === "projectile") {

            runProjectile();

        } else {

            runPendulum();

        }

    }
);


// ======================================================
// PROJECTILE PHYSICS
// ======================================================

function calculateProjectile(
    speed,
    angle,
    startHeight
) {

    const g = 9.81;

    const radians =
        angle * Math.PI / 180;

    const vx =
        speed * Math.cos(radians);

    const vy =
        speed * Math.sin(radians);


    const time =
        (
            vy +
            Math.sqrt(
                vy * vy +
                2 * g * startHeight
            )
        ) / g;


    const range =
        vx * time;


    const maxHeight =
        startHeight +
        (vy * vy) /
        (2 * g);


    return {

        speed,
        angle,
        startHeight,

        vx,
        vy,

        time,
        range,
        maxHeight

    };

}


// ======================================================
// RUN PROJECTILE
// ======================================================

function runProjectile() {

    const speed =
        Number(
            document.getElementById("speed").value
        );

    const angle =
        Number(
            document.getElementById("angle").value
        );

    const height =
        Number(
            document.getElementById("height").value
        );


    const result =
        calculateProjectile(
            speed,
            angle,
            height
        );


    state.projectileHistory.push(
        result
    );


    saveExperiments();


    addXP(25);


    unlockAchievement(
        "first"
    );


    if (
        totalExperiments() >= 5
    ) {

        unlockAchievement(
            "five"
        );

    }


    if (
        state.projectileHistory.length >= 3
    ) {

        const angles =
            new Set(
                state.projectileHistory
                    .map(item => item.angle)
            );

        if (angles.size >= 3) {

            unlockAchievement(
                "analyst"
            );

        }

    }


    showProjectileResults(
        result
    );


    renderHistory();


    animateProjectile(
        result
    );

}


// ======================================================
// PROJECTILE ANIMATION
// ======================================================

function animateProjectile(result) {

    if (state.animation) {

        cancelAnimationFrame(
            state.animation
        );

    }


    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    const ground =
        height - 45;


    const startX =
        55;


    const scaleX =
        (width - 100) /
        Math.max(result.range, 20);


    const scaleY =
        (ground - 45) /
        Math.max(result.maxHeight, 10);


    const startTime =
        performance.now();


    function frame(now) {

        const elapsed =
            (now - startTime) / 1000;


        const t =
            Math.min(
                elapsed,
                result.time
            );


        const x =
            result.vx * t;


        const y =
            result.startHeight +
            result.vy * t -
            .5 * 9.81 * t * t;


        drawProjectileScene(
            result,
            t,
            scaleX,
            scaleY,
            startX
        );


        if (
            elapsed < result.time
        ) {

            state.animation =
                requestAnimationFrame(
                    frame
                );

        }

    }


    state.animation =
        requestAnimationFrame(
            frame
        );

}


// ======================================================
// DRAW PROJECTILE
// ======================================================

function drawProjectileScene(
    result,
    t,
    scaleX,
    scaleY,
    startX
) {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;

    const ground =
        height - 45;


    drawBackground();


    // trajectory

    ctx.beginPath();

    ctx.setLineDash(
        [6, 6]
    );

    ctx.strokeStyle =
        "rgba(91,140,255,.4)";

    ctx.lineWidth = 2;


    for (
        let i = 0;
        i <= 100;
        i++
    ) {

        const time =
            result.time * i / 100;


        const x =
            result.vx * time;


        const y =
            result.startHeight +
            result.vy * time -
            .5 * 9.81 * time * time;


        const sx =
            startX +
            x * scaleX;


        const sy =
            ground -
            y * scaleY;


        if (i === 0) {

            ctx.moveTo(
                sx,
                sy
            );

        } else {

            ctx.lineTo(
                sx,
                sy
            );

        }

    }

    ctx.stroke();

    ctx.setLineDash([]);


    // ball

    const x =
        result.vx * t;

    const y =
        result.startHeight +
        result.vy * t -
        .5 * 9.81 * t * t;


    const sx =
        startX +
        x * scaleX;


    const sy =
        ground -
        y * scaleY;


    drawBall(
        sx,
        sy
    );


    // vector

    ctx.strokeStyle =
        "#35d39a";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        sx,
        sy
    );

    ctx.lineTo(
        sx + result.vx * 2,
        sy - result.vy * 2
    );

    ctx.stroke();

}


// ======================================================
// DRAW BALL
// ======================================================

function drawBall(
    x,
    y
) {

    const gradient =
        ctx.createRadialGradient(
            x - 4,
            y - 4,
            2,
            x,
            y,
            13
        );


    gradient.addColorStop(
        0,
        "#ffffff"
    );

    gradient.addColorStop(
        .3,
        "#88a9ff"
    );

    gradient.addColorStop(
        1,
        "#4c6fe8"
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// ======================================================
// PROJECTILE RESULTS
// ======================================================

function showProjectileResults(
    result
) {

    resultGrid.innerHTML = `

        <div class="result">

            <small>Дальность</small>

            <strong>
                ${result.range.toFixed(2)}
                <span>м</span>
            </strong>

        </div>


        <div class="result">

            <small>Время полёта</small>

            <strong>
                ${result.time.toFixed(2)}
                <span>с</span>
            </strong>

        </div>


        <div class="result">

            <small>Макс. высота</small>

            <strong>
                ${result.maxHeight.toFixed(2)}
                <span>м</span>
            </strong>

        </div>


        <div class="result">

            <small>Угол</small>

            <strong>
                ${result.angle}
                <span>°</span>
            </strong>

        </div>

    `;


    drawProjectileGraph(
        result
    );


    updateConclusion(
        "Сравни несколько бросков с разными углами. Как угол влияет на дальность?"
    );

}


// ======================================================
// PROJECTILE GRAPH
// ======================================================

function drawProjectileGraph(
    result
) {

    clearGraph();


    const width =
        graphCanvas.clientWidth;

    const height =
        graphCanvas.clientHeight;


    const padding = 35;


    graphCtx.strokeStyle =
        "rgba(255,255,255,.15)";

    graphCtx.lineWidth = 1;


    graphCtx.beginPath();

    graphCtx.moveTo(
        padding,
        10
    );

    graphCtx.lineTo(
        padding,
        height - padding
    );

    graphCtx.lineTo(
        width - 10,
        height - padding
    );

    graphCtx.stroke();


    graphCtx.strokeStyle =
        "#5b8cff";

    graphCtx.lineWidth = 3;

    graphCtx.beginPath();


    for (
        let i = 0;
        i <= 100;
        i++
    ) {

        const t =
            result.time * i / 100;


        const y =
            result.startHeight +
            result.vy * t -
            .5 * 9.81 * t * t;


        const x =
            padding +
            (
                width -
                padding -
                20
            ) * i / 100;


        const screenY =
            height -
            padding -
            (
                y /
                result.maxHeight
            ) *
            (
                height -
                padding -
                25
            );


        if (i === 0) {

            graphCtx.moveTo(
                x,
                screenY
            );

        } else {

            graphCtx.lineTo(
                x,
                screenY
            );

        }

    }


    graphCtx.stroke();


    graphCtx.fillStyle =
        "#7f8ca8";

    graphCtx.font =
        "11px Arial";


    graphCtx.fillText(
        "0 с",
        padding,
        height - 10
    );


    graphCtx.fillText(
        `${result.time.toFixed(1)} с`,
        width - 55,
        height - 10
    );


    graphCtx.fillText(
        `${result.maxHeight.toFixed(1)} м`,
        5,
        15
    );

}


// ======================================================
// PENDULUM
// ======================================================

function calculatePendulum(
    length,
    mass,
    angle
) {

    const g = 9.81;


    const period =
        2 *
        Math.PI *
        Math.sqrt(
            length / g
        );


    return {

        length,
        mass,
        angle,

        period,

        frequency:
            1 / period

    };

}


// ======================================================
// RUN PENDULUM
// ======================================================

function runPendulum() {

    const length =
        Number(
            document.getElementById(
                "length"
            ).value
        );


    const mass =
        Number(
            document.getElementById(
                "mass"
            ).value
        );


    const angle =
        Number(
            document.getElementById(
                "pendulumAngle"
            ).value
        );


    const result =
        calculatePendulum(
            length,
            mass,
            angle
        );


    state.pendulumHistory.push(
        result
    );


    saveExperiments();


    addXP(25);


    unlockAchievement(
        "first"
    );


    if (
        state.pendulumHistory.length >= 3
    ) {

        unlockAchievement(
            "analyst"
        );

    }


    showPendulumResults(
        result
    );


    renderHistory();


    animatePendulum(
        result
    );

}


// ======================================================
// PENDULUM ANIMATION
// ======================================================

function animatePendulum(
    result
) {

    if (state.animation) {

        cancelAnimationFrame(
            state.animation
        );

    }


    const start =
        performance.now();


    function frame(now) {

        const elapsed =
            (now - start) / 1000;


        const angle =
            result.angle *
            Math.PI / 180;


        const currentAngle =
            angle *
            Math.cos(
                2 *
                Math.PI *
                elapsed /
                result.period
            );


        drawPendulum(
            result,
            currentAngle
        );


        if (elapsed < 8) {

            state.animation =
                requestAnimationFrame(
                    frame
                );

        }

    }


    state.animation =
        requestAnimationFrame(
            frame
        );

}


// ======================================================
// DRAW PENDULUM
// ======================================================

function drawPendulum(
    result,
    angle
) {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.fillStyle =
        "#091121";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    const centerX =
        width / 2;

    const topY = 65;


    const maxLength =
        Math.min(
            height - 130,
            330
        );


    const scale =
        maxLength / 3;


    const length =
        result.length * scale;


    const x =
        centerX +
        Math.sin(angle) * length;


    const y =
        topY +
        Math.cos(angle) * length;


    // ceiling

    ctx.strokeStyle =
        "#5b8cff";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(
        centerX - 100,
        topY
    );

    ctx.lineTo(
        centerX + 100,
        topY
    );

    ctx.stroke();


    // string

    ctx.strokeStyle =
        "#8fa7d9";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        topY
    );

    ctx.lineTo(
        x,
        y
    );

    ctx.stroke();


    // bob

    const gradient =
        ctx.createRadialGradient(
            x - 5,
            y - 5,
            2,
            x,
            y,
            18
        );


    gradient.addColorStop(
        0,
        "#ffffff"
    );

    gradient.addColorStop(
        .3,
        "#75a0ff"
    );

    gradient.addColorStop(
        1,
        "#4c6fe8"
    );


    ctx.fillStyle =
        gradient;


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        18,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // info

    ctx.fillStyle =
        "#7f8ca8";

    ctx.font =
        "13px Arial";


    ctx.fillText(
        `Длина: ${result.length.toFixed(1)} м`,
        25,
        30
    );


    ctx.fillText(
        `Период: ${result.period.toFixed(2)} с`,
        25,
        50
    );

}


// ======================================================
// PENDULUM RESULTS
// ======================================================

function showPendulumResults(
    result
) {

    resultGrid.innerHTML = `

        <div class="result">

            <small>Период</small>

            <strong>
                ${result.period.toFixed(2)}
                <span>с</span>
            </strong>

        </div>


        <div class="result">

            <small>Частота</small>

            <strong>
                ${result.frequency.toFixed(2)}
                <span>Гц</span>
            </strong>

        </div>


        <div class="result">

            <small>Длина</small>

            <strong>
                ${result.length.toFixed(2)}
                <span>м</span>
            </strong>

        </div>


        <div class="result">

            <small>Масса</small>

            <strong>
                ${result.mass.toFixed(2)}
                <span>кг</span>
            </strong>

        </div>

    `;


    drawPendulumGraph(
        result
    );


    updateConclusion(
        "Сравни маятники разной длины. Как длина нити влияет на период?"
    );

}


// ======================================================
// PENDULUM GRAPH
// ======================================================

function drawPendulumGraph(
    current
) {

    clearGraph();


    const width =
        graphCanvas.clientWidth;

    const height =
        graphCanvas.clientHeight;


    const history =
        state.pendulumHistory;


    const maxLength =
        Math.max(
            ...history.map(
                x => x.length
            ),
            1
        );


    const maxPeriod =
        Math.max(
            ...history.map(
                x => x.period
            ),
            1
        );


    graphCtx.strokeStyle =
        "rgba(255,255,255,.15)";

    graphCtx.lineWidth = 1;


    graphCtx.beginPath();

    graphCtx.moveTo(
        40,
        10
    );

    graphCtx.lineTo(
        40,
        height - 30
    );

    graphCtx.lineTo(
        width - 10,
        height - 30
    );

    graphCtx.stroke();


    graphCtx.strokeStyle =
        "#35d39a";

    graphCtx.lineWidth = 3;

    graphCtx.beginPath();


    history.forEach(
        (item, index) => {

            const x =
                40 +
                (
                    width -
                    55
                ) *
                item.length /
                maxLength;


            const y =
                height -
                30 -
                (
                    height -
                    45
                ) *
                item.period /
                maxPeriod;


            if (index === 0) {

                graphCtx.moveTo(
                    x,
                    y
                );

            } else {

                graphCtx.lineTo(
                    x,
                    y
                );

            }

            graphCtx.fillStyle =
                "#35d39a";

            graphCtx.beginPath();

            graphCtx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            graphCtx.fill();

        }
    );


    graphCtx.stroke();


    graphCtx.fillStyle =
        "#7f8ca8";

    graphCtx.font =
        "11px Arial";


    graphCtx.fillText(
        "Длина",
        width - 45,
        height - 10
    );


    graphCtx.fillText(
        "Период",
        5,
        15
    );

}


// ======================================================
// HISTORY
// ======================================================

function renderHistory() {

    const history =
        state.experiment === "projectile"
            ? state.projectileHistory
            : state.pendulumHistory;


    if (!history.length) {

        experimentHistory.innerHTML = `

            <div class="empty-history">

                Проведи первый эксперимент,
                чтобы увидеть результаты здесь.

            </div>

        `;

        return;
    }


    experimentHistory.innerHTML = "";


    history.forEach(
        (item, index) => {

            const row =
                document.createElement("div");

            row.className =
                "history-row";


            if (
                state.experiment ===
                "projectile"
            ) {

                row.innerHTML = `

                    <div class="history-number">
                        #${index + 1}
                    </div>

                    <div>
                        Угол:
                        <strong>
                            ${item.angle}°
                        </strong>
                    </div>

                    <div>
                        Дальность:
                        <strong>
                            ${item.range.toFixed(2)} м
                        </strong>
                    </div>

                    <div>
                        Время:
                        <strong>
                            ${item.time.toFixed(2)} с
                        </strong>
                    </div>

                `;

            } else {

                row.innerHTML = `

                    <div class="history-number">
                        #${index + 1}
                    </div>

                    <div>
                        Длина:
                        <strong>
                            ${item.length.toFixed(1)} м
                        </strong>
                    </div>

                    <div>
                        Период:
                        <strong>
                            ${item.period.toFixed(2)} с
                        </strong>
                    </div>

                    <div>
                        Масса:
                        <strong>
                            ${item.mass.toFixed(1)} кг
                        </strong>
                    </div>

                `;

            }


            experimentHistory.appendChild(
                row
            );

        }
    );

}


// ======================================================
// CONCLUSION
// ======================================================

function updateConclusion(
    question
) {

    document.getElementById(
        "conclusionQuestion"
    ).textContent =
        question;

}


document
    .getElementById("checkConclusion")
    .addEventListener(
        "click",
        checkConclusion
    );


function checkConclusion() {

    const text =
        conclusionInput
            .value
            .trim();


    if (
        text.length < 15
    ) {

        conclusionResult.innerHTML = `
            <span style="color:#ff657d">
                Попробуй написать более подробный вывод.
            </span>
        `;

        return;
    }


    unlockAchievement(
        "conclusion"
    );


    const lower =
        text.toLowerCase();


    let message =
        "Хороший вывод! Ты сформулировал результат собственного эксперимента.";


    if (
        state.experiment === "projectile"
    ) {

        if (
            lower.includes("45") &&
            (
                lower.includes("дальн") ||
                lower.includes("максим")
            )
        ) {

            message =
                "Отлично! Ты заметил ключевую закономерность: при одинаковой высоте и скорости угол около 45° даёт большую дальность.";

        }

    }


    if (
        state.experiment === "pendulum"
    ) {

        if (
            lower.includes("длин") &&
            (
                lower.includes("увелич") ||
                lower.includes("больше")
            )
        ) {

            message =
                "Отлично! Ты обнаружил закономерность: при увеличении длины маятника его период увеличивается.";

        }

    }


    conclusionResult.innerHTML = `

        <span style="color:#35d39a">
            ✓ ${message}
        </span>

    `;

}


// ======================================================
// RESET
// ======================================================

resetButton.addEventListener(
    "click",
    () => {

        if (state.animation) {

            cancelAnimationFrame(
                state.animation
            );

        }


        renderExperiment();

        drawInitialScene();

    }
);


// ======================================================
// XP
// ======================================================

function addXP(
    amount
) {

    state.xp += amount;

    localStorage.setItem(
        "physx_xp",
        state.xp
    );


    xpElement.textContent =
        state.xp;

}


// ======================================================
// TOTAL EXPERIMENTS
// ======================================================

function totalExperiments() {

    return (
        state.projectileHistory.length +
        state.pendulumHistory.length
    );

}


// ======================================================
// ACHIEVEMENT UNLOCK
// ======================================================

function unlockAchievement(
    id
) {

    if (
        state.achievements[id]
    ) {

        return;

    }


    state.achievements[id] =
        true;


    localStorage.setItem(
        "physx_achievements",
        JSON.stringify(
            state.achievements
        )
    );


    const achievement =
        achievementData[id];


    addXP(
        achievement.xp
    );


    showNotification(
        `${achievement.icon} ${achievement.title}`,
        `+${achievement.xp} XP — ${achievement.description}`
    );


    renderAchievements();

}


// ======================================================
// ACHIEVEMENTS
// ======================================================

function renderAchievements() {

    const grid =
        document.getElementById(
            "achievementGrid"
        );


    grid.innerHTML = "";


    Object.entries(
        achievementData
    ).forEach(
        ([id, achievement]) => {

            const unlocked =
                state.achievements[id];


            const card =
                document.createElement("div");


            card.className =
                `achievement ${
                    unlocked
                        ? "unlocked"
                        : ""
                }`;


            card.innerHTML = `

                <div class="achievement-icon">
                    ${achievement.icon}
                </div>

                <h3>
                    ${achievement.title}
                </h3>

                <p>
                    ${achievement.description}
                </p>

                <span class="achievement-xp">
                    ${unlocked ? "✓ Открыто" : `+${achievement.xp} XP`}
                </span>

            `;


            grid.appendChild(
                card
            );

        }
    );

}


// ======================================================
// NOTIFICATION
// ======================================================

function showNotification(
    title,
    text
) {

    document.getElementById(
        "notificationTitle"
    ).textContent =
        title;


    document.getElementById(
        "notificationText"
    ).textContent =
        text;


    notification.classList.add(
        "show"
    );


    setTimeout(
        () => {

            notification.classList.remove(
                "show"
            );

        },
        3500
    );

}


// ======================================================
// SAVE
// ======================================================

function saveExperiments() {

    localStorage.setItem(
        "physx_experiments",
        JSON.stringify(
            {
                projectile:
                    state.projectileHistory,

                pendulum:
                    state.pendulumHistory
            }
        )
    );

}


// ======================================================
// LOAD
// ======================================================

function loadExperiments() {

    const saved =
        JSON.parse(
            localStorage.getItem(
                "physx_experiments"
            )
            || "{}"
        );


    state.projectileHistory =
        saved.projectile || [];


    state.pendulumHistory =
        saved.pendulum || [];

}


loadExperiments();


// ======================================================
// CANVAS
// ======================================================

function resizeCanvases() {

    const rect =
        canvas.getBoundingClientRect();


    canvas.width =
        rect.width *
        devicePixelRatio;

    canvas.height =
        rect.height *
        devicePixelRatio;


    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );


    const graphRect =
        graphCanvas.getBoundingClientRect();


    graphCanvas.width =
        graphRect.width *
        devicePixelRatio;

    graphCanvas.height =
        graphRect.height *
        devicePixelRatio;


    graphCtx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );


    drawInitialScene();

}


// ======================================================
// INITIAL SCENE
// ======================================================

function drawInitialScene() {

    if (
        state.experiment ===
        "projectile"
    ) {

        drawBackground();

        drawBall(
            55,
            canvas.clientHeight - 65
        );

    } else {

        drawPendulum(
            {
                length: 1,
                mass: .5,
                angle: 20,
                period:
                    2 *
                    Math.PI *
                    Math.sqrt(
                        1 / 9.81
                    )
            },

            20 * Math.PI / 180
        );

    }

}


// ======================================================
// BACKGROUND
// ======================================================

function drawBackground() {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.fillStyle =
        "#091121";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    ctx.strokeStyle =
        "rgba(255,255,255,.035)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < width;
        x += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < height;
        y += 40
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            width,
            y
        );

        ctx.stroke();

    }


    const ground =
        height - 45;


    ctx.fillStyle =
        "#111c30";

    ctx.fillRect(
        0,
        ground,
        width,
        45
    );


    ctx.strokeStyle =
        "#5b8cff";

    ctx.lineWidth = 2;


    ctx.beginPath();

    ctx.moveTo(
        0,
        ground
    );

    ctx.lineTo(
        width,
        ground
    );

    ctx.stroke();


    ctx.fillStyle =
        "#596681";

    ctx.font =
        "11px Arial";


    ctx.fillText(
        "0 м",
        20,
        ground + 25
    );

}


// ======================================================
// GRAPH CLEAR
// ======================================================

function clearGraph() {

    graphCtx.clearRect(
        0,
        0,
        graphCanvas.clientWidth,
        graphCanvas.clientHeight
    );


    graphCtx.fillStyle =
        "#091121";


    graphCtx.fillRect(
        0,
        0,
        graphCanvas.clientWidth,
        graphCanvas.clientHeight
    );

}


// ======================================================
// NAVIGATION
// ======================================================

document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".nav-btn"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );

                button.classList.add(
                    "active"
                );


                if (
                    button.dataset.page ===
                    "achievements"
                ) {

                    document
                        .getElementById(
                            "labPage"
                        )
                        .classList.add(
                            "hidden"
                        );

                    document
                        .getElementById(
                            "achievementsPage"
                        )
                        .classList.remove(
                            "hidden"
                        );

                    renderAchievements();

                } else {

                    document
                        .getElementById(
                            "achievementsPage"
                        )
                        .classList.add(
                            "hidden"
                        );

                    document
                        .getElementById(
                            "labPage"
                        )
                        .classList.remove(
                            "hidden"
                        );

                }

            }
        );

    });