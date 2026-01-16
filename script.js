// CONFIGURATIE: Pas hier je links aan!
const REWARD_CONFIG = {
    //photoUrl: "rewards/escaperoom.jpg", // verborgen foto URL
    datePickerUrl: "https://datumprikker.nl/afspraak/maken", // datumprikker link
    switchTime: 30 // Seconden voordat de link verandert
};

// HASHED ANTWOORDEN (Om "Inspect Element" cheaters tegen te gaan)
// Gebruik een tool zoals "SHA256 online" om je antwoorden te hashen, of gebruik de string als placeholder als beveiliging minder boeit.
// Hieronder simuleer ik hashes van simpele antwoorden:
// 1: "kaart" (als voorbeeld van 'Ik heb steden...')
// 2: "37" (26 + 11)
// 3: "#FF0000"
// 4: "05-12" (datum omgedraaid voorbeeld)
// 5: "GEFELICITEERD"

// Voor het gemak in dit voorbeeld vergelijk ik strings 'genormaliseerd' (hoofdletters/spaties weg),
// maar in een echte productie zou je hashes gebruiken.
const ANSWERS = {
    1: "kaart",
    2: "37",
    3: "#FF0000",
    5: "gefeliciteerd",
    6: "schaak",
    7: "256",
    8: "pedro",
    10: "gedicht"
};

// Quiz antwoorden voor level 9
const QUIZ_ANSWERS = {
    1: "sjoerd",
    2: "thom",
    3: "stef",
    4: "iedereen",
    5: "laura"
};

const QUIZ_QUESTIONS = {
    1: "Wie praat er altijd over werk?",
    2: "Wie wilt altijd bier drinken?",
    3: "Wie heeft het altijd over geld?",
    4: "Wie komt seks te kort?",
    5: "Wie is de beste agent in de kamer?"
};

// Quiz state
const quizState = {
    currentQuestion: 1
};

let currentLevel = 0; // 0 = Intro

// Galgje spel status
const hangmanStates = {
    8: {
        word: "PEDRO",
        guessed: new Set(),
        wrongGuesses: new Set(),
        maxWrong: 6,
        solved: false
    }
};

// Memory Game state
const memoryGameState = {
    cards: [],
    flipped: [],
    matched: [],
    canClick: true,
    images: [
        'images/stef1.jpg',
        'images/card2.svg',
        'images/card3.svg',
        'images/card4.svg',
        'images/card5.svg'
    ]
};

// Gedicht data voor level 10
const poemLines = [
    { text: "30 jaren oud, maar nog altijd even", answer: "onhandig" },
    { text: "Een cadeau bedenken voor Silvan, maar ja weten wij wat hij wil", answer: "of niet?" },
    { text: "Geld is het geen wat hij wilt krijgen, maar Silvan zal dat weer opzuipen in de", answer: "bar" },
    { text: "Maar goed wat kunnen we deze jongen schenken, iets voor een hobby of wat kunnen wij nog", answer: "verzinnen" },
    { text: "Bier drinken daar houd hij van, bier dat is altijd een goed", answer: "idee" },
    { text: "Het zelf brouwen kunnen we wel opgeven, het laatste brouwsel is inmiddels alweer", answer: "weggegooid" },
    { text: "Iets voor de sportschool dat werkt altijd, maar een bon geven is ook niet meer van deze", answer: "verjaardag" },
    { text: "Ik zal dit geheim niet langer bewaren, vul het laatste woord in en dat zal alles", answer: "weergeven" },
    { text: "Nog eentje omdat ik het niet laten kan, een zin die ik nog tegen kwam.", answer: "..." },
    { text: "Die jongen zit bij de politie, dan heeft hij vast geen", answer: "honger" }
];

const poemState = {
    currentLine: 0
};

// Reward mapping voor levels 1-9
const REWARD_MAPPING = {
    1: "rewards/silvan1.jpg",
    2: "rewards/silvan2.PNG",
    3: "rewards/Silvan3.jpg",
    4: "rewards/silvan4.PNG",
    5: "rewards/silvan5.jpg",
    6: "rewards/silvan6.jpg",
    7: "rewards/silvan7.JPG",
    8: "rewards/silvan8.PNG",
    9: "rewards/Silvan9.jpg"
};

