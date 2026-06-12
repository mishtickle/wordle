const NUMBER_OF_GUESSES = 6;
const WORD_LENGTH = 5;
let word = "";
let wordArray = ["", "", "", "", ""];
let activeRow = 0;
let isLoading = false;
const gameContainer = document.querySelector(".game-container");
const loadingIcon = document.getElementById("loading-icon");
const rows = [];

function setLoading(loading) {
  isLoading = loading;
  if (loading) {
    loadingIcon.classList.remove("hidden");
    disableAllInputs(true);
  } else {
    loadingIcon.classList.add("hidden");
    setActiveRow(activeRow);
  }
}

function disableAllInputs(disabled) {
  rows.forEach((row) => {
    row.querySelectorAll("input").forEach((input) => {
      input.disabled = disabled || row.dataset.row !== String(activeRow);
    });
  });
}

for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
  const row = document.createElement("div");
  row.classList.add("row");
  row.dataset.row = i;
  gameContainer.appendChild(row);

  for (let j = 0; j < WORD_LENGTH; j++) {
    const letterContainer = document.createElement("div");
    letterContainer.classList.add("letter-container");
    const input = document.createElement("input");
    input.dataset.id = `${j + 1}`;
    input.setAttribute("type", "text");
    input.setAttribute("maxlength", "1");
    input.disabled = i !== activeRow;
    letterContainer.appendChild(input);
    row.appendChild(letterContainer);
  }

  row.addEventListener("input", async (event) => {
    const input = event.target;
    const rowIndex = Number(row.dataset.row);
    if (rowIndex !== activeRow) return;

    if (input.value.length === 1) {
      const nextLetterContainer = input.parentElement.nextElementSibling;
      const nextInput = nextLetterContainer?.querySelector("input");
      if (nextInput) {
        nextInput.focus();
      }
    }

    if (isLetter(input.value)) {
      wordArray[input.dataset.id - 1] = input.value.toLowerCase();
    } else {
      input.value = "";
      wordArray[input.dataset.id - 1] = "";
    }

    const inputsInRow = Array.from(rows[activeRow].querySelectorAll("input"));
    const rowFilled = inputsInRow.every(
      (character) => character.value.length === 1,
    );

    if (rowFilled) {
      word = inputsInRow
        .map((character) => character.value.toLowerCase())
        .join("");

      if (isLoading) return;
      const valid = await response(word);
      if (!valid) {
        const letterContainers =
          rows[activeRow].querySelectorAll(".letter-container");
        letterContainers.forEach((character) =>
          character.classList.add("invalid"),
        );
        setTimeout(
          () =>
            letterContainers.forEach((character) =>
              character.classList.remove("invalid"),
            ),
          700,
        );
        inputsInRow.forEach((character) => (character.value = ""));
        return;
      }

      checkCorrectness(wordArray);

      if (word === todaysWord) {
        const playAgain = document.createElement("button");
        playAgain.textContent = "You win! Click here to play again?";
        gameContainer.appendChild(playAgain);
        playAgain.addEventListener("click", () => location.reload());
        const hdr = document.querySelector("body");
        if (hdr) hdr.classList.add("win-flash");
      } else if (activeRow === 5) {
        const playAgain = document.createElement("button");
        playAgain.textContent = `You lose! The word was ${todaysWord}. Click here to play again?`;
        gameContainer.appendChild(playAgain);
        playAgain.addEventListener("click", () => location.reload());
      }

      if (word !== todaysWord) {
        wordArray = ["", "", "", "", ""];
        activeRow++;
        setActiveRow(activeRow);
      }
    }
  });

  row.addEventListener("keydown", (event) => {
    const input = event.target;
    if (event.key === "Backspace" && input.value === "") {
      const previousLetterContainer =
        input.parentElement.previousElementSibling;
      const previousInput = previousLetterContainer?.querySelector("input");
      if (previousInput) previousInput.focus();
    }
  });

  rows.push(row);
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function checkCorrectness(wordArr) {
  const targetLetters = todaysWord.split("");
  const result = Array(5).fill(null);

  // First pass: mark greens and remove exact matches from target letter pool.
  wordArr.forEach((letter, index) => {
    const letterContainer = rows[activeRow].querySelector(
      `input[data-id="${index + 1}"]`,
    ).parentElement;
    if (letter === targetLetters[index]) {
      letterContainer.classList.add("green");
      result[index] = "green";
      targetLetters[index] = null;
    }
  });

  // Second pass: mark yellows only for remaining unmatched letters.
  wordArr.forEach((letter, index) => {
    const letterContainer = rows[activeRow].querySelector(
      `input[data-id="${index + 1}"]`,
    ).parentElement;
    if (result[index]) return;

    const matchIndex = targetLetters.indexOf(letter);
    if (matchIndex !== -1) {
      letterContainer.classList.add("yellow");
      targetLetters[matchIndex] = null;
    } else {
      letterContainer.classList.add("lightgrey");
    }
  });
}

function setActiveRow(rowIndex) {
  activeRow = rowIndex;
  rows.forEach((row, index) => {
    const enabled = index === activeRow;
    row.querySelectorAll("input").forEach((input) => {
      input.disabled = !enabled;
    });
  });

  const firstInput = rows[activeRow].querySelector("input");
  if (firstInput) {
    firstInput.focus();
  }
}

setActiveRow(0);
let todaysWord = "";
fetch("https://words.dev-apis.com/word-of-the-day?random=1")
  .then((response) => response.json())
  .then((data) => {
    todaysWord = data.word;
  });

async function response(word) {
  setLoading(true);
  try {
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word: word }),
    });
    const data = await res.json();
    return data.validWord;
  } finally {
    setLoading(false);
  }
}
