let currentQuestions = [];

let timerInterval;

let timeLeft = 0;

async function generateQuiz() {

    const questionCount =
        document.getElementById("questionCount").value;

    const difficulty =
        document.getElementById("difficulty").value;

    const timeValue =
        parseInt(document.getElementById("timeValue").value);

    const timeUnit =
        document.getElementById("timeUnit").value;

    const topic =
        document.getElementById("topic").value;

    // validation
    if (

        topic.trim() === "" ||

        questionCount === "" ||

        difficulty === "" ||

        isNaN(timeValue) ||

        timeUnit === ""

    ) {

        alert("Please enter all the details");

        return;
    }

    const quizForm =
        document.getElementById("quizForm");

    const status =
        document.getElementById("status");

    // reset old data
    quizForm.innerHTML = "";

    currentQuestions = [];

    // show quiz section again
    document.getElementById("quizSection").style.display = "block";

    // hide result + solutions
    document.getElementById("resultScreen").style.display = "none";

    document.getElementById("solutionsScreen").style.display = "none";

    // hide submit button initially
    document.getElementById("submitBtn").style.display = "none";

    // clear old result values
    document.getElementById("finalScore").innerHTML = "";

    document.getElementById("greeting").innerText = "";

    document.getElementById("solutionsContainer").innerHTML = "";

    status.innerText = "⏳ Generating quiz...";

    // show loading screen
    document.getElementById("loadingScreen").style.display = "block";

    // hide quiz section while loading
    document.getElementById("quizSection").style.display = "none";

    document.getElementById("startScreen").style.display = "none";

    try {

        const res = await fetch(

            "https://quiznova-bm8b.onrender.com/generate-quiz",

            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    text: topic,

                    count: questionCount,

                    difficulty: difficulty

                })

            }

        );

        const data = await res.json();

        if (data.error) {

            status.innerText = "❌ " + data.error;

            document.getElementById("loadingScreen").style.display = "none";

            document.getElementById("startScreen").style.display = "block";

            return;
        }

        status.innerText = "✅ Quiz Generated Successfully";

        // hide loading
        document.getElementById("loadingScreen").style.display = "none";

        // show quiz
        document.getElementById("quizSection").style.display = "block";

        document.getElementById("quizForm").style.display = "block";

        currentQuestions = data.questions;

        // timer
        let totalSeconds = 0;

        if (timeUnit === "seconds") {

            totalSeconds = timeValue;
        }

        else if (timeUnit === "minutes") {

            totalSeconds = timeValue * 60;
        }

        else if (timeUnit === "hours") {

            totalSeconds = timeValue * 3600;
        }

        if (totalSeconds <= 0) {

            alert("Please enter valid quiz time");

            return;
        }

        startTimer(totalSeconds);

        // show submit button
        document.getElementById("submitBtn").style.display = "block";

        // render questions
        data.questions.forEach((q, index) => {

            let html = `
            
            <div class="question-card">

                <p>
                    ${index + 1}. ${q.question}
                </p>
            `;

            q.options.forEach(opt => {

                html += `

                    <label class="option">

                        <input 
                            type="radio" 
                            name="q${index}" 
                            value="${opt}"
                        >

                        <span>${opt}</span>

                    </label>

                `;
            });

            html += `</div>`;

            quizForm.innerHTML += html;

        });

    }

    catch (err) {

        console.log(err);

        document.getElementById("loadingScreen").style.display = "none";

        document.getElementById("startScreen").style.display = "block";

        status.innerText = "❌ Server error";

    }

}


// TIMER
function startTimer(seconds) {

    clearInterval(timerInterval);

    timeLeft = seconds;

    document.getElementById("timerBox").style.display = "flex";

    updateTimer();

    timerInterval = setInterval(() => {

        timeLeft--;

        updateTimer();

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            alert("⏰ Time is up!");

            submitQuiz();
        }

    }, 1000);

}