// Reward teksten voor levels 1-9 - pas deze aan naar je voorkeur!
const REWARD_TEXT = {
    1: "Wow een simpel raadsel kan hij oplossen.",
    2: "Indrukwekkend!",
    3: "Knap hoor, wil je nu een knuffel?",
    4: "Fantastisch! Je hebt alle kaarten gevonden!",
    5: "Wat een sexy mannetje",
    6: "Fotogeniek?",
    7: "Let niet op ons",
    8: "PEDRO PEDRO PEDRO PEDRO PE",
    9: "Poah van die vragen word je moe!"
};

// Reward popup functies - gebruiken dezelfde WASTED overlay structuur
// Flag voor reward handling
let rewardWaitingForNextLevel = null;

function showRewardPopup(level) {
    if (level < 1 || level > 9) return; // Alleen levels 1-9
    
    const rewardPath = REWARD_MAPPING[level];
    const rewardText = REWARD_TEXT[level];
    if (!rewardPath) return;

    // Sla op dat we op het volgende level wachten na reward klik
    rewardWaitingForNextLevel = level;

    // Gebruik de WASTED overlay maar maak het een reward display
    const overlay = document.getElementById(`wasted-overlay-${level}`);
    if (!overlay) return;
    
    // Verberg WASTED tekst, toon afbeelding
    const wastedText = overlay.querySelector('.wasted-text');
    const wastedInfo = overlay.querySelector('.wasted-info');
    if (wastedText) wastedText.style.display = 'none';
    if (wastedInfo) wastedInfo.style.display = 'none';
    
    // Maak of update afbeelding in de overlay
    let rewardImg = overlay.querySelector('.reward-image-display');
    if (!rewardImg) {
        rewardImg = document.createElement('img');
        rewardImg.className = 'reward-image-display';
        rewardImg.src = rewardPath;
        rewardImg.alt = 'Reward';
        rewardImg.style.maxWidth = '80%';
        rewardImg.style.maxHeight = '60vh';
        rewardImg.style.borderRadius = '10px';
        rewardImg.style.objectFit = 'contain';
        rewardImg.style.animation = 'wastedFadeIn 0.5s ease-in';
        rewardImg.style.display = 'block';
        rewardImg.style.margin = '0 auto 20px';
        overlay.appendChild(rewardImg);
    } else {
        rewardImg.src = rewardPath;
    }

    // Maak of update tekst in de overlay
    let rewardTextEl = overlay.querySelector('.reward-text-display');
    if (!rewardTextEl) {
        rewardTextEl = document.createElement('p');
        rewardTextEl.className = 'reward-text-display';
        rewardTextEl.style.color = 'white';
        rewardTextEl.style.fontSize = '1.5rem';
        rewardTextEl.style.fontWeight = 'bold';
        rewardTextEl.style.marginTop = '20px';
        rewardTextEl.style.animation = 'wastedFadeIn 0.5s ease-in 0.3s both';
        overlay.appendChild(rewardTextEl);
    }
    rewardTextEl.textContent = rewardText;
    
    // Toon overlay
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
}

function closeRewardPopup() {
    // Controleer of we net een reward hebben gesloten
    const shouldAdvance = rewardWaitingForNextLevel !== null;
    const rewardLevel = rewardWaitingForNextLevel;
    rewardWaitingForNextLevel = null;

    // Sluit ALLEEN de reward overlay (deze level)
    if (rewardLevel && rewardLevel >= 1 && rewardLevel <= 9) {
        const overlay = document.getElementById(`wasted-overlay-${rewardLevel}`);
        if (overlay) {
            overlay.style.display = 'none';
            // Herstel WASTED tekst voor volgende keer
            const wastedText = overlay.querySelector('.wasted-text');
            const wastedInfo = overlay.querySelector('.wasted-info');
            if (wastedText) wastedText.style.display = 'block';
            if (wastedInfo) wastedInfo.style.display = 'block';
        }
    }

    // Als we een reward hebben gesloten, ga naar volgende level
    if (shouldAdvance) {
        nextLevel();
    }
}

// Sluit popup op ESC-toets of klik
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeRewardPopup();
    }
});

// Initialisatie bij laden pagina
document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    render();
});

function loadProgress() {
    const saved = localStorage.getItem('escapeRoomLevel');
    if (saved) {
        currentLevel = parseInt(saved, 10);
    }
}

function saveProgress() {
    localStorage.setItem('escapeRoomLevel', currentLevel);
}

function startGame() {
    currentLevel = 1;
    saveProgress();
    render();
}

