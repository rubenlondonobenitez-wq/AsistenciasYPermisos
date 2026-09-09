        // ============ GENERACIÓN DE DATOS ============
        const nombres = [
            "Valentina", "Santiago", "Isabella", "Mateo", "Lucía", "Sebastián", "Camila", "Nicolás",
            "Mariana", "Jerónimo", "Antonia", "Daniel", "Emilia", "Samuel", "Victoria", "Joaquín",
            "Renata", "Matías", "Josefa", "Benjamín", "Florencia", "Lucas", "Amanda", "Tomás",
            "Catalina", "Gabriel", "Valeria", "Adrián", "Fernanda", "Cristóbal", "Daniela", "Maximiliano",
            "Julieta", "Emiliano", "Rocío", "Leonardo", "Paz", "Felipe", "Javiera", "Ignacio",
            "Andrea", "Miguel", "Patricia", "Roberto", "Carmen", "Francisco", "Isabel", "José",
            "Raquel", "Fernando", "Gabriela", "Héctor", "Julia", "Kevin", "Lorena", "Marcos",
            "Natalia", "Oscar", "Paola", "Rafael", "Susana", "Tomás", "Úrsula", "Vicente"
        ];

        const apellidos = [
            "García", "Martínez", "Rodríguez", "López", "Sánchez", "Fernández", "Torres", "Ramírez",
            "Díaz", "Cruz", "Flores", "Morales", "Ortiz", "Reyes", "Gutiérrez", "Mendoza",
            "Aguilar", "Campos", "Peña", "Rivas", "Guerrero", "Santana", "Iglesias", "León",
            "Navarro", "Bernal", "Rojas", "Castro", "Méndez", "Herrera", "Jiménez", "Silva",
            "Salazar", "Paredes", "Ortega", "Fuentes", "Acosta", "Espinoza", "Contreras", "Ríos",
            "Muñoz", "Soto", "Valenzuela", "Vega", "Figueroa", "Luna", "Guzmán", "Tapia",
            "Sandoval", "Ibáñez", "Castillo", "Carrasco", "Pizarro", "Fuenzalida", "Medina", "Vargas"
        ];

        function generarNombreAleatorio() {
            const nombre = nombres[Math.floor(Math.random() * nombres.length)];
            const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
            const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
            return `${nombre} ${apellido1} ${apellido2}`;
        }

        function generarEstudiantesUnicos(cantidad) {
            const estudiantes = new Set();
            while (estudiantes.size < cantidad) {
                estudiantes.add(generarNombreAleatorio());
            }
            return Array.from(estudiantes).sort();
        }

        function generarTodosLosGrupos() {
            const grupos = {};
            const grados = ["6°", "7°", "8°", "9°", "10°", "11°"];
            const subgrupos = ["1", "2", "3", "4"];

            grados.forEach(grado => {
                subgrupos.forEach(subgrupo => {
                    const nombreGrupo = `${grado}${subgrupo}`;
                    const cantidad = Math.floor(Math.random() * 5) + 28;
                    grupos[nombreGrupo] = generarEstudiantesUnicos(cantidad);
                });
            });
            return grupos;
        }

        function generarDirectores(grupos) {
            const directores = {};
            const nombresGrupos = Object.keys(grupos).sort((a, b) => {
                const gradoA = parseInt(a);
                const gradoB = parseInt(b);
                if (gradoA !== gradoB) return gradoA - gradoB;
                return a.localeCompare(b);
            });

            const nombresUtilizados = new Set();
            nombresGrupos.forEach(grupo => {
                let nombreDirector;
                do {
                    nombreDirector = generarNombreAleatorio();
                } while (nombresUtilizados.has(nombreDirector));
                nombresUtilizados.add(nombreDirector);
                directores[grupo] = nombreDirector;
            });
            return directores;
        }

        const estudiantesPorGrupo = generarTodosLosGrupos();
        const directoresPorGrupo = generarDirectores(estudiantesPorGrupo);

        const materiasProfesor = {
            "Matemáticas": ["6°1", "6°2", "10°1", "10°2", "11°1", "11°2"],
            "Física": ["9°1", "9°2", "10°1", "11°1", "11°3"],
            "Química": ["9°3", "9°4", "10°2", "11°2", "11°4"],
            "Literatura": ["6°3", "6°4", "7°1", "7°2", "8°1", "8°2"],
            "Historia": ["6°1", "6°2", "7°3", "7°4", "8°3", "8°4"],
            "Inglés": ["9°1", "9°2", "10°1", "10°2", "11°1", "11°2", "11°3", "11°4"],
            "Educación Física": ["6°1", "6°2", "6°3", "6°4", "7°1", "7°2"],
            "Informática": ["8°1", "8°2", "9°1", "9°2", "10°1", "10°2"]
        };

        // Variables globales
        let firmaDigitalData = null;
        let asistenciaActual = {};
        let grupoActual = null;

        // Init stats
        document.addEventListener('DOMContentLoaded', () => {
            actualizarEstadisticas();
        });

        // ============ LÓGICA DE DESPLEGABLES ============
        function actualizarSegundoNivel() {
            const cargo = document.getElementById("cargo").value;
            const segundoNivel = document.getElementById("segundoNivel");
            const grupoSelect = document.getElementById("grupo");

            document.getElementById("studentsSection").style.display = "none";
            grupoSelect.style.display = "none";
            grupoSelect.disabled = true;
            grupoSelect.innerHTML = '<option value="">🔽 Seleccionar grupo</option>';

            if (!cargo) {
                segundoNivel.disabled = true;
                segundoNivel.innerHTML = '<option value="">🔽 Primero selecciona un cargo</option>';
                return;
            }

            segundoNivel.disabled = false;

            switch(cargo) {
                case "secretario":
                    segundoNivel.innerHTML = '<option value="">🔽 Seleccionar grupo (24 disponibles)</option>';
                    const gruposOrdenados = Object.keys(estudiantesPorGrupo).sort((a, b) => {
                        const gradoA = parseInt(a);
                        const gradoB = parseInt(b);
                        if (gradoA !== gradoB) return gradoA - gradoB;
                        return a.localeCompare(b);
                    });
                    gruposOrdenados.forEach(grupo => {
                        const option = document.createElement("option");
                        option.value = grupo;
                        option.textContent = `📚 ${grupo} (${estudiantesPorGrupo[grupo].length} estudiantes)`;
                        segundoNivel.appendChild(option);
                    });
                    segundoNivel.onchange = function() {
                        const grupoSeleccionado = this.value;
                        if (grupoSeleccionado) {
                            grupoActual = grupoSeleccionado;
                            cargarEstudiantes(grupoSeleccionado);
                        } else {
                            document.getElementById("studentsSection").style.display = "none";
                        }
                    };
                    break;

                case "director":
                    segundoNivel.innerHTML = '<option value="">🔽 Seleccionar director</option>';
                    const gruposDir = Object.keys(directoresPorGrupo).sort();
                    gruposDir.forEach(grupo => {
                        const nombreDirector = directoresPorGrupo[grupo];
                        const option = document.createElement("option");
                        option.value = grupo;
                        option.textContent = `👨‍🏫 ${nombreDirector} (${grupo})`;
                        segundoNivel.appendChild(option);
                    });
                    segundoNivel.onchange = function() {
                        const grupoSeleccionado = this.value;
                        if (grupoSeleccionado) {
                            grupoActual = grupoSeleccionado;
                            cargarEstudiantes(grupoSeleccionado);
                        } else {
                            document.getElementById("studentsSection").style.display = "none";
                        }
                    };
                    break;

                case "profesor":
                    segundoNivel.innerHTML = '<option value="">🔽 Seleccionar materia</option>';
                    Object.keys(materiasProfesor).forEach(materia => {
                        const option = document.createElement("option");
                        option.value = materia;
                        option.textContent = `📖 ${materia}`;
                        segundoNivel.appendChild(option);
                    });
                    segundoNivel.onchange = function() {
                        const materiaSeleccionada = this.value;
                        actualizarGruposProfesor(materiaSeleccionada);
                    };
                    break;
            }
        }

        function actualizarGruposProfesor(materia) {
            const grupoSelect = document.getElementById("grupo");
            grupoSelect.style.display = "block";
            grupoSelect.disabled = true;
            grupoSelect.innerHTML = '<option value="">🔽 Seleccionar grupo</option>';
            document.getElementById("studentsSection").style.display = "none";

            if (!materia) return;

            grupoSelect.disabled = false;
            const grupos = materiasProfesor[materia];
            grupos.forEach(grupo => {
                const option = document.createElement("option");
                option.value = grupo;
                option.textContent = `📚 ${grupo} (${estudiantesPorGrupo[grupo].length} estudiantes)`;
                grupoSelect.appendChild(option);
            });
        }

        function manejarSegundoNivel() {}

        // ============ CARGA DE ESTUDIANTES ============
        function cargarEstudiantes(grupo) {
            if (!grupo) {
                grupo = document.getElementById("grupo").value;
            }

            if (!grupo || !estudiantesPorGrupo[grupo]) {
                document.getElementById("studentsSection").style.display = "none";
                return;
            }

            grupoActual = grupo;

            if (!asistenciaActual[grupo]) {
                asistenciaActual[grupo] = {};
                estudiantesPorGrupo[grupo].forEach(est => {
                    asistenciaActual[grupo][est] = null;
                });
            }

            document.getElementById("currentGroup").textContent = grupo;
            document.getElementById("studentCount").textContent = estudiantesPorGrupo[grupo].length;

            if (directoresPorGrupo[grupo]) {
                document.getElementById("currentDirector").textContent = directoresPorGrupo[grupo];
                document.getElementById("currentDirector").parentElement.style.display = "";
            } else {
                document.getElementById("currentDirector").parentElement.style.display = "none";
            }

            const tbody = document.getElementById("studentsTableBody");
            tbody.innerHTML = estudiantesPorGrupo[grupo].map((estudiante, index) => {
                const estadoActual = asistenciaActual[grupo][estudiante];
                return `
                    <tr>
                        <td><span class="student-number">${index + 1}</span></td>
                        <td>👤 ${estudiante}</td>
                        <td>
                            <div class="attendance-buttons">
                                <button type="button" class="attendance-btn presente ${estadoActual === 'Asistió' ? 'active' : ''}"
                                        onclick="registrarEstado('${grupo}', '${estudiante}', 'Asistió', this)">
                                    ✅ Asistió
                                </button>
                                <button type="button" class="attendance-btn falto ${estadoActual === 'Faltó' ? 'active' : ''}"
                                        onclick="registrarEstado('${grupo}', '${estudiante}', 'Faltó', this)">
                                    ❌ Faltó
                                </button>
                                <button type="button" class="attendance-btn tarde ${estadoActual === 'Llegada tarde' ? 'active' : ''}"
                                        onclick="registrarEstado('${grupo}', '${estudiante}', 'Llegada tarde', this)">
                                    ⏰ Llegada tarde
                                </button>
                                <button type="button" class="attendance-btn excusa ${estadoActual === 'Inasistencia con excusa' ? 'active' : ''}"
                                        onclick="registrarEstado('${grupo}', '${estudiante}', 'Inasistencia con excusa', this)">
                                    📄 Con excusa
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            document.getElementById("studentsSection").style.display = "block";
            actualizarProgreso(grupo);
        }

        function registrarEstado(grupo, estudiante, estado, boton) {
            asistenciaActual[grupo][estudiante] = estado;

            const botones = boton.parentElement.querySelectorAll('.attendance-btn');
            botones.forEach(btn => btn.classList.remove('active'));
            boton.classList.add('active');

            actualizarProgreso(grupo);
        }

        function actualizarProgreso(grupo) {
            if (!asistenciaActual[grupo]) return;

            const total = Object.keys(asistenciaActual[grupo]).length;
            const registrados = Object.values(asistenciaActual[grupo]).filter(v => v !== null).length;
            const porcentaje = (registrados / total) * 100;

            document.getElementById("progressFill").style.width = porcentaje + "%";
        }

        // ============ FIRMA ============
        function cargarFirmaDigital(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                firmaDigitalData = e.target.result;
                mostrarFirma(firmaDigitalData);
                document.getElementById("firmaData").value = firmaDigitalData;
            };
            reader.readAsDataURL(file);
        }

        function mostrarFirma(dataUrl) {
            const preview = document.getElementById("signaturePreview");
            const placeholder = document.getElementById("signaturePlaceholder");
            const clearBtn = document.getElementById("btnClearFirma");

            preview.src = dataUrl;
            preview.style.display = "block";
            placeholder.style.display = "none";
            clearBtn.style.display = "inline-block";
        }

        function abrirFirmaVirtual() {
            const modal = document.getElementById("firmaModal");
            modal.style.display = "flex";

            const canvas = document.getElementById("firmaCanvas");
            const ctx = canvas.getContext("2d");

            canvas.width = 400;
            canvas.height = 150;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "#1a1a1a";
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            let drawing = false;

            function getPosition(e) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;

                let clientX, clientY;
                if (e.touches && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                return {
                    x: (clientX - rect.left) * scaleX,
                    y: (clientY - rect.top) * scaleY
                };
            }

            function startDrawing(e) {
                e.preventDefault();
                drawing = true;
                const pos = getPosition(e);
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
            }

            function draw(e) {
                e.preventDefault();
                if (!drawing) return;
                const pos = getPosition(e);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
            }

            function stopDrawing(e) {
                e.preventDefault();
                drawing = false;
            }

            canvas.onmousedown = startDrawing;
            canvas.onmousemove = draw;
            canvas.onmouseup = stopDrawing;
            canvas.onmouseleave = stopDrawing;
            canvas.ontouchstart = startDrawing;
            canvas.ontouchmove = draw;
            canvas.ontouchend = stopDrawing;
        }

        function limpiarFirmaCanvas() {
            const canvas = document.getElementById("firmaCanvas");
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function guardarFirmaModal() {
            const canvas = document.getElementById("firmaCanvas");
            firmaDigitalData = canvas.toDataURL();
            mostrarFirma(firmaDigitalData);
            document.getElementById("firmaData").value = firmaDigitalData;
            cerrarFirmaModal();
        }

        function cerrarFirmaModal() {
            document.getElementById("firmaModal").style.display = "none";
        }

        function limpiarFirma() {
            firmaDigitalData = null;
            document.getElementById("firmaData").value = "";
            document.getElementById("signaturePreview").style.display = "none";
            document.getElementById("signaturePlaceholder").style.display = "block";
            document.getElementById("btnClearFirma").style.display = "none";
        }

        // ============ GUARDAR ASISTENCIA ============
        function guardarAsistencia() {
            const cargo = document.getElementById("cargo").value;
            const grupo = grupoActual;
            const firma = document.getElementById("firmaData").value;

            if (!cargo) {
                mostrarMensaje("⚠️ Selecciona tu cargo", "error");
                return;
            }
            if (!grupo) {
                mostrarMensaje("⚠️ Selecciona un grupo", "error");
                return;
            }
            if (!firma) {
                mostrarMensaje("⚠️ Debes firmar antes de guardar", "error");
                return;
            }

            const estudiantesSinRegistro = Object.entries(asistenciaActual[grupo] || {})
                .filter(([_, estado]) => estado === null)
                .map(([nombre]) => nombre);

            if (estudiantesSinRegistro.length > 0) {
                mostrarMensaje(`⚠️ Falta registrar ${estudiantesSinRegistro.length} estudiantes`, "error");
                return;
            }

            const ahora = new Date();
            const fecha = ahora.toLocaleDateString("es-CO");
            const hora = ahora.toLocaleTimeString("es-CO");

            const nuevosRegistros = Object.entries(asistenciaActual[grupo]).map(([estudiante, estado]) => ({
                id: Date.now() + Math.random(),
                nombre: estudiante,
                grupo: grupo,
                estado: estado,
                fecha: fecha,
                hora: hora,
                cargo: cargo,
                registradoPor: cargo === "director" ? directoresPorGrupo[grupo] : cargo,
                firma: firma
            }));

            let asistencias = JSON.parse(localStorage.getItem("asistencias")) || [];
            asistencias.unshift(...nuevosRegistros);
            localStorage.setItem("asistencias", JSON.stringify(asistencias));

            asistenciaActual[grupo] = {};
            cargarEstudiantes(grupo);

            mostrarMensaje(`✅ Asistencia de ${grupo} registrada (${nuevosRegistros.length} estudiantes)`, "success");
            actualizarEstadisticas();
        }

        // ============ ESTADÍSTICAS ============
        function actualizarEstadisticas() {
            const asistencias = JSON.parse(localStorage.getItem("asistencias")) || [];
            const hoy = new Date().toLocaleDateString("es-CO");
            const registrosHoy = asistencias.filter(r => r.fecha === hoy);

            document.getElementById("totalHoy").textContent = registrosHoy.length;
            document.getElementById("presentesHoy").textContent = registrosHoy.filter(r => r.estado === "Asistió").length;
            document.getElementById("ausentesHoy").textContent = registrosHoy.filter(r => r.estado === "Faltó").length;
            document.getElementById("tardanzasHoy").textContent = registrosHoy.filter(r => r.estado === "Llegada tarde").length;

            mostrarAusentesHoy();
        }

        function mostrarAusentesHoy() {
            const asistencias = JSON.parse(localStorage.getItem("asistencias")) || [];
            const hoy = new Date().toLocaleDateString("es-CO");
            const ausentesHoy = asistencias.filter(r => r.fecha === hoy && (r.estado === "Faltó" || r.estado === "Inasistencia con excusa"));
            const container = document.getElementById("ausentesList");

            if (ausentesHoy.length === 0) {
                container.innerHTML = '<p class="muted">✅ No hay ausentes registrados hoy</p>';
                return;
            }

            container.innerHTML = ausentesHoy.slice(0, 20).map(r => `
                <div class="ausente-item">
                    <div class="ausente-nombre">${r.nombre}</div>
                    <div class="ausente-info">
                        <span class="curso-badge">${r.grupo}</span>
                        <span class="motivo-badge">${r.estado}</span>
                    </div>
                </div>
            `).join('') + (ausentesHoy.length > 20 ? `<p class="muted">... y ${ausentesHoy.length - 20} más</p>` : '');
        }

        function mostrarMensaje(texto, tipo) {
            const mensajeDiv = document.getElementById("mensaje");
            mensajeDiv.textContent = texto;
            mensajeDiv.style.color = tipo === "error" ? "var(--danger)" : "var(--success)";
            mensajeDiv.style.background = tipo === "error" ? "var(--danger-bg)" : "var(--success-bg)";
            mensajeDiv.style.display = "block";

            setTimeout(() => {
                mensajeDiv.style.display = "none";
            }, 4000);
        }