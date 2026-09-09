function cargarTabla() {
    let datos = JSON.parse(localStorage.getItem("asistencia")) || [];
    let tbody = document.querySelector("#tabla tbody");

    tbody.innerHTML = "";

    datos.forEach((r, index) => {
        let fila = `
        <tr>
            <td>${r.estudiante}</td>
            <td>${r.curso}</td>
            <td>${r.estado}</td>
            <td>${r.motivo}</td>
            <td>${r.fecha}</td>
            <td>${r.hora}</td>
            <td>
                <button onclick="enviarReporte(${index})">Enviar</button>
            </td>
        </tr>
        `;

        tbody.innerHTML += fila;
    });
}

// REUTILIZA FUNCIÓN
function enviarReporte(index) {
    let datos = JSON.parse(localStorage.getItem("asistencia"));
    let r = datos[index];

    alert(
        "📩 Reporte enviado al acudiente\n\n" +
        "Estudiante: " + r.estudiante +
        "\nCurso: " + r.curso +
        "\nMotivo: " + r.motivo +
        "\nFecha: " + r.fecha +
        "\nHora: " + r.hora
    );
}