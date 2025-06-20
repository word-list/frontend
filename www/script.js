document.getElementById("generateButton").addEventListener("click", async function (event) {
    event.preventDefault();

    const button = event.target;

    const originalText = button.innerText;
    button.innerText = "Loading...";
    button.disabled = true;

    const formData = new FormData(document.querySelector("form"));
    const params = new URLSearchParams(formData).toString();

    try {
        const response = await fetch(`/api/words?${params}`);
        const data = await response.json();

        updateTable(data.words);
    }
    catch (error) {
        console.error("Error fetching word list:", error);
    }
    finally {
        button.innerText = originalText;
        button.disabled = false;
    }
});

function getTableContent(wordOnly) {    
    const words = document.words;

    const output = wordOnly 
        ? words.map(w => w.text).join("\n")
        : words.map(w => `${w.text},${w.commonness},${w.offensiveness},${w.sentiment}`).join("\n");

    return output;
}

function copyTableData(wordOnly) {
    navigator.clipboard.writeText(getTableContent(wordOnly));
}

document.getElementById("copyCsvButton").addEventListener("click", async function (event) {
    event.preventDefault();
    copyTableData(false);
});

document.getElementById("copyTxtButton").addEventListener("click", async function (event) {
    event.preventDefault();
    copyTableData(true);
});

function downloadTableData(wordOnly) {
    const blob = new Blob([getTableContent(wordOnly)], { type: wordOnly ? "text/plain" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wordlist.${wordOnly ? 'txt' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById("downloadCsvButton").addEventListener("click", async function (event) {
    event.preventDefault();
    downloadTableData(false);
});

document.getElementById("downloadTxtButton").addEventListener("click", async function (event) {
    event.preventDefault();
    downloadTableData(true);
});

function rebuildTable() {
    const thead = document.querySelector(".word-list thead");
    const tbody = document.querySelector(".word-list tbody");
    tbody.innerHTML = "";

    if (document.showScores) {
        thead.style.display = '';
        document.words.forEach(word => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="word">${word.text}</td>
                <td class="score">${word.commonness}</td>
                <td class="score">${word.offensiveness}</td>
                <td class="score">${word.sentiment}</td>
                <td class="score">${word.formality}</td>
                <td class="score">${word.figurativeness}</td>
                <td class="score">${word.complexity}</td>
                <td class="score">${word.political}</td>
            `;
            tbody.appendChild(row);
        });
    }
    else {
        thead.style.display = 'none';
        var columns = 4;
        var wordsPerColumn = document.words.length / columns;
        for (var rowIndex = 0; rowIndex < wordsPerColumn; rowIndex++) {
            const row = document.createElement("tr");
            let columnWords = [ "", "", "", "" ];
            for (var columnIndex = 0; columnIndex < columns; columnIndex++) {
                const wordIndex = rowIndex + columnIndex * wordsPerColumn;
                if (wordIndex >= document.words.length) break;
                columnWords[columnIndex] = document.words[wordIndex];
            }
            row.innerHTML = columnWords.map(w => w ? `<td class="word">${w.text}</td>` : "").join("");
            tbody.appendChild(row);
        }
    }
}

function updateTable(words) {    
    if (!words || words.length === 0) {
        return;
    }

    document.words = words;

    rebuildTable();    
}

function createSlider(name, min, max) {
    const slider = document.getElementById(name+"Slider");

    noUiSlider.create(slider, {
        pips: {
            mode: 'positions',
            values: min < 0 ? [0, 50, 100] : [0, 100],
            density: 100 / (max - min)
        },
        start: [min < 0 ? 0 : min, max],
        connect: true,
        range: {
            min: min,
            max: max
        },
        step: 1
    });

    slider.noUiSlider.on("update", function(values) {
        document.getElementsByName("min"+name)[0].value=Math.trunc(values[0]);
        document.getElementsByName("max"+name)[0].value=Math.trunc(values[1]);
    })
}

createSlider("Commonness", 0, 5);
createSlider("Offensiveness", 0, 5);
createSlider("Sentiment", -5, 5);

document.getElementById("toggleScoresButton").addEventListener("click", async function (event) {
    event.preventDefault();

    const showScoresText = "Show Scores";
    const showWordsText = "Just Words";
    const button = event.target;

    document.showScores = !!!document.showScores;

    button.innerText = document.showScores ? showWordsText : showScoresText;

    rebuildTable();    
});

document.words = [
    { text: "apple", offensiveness: 2, commonness: 5, sentiment: 0 }
];