function resetGame() {
    if (confirm('Weet je zeker dat je het spel wilt resetten? Alle voortgang gaat verloren!')) {
        localStorage.removeItem('escapeRoomLevel');
        currentLevel = 0;
        render();
    }
}

// Check het antwoord
function checkLevel(level, directInput = null) {
    // Speciale behandeling voor level 4 (memory game)
    if (level === 4) {
        // Memory game wordt niet via checkLevel afgehandeld
        return;
    }

    // Speciale behandeling voor level 8 (galgje)
    if (level === 8) {
        const state = hangmanStates[8];
        if (isHangmanWon(8)) {
            nextLevel();
            return;
        } else {
            const errorEl = document.getElementById(`error-${level}`);
            errorEl.textContent = "Raad eerst het woord!";
            return;
        }
    }
    
    // Speciale behandeling voor level 9 (quiz)
    if (level === 9) {
        // Quiz wordt niet via checkLevel afgehandeld, maar via checkQuizAnswer
        return;
    }
    
    // Speciale behandeling voor level 10 (gedicht)
    if (level === 10) {
        // Dit wordt aangeroepen via checkPoemLine
        return;
    }
    
    let inputVal = "";
    const errorEl = document.getElementById(`error-${level}`);
    
    // Haal input op (ofwel uit invoerveld, ofwel direct meegegeven zoals bij de knoppen)
    if (directInput) {
        inputVal = directInput;
    } else {
        const inputEl = document.getElementById(`input-${level}`);
        if (inputEl) inputVal = inputEl.value;
    }

    // Normaliseer input (alles kleine letters, geen spaties)
    const cleanInput = inputVal.toLowerCase().trim().replace(/\s/g, '');
    const cleanAnswer = ANSWERS[level].toLowerCase();

    if (cleanInput === cleanAnswer) {
        // GOED ANTWOORD
        errorEl.textContent = "";
        // Toon reward popup voor levels 1-9
        if (level <= 9) {
            showRewardPopup(level);
        } else {
            // Level 10 gaat direct door
            nextLevel();
        }
    } else {
        // FOUT ANTWOORD - Toon WASTED scherm
        setTimeout(() => {
            document.getElementById(`wasted-overlay-${level}`).style.display = "flex";
        }, 500);
    }
}

function nextLevel() {
    currentLevel++;
    saveProgress();
    
    // Kleine vertraging voor UX
    setTimeout(() => {
        render();
    }, 300);
}

function render() {
    // Bepaal welke sectie actief moet zijn
    let activeId = "";
    if (currentLevel === 0) activeId = "intro";
    else if (currentLevel > 10) activeId = "reward";
    else activeId = `level-${currentLevel}`;

    // Verberg alle secties behalve de actieve
    document.querySelectorAll('.game-section').forEach(el => {
        if (el.id === activeId) {
            // Dit is de actieve sectie
            el.classList.remove('hidden');
            setTimeout(() => el.classList.add('active'), 10);
        } else {
            // Andere secties verbergen
            el.classList.remove('active');
            setTimeout(() => el.classList.add('hidden'), 500);
        }
    });

    // Update Header
    updateHeader();

    // Initialiseer speciaal spel voor level 4 (memory game)
    if (currentLevel === 4) {
        setTimeout(() => {
            initMemoryGame(4);
        }, 50);
    }

    // Initialiseer speciaal spel voor level 9 (quiz)
    if (currentLevel === 9) {
        setTimeout(() => {
            initQuiz(9);
        }, 50);
    }

    // Initialiseer speciaal spel voor level 8 (galgje)
    if (currentLevel === 8) {
        setTimeout(() => {
            initHangman(8);
            document.getElementById('error-8').textContent = "";
            document.getElementById('error-8').style.color = "#ef4444";
            document.getElementById('submit-8').style.display = "none";
        }, 50);
    }
        setTimeout(() => {
            document.getElementById('error-9').textContent = "";
            document.getElementById('error-9').style.color = "#ef4444";
        }, 50);
    }
    
    // Initialiseer speciaal spel voor level 10 (gedicht)
    if (currentLevel === 10) {
        setTimeout(() => {
            initPoem(10);
        }, 50);
    }

    // Als we bij de reward zijn, start de timer logica
    if (currentLevel > 10) {
        initRewardSequence();
    }


