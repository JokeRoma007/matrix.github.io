let matrix = [];
let rows = 0, cols = 0;
const matrixContainer = document.getElementById("matrixContainer");
const result = document.getElementById("result");
const resultContainer = document.getElementById("resultContainer");

function createMatrix() {
    rows = parseInt(document.getElementById("rows").value);
    cols = parseInt(document.getElementById("cols").value);
    if (!rows || !cols) return;

    matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
    matrixContainer.innerHTML = "";

    for (let i = 0; i < rows; i++) {
        let rowDiv = document.createElement("div");
        rowDiv.className = "matrixRow";
        for (let j = 0; j < cols; j++) {
            let input = document.createElement("input");
            input.type = "number";
            input.value = "0";
            input.dataset.row = i;
            input.dataset.col = j;
            input.oninput = updateMatrixFromInputs;
            rowDiv.appendChild(input);
        }
        matrixContainer.appendChild(rowDiv);
    }
}

function updateMatrixFromInputs() {
    const inputs = matrixContainer.getElementsByTagName("input");
    for (let input of inputs) {
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        matrix[r][c] = parseFloat(input.value) || 0;
    }
}

function toRowEchelonForm(mat) {
    let m = JSON.parse(JSON.stringify(mat)); 
    let lead = 0;
    for (let r = 0; r < m.length; r++) {
        if (lead >= m[0].length) return m;
        let i = r;
        while (m[i][lead] === 0) {
            i++;
            if (i === m.length) {
                i = r;
                lead++;
                if (lead === m[0].length) return m;
            }
        }

        [m[i], m[r]] = [m[r], m[i]]; 
        let lv = m[r][lead];
        for (let j = 0; j < m[0].length; j++) {
            m[r][j] /= lv;
        }

        for (let i = r + 1; i < m.length; i++) {
            let lv2 = m[i][lead];
            for (let j = 0; j < m[0].length; j++) {
                m[i][j] -= lv2 * m[r][j];
            }
        }
        lead++;
    }
    return m;
}

function displayResultMatrix(mat) {
    result.innerHTML = "";
    for (let row of mat) {
        let rowStr = row.map(num => Number(num.toFixed(2))).join(" ");
        let div = document.createElement("div");
        div.textContent = rowStr;
        result.appendChild(div);
    }
    resultContainer.style.display = "block";
}

function calculateDeterminant(matrix) {
    if (matrix.length !== matrix[0].length) {
        alert("Matice musí být čtvercová pro výpočet determinantu.");
        return null;
    }

    return determinant(matrix);
}

function determinant(m) {
    const n = m.length;
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0]*m[1][1] - m[0][1]*m[1][0];

    let det = 0;
    for (let i = 0; i < n; i++) {
        let minor = m.slice(1).map(row => row.filter((_, j) => j !== i));
        det += ((i % 2 === 0 ? 1 : -1) * m[0][i] * determinant(minor));
    }
    return det;
}

function solveLinearSystem() {
    updateMatrixFromInputs(); 
    const n = matrix.length;
    const m = matrix[0].length;

    if (n !== m) {
        alert("Matice koeficientů musí být čtvercová.");
        return;
    }
    
    const rhsInput = document.getElementById("rhs").value.trim();
    const rhs = rhsInput.split(",").map(Number);

    if (rhs.length !== n) {
        alert("Počet hodnot na pravé straně musí odpovídat počtu rovnic.");
        return;
    }

    try {
        const A = math.matrix(matrix);
        const B = math.matrix(rhs);
        const solution = math.lusolve(A, B);
        displaySolution(solution);
    } catch (e) {
        alert("Soustavu nelze vyřešit: " + e.message);
    }
}

function displaySolution(sol) {
    result.innerHTML = "<strong>Řešení:</strong><br>";
    sol.forEach((val, i) => {
        result.innerHTML += `x<sub>${i + 1}</sub> = ${Number(val).toFixed(4)}<br>`;
    });
    resultContainer.style.display = "block";
}

function clearMatrix() {
    matrix = [];
    matrixContainer.innerHTML = "";
    result.innerHTML = "";
    resultContainer.style.display = "none";
    document.getElementById("rows").value = "";
    document.getElementById("cols").value = "";
}

document.getElementById("createMatrix").addEventListener("click", createMatrix);
document.getElementById("toEchelon").addEventListener("click", () => {
    updateMatrixFromInputs();
    const echelon = toRowEchelonForm(matrix);
    displayResultMatrix(echelon);
});
document.getElementById("calculateDeterminant").addEventListener("click", () => {
    updateMatrixFromInputs();
    const det = calculateDeterminant(matrix);
    if (det !== null) {
        result.innerHTML = `Determinant: ${det.toFixed(2)}`;
        resultContainer.style.display = "block";
    }
});
document.getElementById("solveSystem").addEventListener("click", solveLinearSystem);
document.getElementById("clearMatrix").addEventListener("click", clearMatrix);