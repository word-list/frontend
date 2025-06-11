document.querySelector("#generateButton").addEventListener("click", async function (event) {
    event.preventDefault();

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
})

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