function updateHeader() {
    const statusEl = document.getElementById('levelIndicator');
    const bar = document.getElementById('progressBar');
    
    if (currentLevel === 0) {
        statusEl.textContent = "Systeem Initialiseren...";
        bar.style.width = "0%";
    } else if (currentLevel > 10) {
        statusEl.textContent = "SYSTEEM GEKRAAKT";
        bar.style.width = "100%";
        bar.style.backgroundColor = "#10b981"; // Groen
    } else {
        statusEl.textContent = `Decryptie laag ${currentLevel} van 10`;
        const pct = ((currentLevel - 1) / 10) * 100;
        bar.style.width = `${pct}%`;
    }
}

// --- DE MAGIE VAN HET CADEAU ---
function initRewardSequence() {
    const btn = document.getElementById('mystery-link');
    const timerText = document.getElementById('timer-text');
    const countdownSpan = document.getElementById('countdown');

    // Zorg dat de link goed is ingesteld
    const photoUrl = REWARD_CONFIG.photoUrl;
    
    // Als het een Google Drive link is, converteer naar direct download
    // let finalPhotoUrl = photoUrl;
    // if (photoUrl.includes('drive.google.com')) {
    //     // Extract file ID en maak direct download link
    //     const fileIdMatch = photoUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    //     if (fileIdMatch) {
    //         finalPhotoUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
    //     }
    // }
    
    // Stap 1: Zet de foto link
    btn.href = finalPhotoUrl;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.innerText = "BEKIJK JE CADEAU";
    
    // Kijk of we al een startzeit hebben opgeslagen
    const startTime = localStorage.getItem('rewardStartTime');
    const now = Date.now();
    
    let timeLeft;
    if (startTime) {
        // We hebben al begonnen, bereken hoeveel tijd er nog over is
        const elapsedSeconds = Math.floor((now - parseInt(startTime)) / 1000);
        timeLeft = Math.max(0, REWARD_CONFIG.switchTime - elapsedSeconds);
        
        if (timeLeft === 0) {
            // Tijd is al voorbij, wissel direct
            switchLink();
            return;
        }
    } else {
        // Eerste keer, sla de starttijd op
        localStorage.setItem('rewardStartTime', now.toString());
        timeLeft = REWARD_CONFIG.switchTime;
    }
    
    countdownSpan.innerText = timeLeft;

    // Start timer
    const interval = setInterval(() => {
        timeLeft--;
        countdownSpan.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(interval);
            localStorage.removeItem('rewardStartTime');
            switchLink();
        }
    }, 1000);

    function switchLink() {
        // Visuele feedback
        btn.style.opacity = 0;
        
        setTimeout(() => {
            // Stap 2: Verander link naar datumprikker
            btn.href = REWARD_CONFIG.datePickerUrl;
            btn.innerText = "PLAN HET UITJE 📅";
            btn.style.background = "#8b5cf6"; // Paars tintje om verschil aan te geven
            btn.style.opacity = 1;
            
            // Verander tekst eronder
            timerText.innerHTML = "De link is veranderd! De foto is verdwenen.";
        }, 500);
    }
}

// --- GALGJE SPEL ---
function initHangman(level) {
    const state = hangmanStates[level];
    if (!state) return;
    
    state.guessed = new Set();
    state.wrongGuesses = new Set();
    state.solved = false;
    
    // Zet error bericht en submit knop terug naar standaard
    document.getElementById(`error-${level}`).textContent = "";
    document.getElementById(`error-${level}`).style.color = "#ef4444";
    document.getElementById(`submit-${level}`).style.display = "none";
    
    updateHangmanDisplay(level);
}

function guessLetter(level, letter) {
    const state = hangmanStates[level];
    if (!state || state.solved) return;
    
    const btn = event.target;
    btn.disabled = true;
    btn.style.opacity = "0.5";
    
    letter = letter.toUpperCase();
    
    if (state.word.includes(letter)) {
        state.guessed.add(letter);
    } else {
        state.wrongGuesses.add(letter);
    }
    
    updateHangmanDisplay(level);
    
    // Check if game is won
    if (isHangmanWon(level)) {
        state.solved = true;
        document.getElementById(`submit-${level}`).style.display = "block";
        document.getElementById(`error-${level}`).textContent = "🎉 Woord geraden! Je mag naar het volgende level.";
        document.getElementById(`error-${level}`).style.color = "#10b981";
        disableAllLetters(level);
        
        // Toon reward popup voor galgje
        setTimeout(() => {
            showRewardPopup(8);
        }, 500);
    }
    
    // Check if game is lost
    if (state.wrongGuesses.size >= state.maxWrong) {
        state.solved = true;
        disableAllLetters(level);
        // Toon WASTED scherm, niet het antwoord
        setTimeout(() => {
            document.getElementById(`wasted-overlay-${level}`).style.display = "flex";
        }, 500);
    }
}

