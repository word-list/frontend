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

        updateTable(data);
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

    thead.innerHTML = "";
    const headerRow = document.createElement("tr");
    const textTh = document.createElement("th");
    textTh.innerText = "Word";
    headerRow.appendChild(textTh);

    document.attributes.forEach(attribute => {
        const th = document.createElement("th");
        th.innerText = attribute.Display;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const tbody = document.querySelector(".word-list tbody");
    tbody.innerHTML = "";

    if (document.showScores) {
        thead.style.display = '';
        document.words.forEach(word => {
            const row = document.createElement("tr");
            row.className = "scores";
            const textTd = document.createElement("td");
            textTd.innerText = word.Text;
            row.appendChild(textTd);

            document.attributes.forEach(attribute => {
                const wordAttribute = word.Attributes[attribute.Name] ?? 0;
                const td = document.createElement("td");
                td.innerText = wordAttribute;
                if (!wordAttribute) {
                    td.className = "score zero";
                }
                else {
                    td.className = "score";
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
    }
    else {
        thead.innerHTML = "";
        var columns = 4;
        var wordsPerColumn = document.words.length / columns;
        for (var rowIndex = 0; rowIndex < wordsPerColumn; rowIndex++) {
            const row = document.createElement("tr");
            let columnWords = ["", "", "", ""];
            for (var columnIndex = 0; columnIndex < columns; columnIndex++) {
                const wordIndex = rowIndex + columnIndex * wordsPerColumn;
                if (wordIndex >= document.words.length) break;
                columnWords[columnIndex] = document.words[wordIndex];
            }
            row.innerHTML = columnWords.map(w => w ? `<td class="word">${w.Text}</td>` : "").join("");
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

function createSlider(name, display, min, max) {

    const placeholder = document.getElementById("attribute-container");

    const label = document.createElement("label");
    label.innerText = display;

    const sliderContainer = document.createElement("div");
    sliderContainer.className = "slider";

    const slider = document.createElement("div");
    slider.id = name + "Slider";
    sliderContainer.appendChild(slider);

    const minInput = document.createElement("input");
    minInput.name = name + "Min";
    minInput.type = "hidden";
    minInput.min = min;
    minInput.max = max;
    minInput.value = min;

    const maxInput = document.createElement("input");
    maxInput.name = name + "Max";
    maxInput.type = "hidden";
    maxInput.min = min;
    maxInput.max = max;
    maxInput.value = max;

    placeholder.before(label, sliderContainer, minInput, maxInput);

    noUiSlider.create(slider, {
        // pips: {
        //     mode: 'positions',
        //     values: min < 0 ? [0, 50, 100] : [0, 100],
        //     density: 100 / (max - min)
        // },
        start: [min < 0 ? 0 : min, max],
        connect: true,
        range: {
            min: min,
            max: max
        },
        step: 1
    });

    slider.noUiSlider.on("update", function (values) {
        document.getElementsByName(name + "Min")[0].value = Math.trunc(values[0]);
        document.getElementsByName(name + "Max")[0].value = Math.trunc(values[1]);
    })
}

async function loadAttributes() {
    const attributes = await fetch("/api/attributes").then(response => response.json());
    const columnParent = document.getElementById("column-container");
    document.attributes = attributes;
    for (const attribute of attributes) {
        createSlider(attribute.Name, attribute.Display, attribute.Min, attribute.Max);

        const th = document.createElement("th");
        th.className = "score";
        th.innerText = attribute.Display;
        columnParent.appendChild(th);
    }
}

document.getElementById("toggleScoresButton").addEventListener("click", async function (event) {
    event.preventDefault();

    const showScoresText = "Show Scores";
    const showWordsText = "Just Words";
    const button = event.target;

    document.showScores = !!!document.showScores;

    button.innerText = document.showScores ? showWordsText : showScoresText;

    rebuildTable();
});

loadAttributes();