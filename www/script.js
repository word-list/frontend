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
    const tableBody = document.querySelector("table.word-list tbody");
    const rows = [... tableBody.querySelectorAll("tr")]

    const output = wordOnly 
        ? rows.map(row => row.children[0].innerText).join("\n")
        : rows.map(row => [...row.children].map(cell => cell.innerText).join(",")).join("\n");

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

function updateTable(words) {
    const tbody = document.querySelector(".word-list tbody");
    tbody.innerHTML = "";

    if (!words || words.length === 0) {
        return;
    }

    words.forEach(word => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${word.text}</td>
            <td>${word.commonness}</td>
            <td>${word.offensiveness}</td>
            <td>${word.sentiment}</td>
        `;
        tbody.appendChild(row);
    });
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