function updateHangmanDisplay(level) {
    const state = hangmanStates[level];
    
    // Update word display
    let display = "";
    for (let char of state.word) {
        if (state.guessed.has(char)) {
            display += char + " ";
        } else {
            display += "_ ";
        }
    }
    document.getElementById(`word-display-${level}`).textContent = display.trim();
    
    // Update wrong letters
    document.getElementById(`wrong-letters-${level}`).textContent = Array.from(state.wrongGuesses).join(", ");
    
    // Show body parts
    const bodyParts = ['head', 'body', 'leftarm', 'rightarm', 'leftleg', 'rightleg'];
    const wrongCount = state.wrongGuesses.size;
    
    for (let i = 0; i < bodyParts.length; i++) {
        const el = document.getElementById(`${bodyParts[i]}-${level}`);
        if (el) {
            el.style.display = i < wrongCount ? "block" : "none";
        }
    }
}

function isHangmanWon(level) {
    const state = hangmanStates[level];
    for (let char of state.word) {
        if (!state.guessed.has(char)) {
            return false;
        }
    }
    return true;
}

function disableAllLetters(level) {
    const grid = document.getElementById(`letters-grid-${level}`);
    if (grid) {
        const buttons = grid.querySelectorAll('.letter-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.5";
        });
    }
}

function restartHangman(level) {
    // Verberg WASTED overlay
    document.getElementById(`wasted-overlay-${level}`).style.display = "none";
    
    // Reset het spel
    initHangman(level);
    
    // Zet alle letter buttons weer aan
    const grid = document.getElementById(`letters-grid-${level}`);
    if (grid) {
        const buttons = grid.querySelectorAll('.letter-btn');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = "1";
        });
    }
}