// UPDATE TIMER
function updateTimer() {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;

    document.getElementById("timer").innerText =

        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


// SUBMIT QUIZ
function submitQuiz() {

    clearInterval(timerInterval);

    let score = 0;

    let solutionsHTML = "";

    currentQuestions.forEach((q, index) => {

        const options =
            document.querySelectorAll(`input[name="q${index}"]`);

        let selectedValue = "";

        options.forEach(opt => {

            if (opt.checked) {

                selectedValue = opt.value;
            }

        });

        // if nothing selected
        if (selectedValue === "") {

            selectedValue = "Not Attempted";
        }

        // compare safely
        if (

            selectedValue !== "Not Attempted" &&

            selectedValue.trim().toLowerCase() ===
            q.answer.trim().toLowerCase()

        ) {

            score++;
        }

        // solution card
        solutionsHTML += `

            <div class="solution-card">

                <h3>
                    Q${index + 1}. ${q.question}
                </h3>

                <p>
                    <strong>Correct Answer:</strong>
                    ${q.answer}
                </p>

                <p>
                    <strong>Your Answer:</strong>
                    ${selectedValue}
                </p>

                <p>
                    <strong>Explanation:</strong>
                    ${q.explanation}
                </p>

            </div>

        `;

    });

    const totalQuestions =
        currentQuestions.length;

    const percentage = totalQuestions > 0

        ? Math.round((score / totalQuestions) * 100)

        : 0;

    // hide quiz
    document.getElementById("quizSection").style.display = "none";

    document.getElementById("timerBox").style.display = "none";

    // show results
    document.getElementById("resultScreen").style.display = "block";

    // update score
    document.getElementById("finalScore").innerHTML = `
    
        🎯 ${score}/${totalQuestions}
        <br>
        📊 Accuracy: ${percentage}%
    
    `;

    // greeting
    let greeting = "";

    if (percentage === 100) {

        greeting = "🏆 Outstanding Performance!";
    }

    else if (percentage >= 70) {

        greeting = "👏 Great Job!";
    }

    else if (percentage >= 40) {

        greeting = "👍 Good Try!";
    }

    else {

        greeting = "📚 Keep Practicing!";
    }

    document.getElementById("greeting").innerText = greeting;

    // update solutions
    document.getElementById("solutionsContainer").innerHTML =
        solutionsHTML;

}


// VIEW SOLUTIONS
function viewSolutions() {

    document.getElementById("resultScreen").style.display = "none";

    document.getElementById("solutionsScreen").style.display = "block";

}


// BACK TO RESULTS
function backToResults() {

    document.getElementById("solutionsScreen").style.display = "none";

    document.getElementById("resultScreen").style.display = "block";

}


// RETAKE QUIZ
function retakeQuiz() {

    // hide result + solutions
    document.getElementById("resultScreen").style.display = "none";

    document.getElementById("solutionsScreen").style.display = "none";

    // show quiz again
    document.getElementById("quizSection").style.display = "block";

    // clear old result data
    document.getElementById("finalScore").innerHTML = "";

    document.getElementById("greeting").innerText = "";

    document.getElementById("solutionsContainer").innerHTML = "";

    // clear selections
    currentQuestions.forEach((q, index) => {

        const options =
            document.querySelectorAll(`input[name="q${index}"]`);

        options.forEach(opt => {

            opt.checked = false;

            const label = opt.parentElement;

            label.style.background = "white";

            label.style.borderColor = "#e2e8f0";

        });

    });

    // restart timer
    const timeValue =
        parseInt(document.getElementById("timeValue").value);

    const timeUnit =
        document.getElementById("timeUnit").value;

    let totalSeconds = 0;

    if (timeUnit === "seconds") {

        totalSeconds = timeValue;
    }

    else if (timeUnit === "minutes") {

        totalSeconds = timeValue * 60;
    }

    else if (timeUnit === "hours") {

        totalSeconds = timeValue * 3600;
    }

    // show timer again
    document.getElementById("timerBox").style.display = "flex";

    // restart countdown
    startTimer(totalSeconds);

    // scroll top
    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// START NEW QUIZ
function startNewQuiz() {

    // clear everything
    currentQuestions = [];

    // clear form
    document.getElementById("quizForm").innerHTML = "";

    // clear topic
    document.getElementById("topic").value = "";

    // reset inputs
    document.getElementById("questionCount").value = "";

    document.getElementById("difficulty").selectedIndex = 0;

    document.getElementById("timeValue").value = "";

    document.getElementById("timeUnit").selectedIndex = 0;

    // clear result data
    document.getElementById("finalScore").innerHTML = "";

    document.getElementById("greeting").innerText = "";

    document.getElementById("solutionsContainer").innerHTML = "";

    // hide screens
    document.getElementById("quizSection").style.display = "block";

    document.getElementById("resultScreen").style.display = "none";

    document.getElementById("solutionsScreen").style.display = "none";

    // hide submit button
    document.getElementById("submitBtn").style.display = "none";

    // show start screen again
    document.getElementById("startScreen").style.display = "block";

    // clear status
    document.getElementById("status").innerText = "";

    // stop timer
    clearInterval(timerInterval);

    // reset timer UI
    document.getElementById("timer").innerText = "00:00";

    document.getElementById("timerBox").style.display = "none";

    // scroll top
    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}