// --- MEMORY GAME VOOR LEVEL 4 ---
function initMemoryGame(level) {
    const state = memoryGameState;
    state.flipped = [];
    state.matched = [];
    state.canClick = true;
    
    // Shuffle de kaarten (5 paren = 10 kaarten)
    state.cards = [];
    state.images.forEach(img => {
        state.cards.push(img);
        state.cards.push(img); // Duplicate voor paren
    });
    state.cards = state.cards.sort(() => Math.random() - 0.5);
    
    // Bouw het grid
    const grid = document.getElementById('memory-grid-4');
    grid.innerHTML = '';
    
    state.cards.forEach((image, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">?</div>
                <div class="memory-card-back">
                    <img src="${image}" alt="Card">
                </div>
            </div>
        `;
        card.onclick = () => flipMemoryCard(index);
        grid.appendChild(card);
    });
    
    document.getElementById('matches-found').textContent = '0';
    document.getElementById('error-4').textContent = '';
}

function flipMemoryCard(index) {
    const state = memoryGameState;
    if (!state.canClick || state.flipped.includes(index) || state.matched.includes(index)) {
        return;
    }
    
    state.flipped.push(index);
    const cards = document.querySelectorAll('#memory-grid-4 .memory-card');
    cards[index].classList.add('flipped');
    
    if (state.flipped.length === 2) {
        state.canClick = false;
        checkMemoryMatch();
    }
}

function checkMemoryMatch() {
    const state = memoryGameState;
    const [idx1, idx2] = state.flipped;
    
    if (state.cards[idx1] === state.cards[idx2]) {
        // Match gevonden!
        state.matched.push(idx1, idx2);
        const cards = document.querySelectorAll('#memory-grid-4 .memory-card');
        cards[idx1].classList.add('matched');
        cards[idx2].classList.add('matched');
        
        document.getElementById('matches-found').textContent = state.matched.length / 2;
        
        state.flipped = [];
        state.canClick = true;
        
        // Check of spel klaar is
        if (state.matched.length === 10) {
            // Toon reward voor level 4
            setTimeout(() => {
                showRewardPopup(4);
            }, 500);
        }
    } else {
        // Geen match
        setTimeout(() => {
            const cards = document.querySelectorAll('#memory-grid-4 .memory-card');
            cards[idx1].classList.remove('flipped');
            cards[idx2].classList.remove('flipped');
            state.flipped = [];
            state.canClick = true;
        }, 1000);
    }
}

// Generieke retry functie voor alle levels
function retryLevel(level) {
    // Verberg WASTED overlay
    document.getElementById(`wasted-overlay-${level}`).style.display = "none";
    
    // Clear error messages
    document.getElementById(`error-${level}`).textContent = "";
    
    if (level === 4) {
        // Voor memory game: reset het spel
        initMemoryGame(4);
    } else if (level === 9) {
        // Voor quiz: toon dezelfde vraag opnieuw
        showNextQuizQuestion();
    } else {
        // Voor andere levels: clear input fields
        const inputEl = document.getElementById(`input-${level}`);
        if (inputEl) {
            inputEl.value = "";
            inputEl.focus();
        }
    }
}

// --- QUIZ SPEL VOOR LEVEL 9 ---
function initQuiz(level) {
    if (level !== 9) return;
    
    quizState.currentQuestion = 1;
    showNextQuizQuestion();
}

function showNextQuizQuestion() {
    const currentQ = quizState.currentQuestion;
    
    if (currentQ > 5) {
        // Quiz klaar!
        document.getElementById('error-9').textContent = "";
        document.getElementById('error-9').style.color = "#10b981";
        const label = document.getElementById('quiz-label-9');
        label.textContent = "🎉 Alle vragen beantwoord! Quiz voltooid!";
        document.getElementById('quiz-input-9').style.display = "none";
        
        // Update button
        const btn = document.querySelector('button[onclick*="checkQuizAnswer"]');
        if (btn) {
            btn.textContent = "Volgende Level";
            btn.onclick = () => nextLevel();
        }
        return;
    }
    
    const label = document.getElementById('quiz-label-9');
    const input = document.getElementById('quiz-input-9');
    
    label.textContent = QUIZ_QUESTIONS[currentQ];
    input.value = "";
    input.style.display = "block";
    input.focus();
    
    document.getElementById('quiz-current').textContent = currentQ;
    document.getElementById('error-9').textContent = "";
}

function checkQuizAnswer(level) {
    const currentQ = quizState.currentQuestion;
    const input = document.getElementById('quiz-input-9');
    const userAnswer = input.value.toLowerCase().trim();
    const correctAnswer = QUIZ_ANSWERS[currentQ].toLowerCase();
    
    if (userAnswer === correctAnswer) {
        // Goed antwoord!
        quizState.currentQuestion++;
        
        if (quizState.currentQuestion > 5) {
            // Alle vragen klaar - toon reward popup
            showRewardPopup(9);
        } else {
            // Volgende vraag
            showNextQuizQuestion();
        }
    } else {
        // Fout antwoord!
        setTimeout(() => {
            document.getElementById(`wasted-overlay-${level}`).style.display = "flex";
        }, 500);
    }
}

// --- SCHAAKSPEL VOOR LEVEL 9 (NIET MEER GEBRUIKT) ---
const chessGameState = {
    selectedSquare: null,
    moveMade: null
};

// Wit stukken: ♔ ♕ ♖ ♗ ♘ ♙
// Zwart stukken: ♚ ♛ ♜ ♝ ♞ ♟
const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
const blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];

function initChess(level) {
    if (level !== 9) return;
    
    chessGameState.selectedSquare = null;
    chessGameState.moveMade = null;
    
    const board = document.getElementById(`chessboard-${level}`);
    if (!board) return;
    
    // Event listeners toevoegen aan alle velden
    board.querySelectorAll('.chess-square').forEach(square => {
        square.addEventListener('click', () => handleChessClick(square, level));
        square.classList.remove('selected', 'highlight');
    });
}

function handleChessClick(square, level) {
    const pos = square.dataset.pos;
    const piece = square.textContent.trim();
    const isWhitePiece = whitePieces.includes(piece);
    
    // Als geen stuk is geselecteerd
    if (!chessGameState.selectedSquare) {
        // Alleen witte stukken kunnen selecteren
        if (isWhitePiece) {
            chessGameState.selectedSquare = pos;
            square.classList.add('selected');
        }
        return;
    }
    
    // Als dezelfde square wordt geklikt, deselect
    if (chessGameState.selectedSquare === pos) {
        square.classList.remove('selected');
        chessGameState.selectedSquare = null;
        return;
    }
    
    // Zet uitvoeren
    const fromPos = chessGameState.selectedSquare;
    const toPos = pos;
    
    // Reset alle highlights
    document.getElementById(`chessboard-${level}`).querySelectorAll('.chess-square').forEach(s => {
        s.classList.remove('selected', 'highlight');
    });
    
    // Haal het stuk van het startpunt
    const fromSquare = document.querySelector(`[data-pos="${fromPos}"]`);
    const fromPiece = fromSquare.textContent.trim();
    
    if (!fromPiece) {
        chessGameState.selectedSquare = null;
        return;
    }
    
    // Voer de zet uit
    fromSquare.textContent = '';
    square.textContent = fromPiece;
    
    // Sla de zet op
    chessGameState.moveMade = fromPos + toPos;
    
    // Check of de juiste zet is gedaan
    if (chessGameState.moveMade === "d5h8") {
        document.getElementById(`error-${level}`).textContent = "✓ Correcte zet! Klik 'Volgende Level' om door te gaan.";
        document.getElementById(`error-${level}`).style.color = "#10b981";
        document.getElementById(`submit-${level}`).style.display = "block";
    } else {
        document.getElementById(`error-${level}`).textContent = "✗ Dit is niet de juiste zet. Probeer opnieuw!";
        document.getElementById(`error-${level}`).style.color = "#ef4444";
        
        // Reset de zet
        fromSquare.textContent = fromPiece;
        square.textContent = '';
        chessGameState.moveMade = null;
    }
    
    chessGameState.selectedSquare = null;
}

// --- GEDICHT SPEL VOOR LEVEL 10 ---
function initPoem(level) {
    if (level !== 10) return;
    
    poemState.currentLine = 0;
    showNextPoemLine();
}

function showNextPoemLine() {
    if (poemState.currentLine >= poemLines.length) {
        // Alle regels af, volgende level
        const btn = document.querySelector('button[onclick*="checkPoemLine"]');
        if (btn) {
            btn.textContent = "Prijs Ontvangen!";
            btn.onclick = () => nextLevel();
        }
        return;
    }
    
    const line = poemLines[poemState.currentLine];
    const lineNum = poemState.currentLine + 1;
    
    const poemContainer = document.getElementById('poem-line-10');
    const errorEl = document.getElementById('error-10');
    
    // Als het de regel met "..." is, spring deze over
    if (line.answer === "...") {
        poemState.currentLine++;
        showNextPoemLine();
        return;
    }
    
    poemContainer.innerHTML = `<div class="poem-line">${line.text} <input type="text" id="input-10-${lineNum}" class="poem-input" placeholder="..." autocomplete="off"></div>`;
    errorEl.textContent = "";
    errorEl.style.color = "#ef4444";
    
    // Update button onclick dynamisch
    const btn = document.querySelector('button[onclick*="checkPoemLine"]');
    if (btn) {
        btn.onclick = () => checkPoemLine(lineNum);
    }
    
    // Focus op input
    document.getElementById(`input-10-${lineNum}`).focus();
}

function checkPoemLine(lineNum) {
    const line = poemLines[poemState.currentLine];
    const input = document.getElementById(`input-10-${lineNum}`);
    const errorEl = document.getElementById('error-10');
    
    if (!input) return;
    
    const userAnswer = input.value.toLowerCase().trim();
    const correctAnswer = line.answer.toLowerCase();
    
    // Vervang het ingevulde woord door het juiste woord (ongeacht of het goed of fout is)
    input.value = line.answer;
    input.disabled = true;
    input.style.background = "#ef4444";
    
    // Clear error element
    errorEl.textContent = "";
    
    // Na 3.5 seconden volgende regel tonen
    setTimeout(() => {
        poemState.currentLine++;
        
        if (poemState.currentLine >= poemLines.length) {
            errorEl.textContent = "";
            errorEl.style.color = "#10b981";
            const poemContainer = document.getElementById('poem-line-10');
            poemContainer.innerHTML = '<div class="poem-line" style="color: #10b981; font-size: 1.2rem; font-weight: bold;">🎉 Alle regels voltooid! Je hebt het gedicht completed!</div>';
            
            // Knop naar prijs
            const btn = document.querySelector('button[onclick^="checkPoemLine"]');
            if (btn) {
                btn.textContent = "Prijs Ontvangen!";
                btn.onclick = () => nextLevel();
            }
        } else {
            showNextPoemLine();
        }
    }, 3500);
}