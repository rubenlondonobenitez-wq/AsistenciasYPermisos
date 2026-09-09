// Configuración global
const API_URL = 'api.php';
const HORA_ENTRADA = '06:10';

let students = [];
let reports = {};
let weeklyReports = {};

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    await loadStudents();
    initializeReports();
    loadWeeklyReports();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    await loadTodayReports();
    renderTable();
    updateStats();
    addWeeklyEmailButton();
});

// Cargar estudiantes desde la API
async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}?action=estudiantes`);
        const data = await response.json();
        
        if (data.success) {
            students = data.estudiantes.map(s => ({
                id: s.id,
                name: `${s.nombre} ${s.apellido}`,
                email: s.email,
                grado: s.grado
            }));
        }
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        showNotification('Error al cargar estudiantes', 'error');
    }
}

// Cargar reportes del día
async function loadTodayReports() {
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch(`${API_URL}?action=reportes&fecha=${today}`);
        const data = await response.json();
        
        if (data.success && data.reportes) {
            data.reportes.forEach(reporte => {
                reports[reporte.estudiante_id] = {
                    arrivalTime: reporte.hora_llegada || '',
                    attendance: reporte.asistencia,
                    news: reporte.novedades || '',
                    anomalies: reporte.anomalias || '',
                    status: reporte.estado,
                    arrivalStatus: getStatusText(reporte.estado)
                };
            });
        }
    } catch (error) {
        console.error('Error al cargar reportes:', error);
    }
}

// Función mejorada para guardar reporte
async function saveReport() {
    const studentId = parseInt(document.getElementById('studentId').value);
    const arrivalTime = document.getElementById('arrivalTime').value;
    const attendance = document.getElementById('attendance').value;
    const news = document.getElementById('news').value;
    const anomalies = document.getElementById('anomalies').value;
    
    // Determinar estado basado en la hora de llegada
    let status = attendance;
    let arrivalStatus = '';
    
    if (attendance === 'absent') {
        status = 'absent';
        arrivalStatus = 'Ausente';
    } else if (attendance === 'present' && arrivalTime) {
        if (arrivalTime > HORA_ENTRADA) {
            status = 'late';
            arrivalStatus = 'Llegada tarde';
        } else {
            status = 'present';
            arrivalStatus = 'A tiempo';
        }
    } else if (attendance === 'late') {
        status = 'late';
        arrivalStatus = 'Llegada tarde';
    }
    
    // Guardar el reporte localmente
    reports[studentId] = {
        arrivalTime: arrivalTime || '',
        attendance: attendance,
        news: news,
        anomalies: anomalies,
        status: status,
        arrivalStatus: arrivalStatus,
        lastModified: new Date().toISOString()
    };
    
    // Guardar en el servidor
    try {
        const response = await fetch(`${API_URL}?action=guardar_reporte`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                estudiante_id: studentId,
                fecha: new Date().toISOString().split('T')[0],
                hora_llegada: arrivalTime || null,
                asistencia: attendance,
                novedades: news,
                anomalias: anomalies,
                estado: status
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            updateWeeklyReport(studentId, status, arrivalTime, news, anomalies);
            saveReports();
            saveWeeklyReports();
            renderTable();
            updateStats();
            closeModal();
            
            showNotification(`Reporte de ${getStudentName(studentId)} actualizado: ${arrivalStatus}`, 'success');
            
            if (status === 'absent') {
                checkAbsenceAlert(studentId);
            }
        } else {
            showNotification('Error al guardar en el servidor', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        // Guardar localmente como respaldo
        saveReports();
        renderTable();
        updateStats();
        closeModal();
        showNotification('Guardado localmente (sin conexión al servidor)', 'warning');
    }
}

// Guardar todos los reportes
async function saveAllReports() {
    if (Object.keys(reports).length === 0) {
        showNotification('No hay reportes para guardar', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?action=guardar_todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fecha: new Date().toISOString().split('T')[0],
                reportes: reports
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Todos los reportes guardados exitosamente', 'success');
        } else {
            showNotification('Error al guardar los reportes', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión al guardar', 'error');
    }
}

// Función para abrir modal de edición
function openEditModal(studentId) {
    const student = students.find(s => s.id === studentId);
    const report = reports[studentId] || {
        arrivalTime: '',
        attendance: 'absent',
        news: '',
        anomalies: ''
    };
    
    document.getElementById('studentId').value = studentId;
    document.getElementById('studentName').value = student.name;
    document.getElementById('arrivalTime').value = report.arrivalTime || '';
    document.getElementById('attendance').value = report.attendance || 'absent';
    document.getElementById('news').value = report.news || '';
    document.getElementById('anomalies').value = report.anomalies || '';
    
    updateTimeBasedOnAttendance();
    
    document.getElementById('editModal').style.display = 'block';
}

// Renderizar tabla
function renderTable(filter = 'all') {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    const filteredStudents = filter === 'all' 
        ? students 
        : students.filter(s => {
            const report = reports[s.id];
            return report && report.status === filter;
        });
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    <i class="fas fa-info-circle"></i> No se encontraron registros
                </td>
            </tr>
        `;
        return;
    }
    
    filteredStudents.forEach(student => {
        const report = reports[student.id] || {
            arrivalTime: '',
            attendance: 'absent',
            news: '',
            anomalies: '',
            status: 'absent',
            arrivalStatus: 'Sin registro'
        };
        
        const row = document.createElement('tr');
        row.className = `status-${report.status}`;
        
        row.innerHTML = `
            <td>
                <div class="student-info">
                    <strong>${student.name}</strong>
                    <small>${student.grado || ''}</small>
                </div>
            </td>
            <td>
                <input type="time" 
                       value="${report.arrivalTime}" 
                       onchange="updateTimeManually(${student.id}, this.value)"
                       ${report.attendance === 'absent' ? 'disabled' : ''}>
            </td>
            <td>
                <select onchange="updateAttendance(${student.id}, this.value)">
                    <option value="present" ${report.attendance === 'present' ? 'selected' : ''}>Presente</option>
                    <option value="late" ${report.attendance === 'late' ? 'selected' : ''}>Tarde</option>
                    <option value="absent" ${report.attendance === 'absent' ? 'selected' : ''}>Ausente</option>
                </select>
            </td>
            <td>
                <input type="text" 
                       value="${report.news}" 
                       placeholder="Novedades"
                       onchange="updateField(${student.id}, 'news', this.value)">
            </td>
            <td>
                <input type="text" 
                       value="${report.anomalies}" 
                       placeholder="Anomalías"
                       onchange="updateField(${student.id}, 'anomalies', this.value)">
            </td>
            <td>
                <span class="badge badge-${report.status}">
                    ${report.arrivalStatus}
                </span>
            </td>
            <td>
                <button class="btn-icon" onclick="openEditModal(${student.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="clearReport(${student.id})" title="Limpiar">
                    <i class="fas fa-undo"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Actualizar estadísticas
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}?action=estadisticas&fecha=${new Date().toISOString().split('T')[0]}`);
        const data = await response.json();
        
        if (data.success && data.estadisticas) {
            document.getElementById('totalStudents').textContent = data.estadisticas.total_estudiantes || '0';
            document.getElementById('onTime').textContent = data.estadisticas.a_tiempo || '0';
            document.getElementById('late').textContent = data.estadisticas.tarde || '0';
            document.getElementById('absent').textContent = data.estadisticas.ausentes || '0';
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        
        // Calcular localmente como respaldo
        let onTime = 0, late = 0, absent = 0;
        
        students.forEach(student => {
            const report = reports[student.id];
            if (report) {
                switch(report.status) {
                    case 'present': onTime++; break;
                    case 'late': late++; break;
                    case 'absent': absent++; break;
                }
            } else {
                absent++;
            }
        });
        
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('onTime').textContent = onTime;
        document.getElementById('late').textContent = late;
        document.getElementById('absent').textContent = absent;
    }
}

// Utilidades
function getStudentName(studentId) {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Estudiante';
}

function getStatusText(status) {
    switch(status) {
        case 'present': return 'A tiempo';
        case 'late': return 'Tarde';
        case 'absent': return 'Ausente';
        default: return 'Sin registro';
    }
}

function updateTimeBasedOnAttendance() {
    const attendance = document.getElementById('attendance').value;
    const timeInput = document.getElementById('arrivalTime');
    
    if (attendance === 'absent') {
        timeInput.value = '';
        timeInput.disabled = true;
    } else {
        timeInput.disabled = false;
        if (!timeInput.value) {
            timeInput.value = HORA_ENTRADA;
        }
    }
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function filterTable() {
    const filter = document.getElementById('statusFilter').value;
    renderTable(filter);
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Actualizar fecha y hora
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    document.getElementById('currentDate').textContent = now.toLocaleDateString('es-ES', options);
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('es-ES');
}

// Inicializar reportes
function initializeReports() {
    const saved = localStorage.getItem('dailyReports');
    if (saved) {
        reports = JSON.parse(saved);
    }
}

// Guardar reportes localmente
function saveReports() {
    localStorage.setItem('dailyReports', JSON.stringify(reports));
}

// Cargar reportes semanales
function loadWeeklyReports() {
    const saved = localStorage.getItem('weeklyReports');
    if (saved) {
        weeklyReports = JSON.parse(saved);
    }
}

// Guardar reportes semanales
function saveWeeklyReports() {
    localStorage.setItem('weeklyReports', JSON.stringify(weeklyReports));
}

// Actualizar reporte semanal
function updateWeeklyReport(studentId, status, arrivalTime, news, anomalies) {
    const currentDate = new Date();
    const weekKey = getWeekKey(currentDate);
    
    if (!weeklyReports[weekKey]) {
        weeklyReports[weekKey] = {};
    }
    
    if (!weeklyReports[weekKey][studentId]) {
        weeklyReports[weekKey][studentId] = {
            days: {},
            summary: {
                present: 0,
                late: 0,
                absent: 0,
                totalDays: 0
            }
        };
    }
    
    const dayKey = currentDate.toISOString().split('T')[0];
    weeklyReports[weekKey][studentId].days[dayKey] = {
        status: status,
        arrivalTime: arrivalTime,
        news: news,
        anomalies: anomalies,
        timestamp: new Date().toISOString()
    };
    
    updateWeeklySummary(studentId, weekKey);
}

// Actualizar resumen semanal
function updateWeeklySummary(studentId, weekKey) {
    const weekData = weeklyReports[weekKey][studentId];
    let present = 0, late = 0, absent = 0;
    
    Object.values(weekData.days).forEach(day => {
        switch(day.status) {
            case 'present': present++; break;
            case 'late': late++; break;
            case 'absent': absent++; break;
        }
    });
    
    weekData.summary = {
        present: present,
        late: late,
        absent: absent,
        totalDays: present + late + absent
    };
}

// Obtener clave de semana
function getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().split('T')[0];
}

// Acciones rápidas
function markAllOnTime() {
    if (confirm('¿Marcar todos los estudiantes a tiempo?')) {
        students.forEach(student => {
            reports[student.id] = {
                arrivalTime: '06:00',
                attendance: 'present',
                news: '',
                anomalies: '',
                status: 'present',
                arrivalStatus: 'A tiempo'
            };
        });
        renderTable();
        updateStats();
        showNotification('Todos marcados a tiempo', 'success');
    }
}

function markAllLate() {
    if (confirm('¿Marcar todos los estudiantes tarde?')) {
        students.forEach(student => {
            reports[student.id] = {
                arrivalTime: '06:30',
                attendance: 'late',
                news: '',
                anomalies: '',
                status: 'late',
                arrivalStatus: 'Llegada tarde'
            };
        });
        renderTable();
        updateStats();
        showNotification('Todos marcados tarde', 'warning');
    }
}

function clearAllReports() {
    if (confirm('¿Limpiar todos los reportes? Esta acción no se puede deshacer.')) {
        reports = {};
        renderTable();
        updateStats();
        showNotification('Reportes limpiados', 'info');
    }
}

function clearReport(studentId) {
    if (confirm('¿Limpiar este reporte?')) {
        reports[studentId] = {
            arrivalTime: '',
            attendance: 'absent',
            news: '',
            anomalies: '',
            status: 'absent',
            arrivalStatus: 'Ausente'
        };
        renderTable();
        updateStats();
        showNotification('Reporte limpiado', 'info');
    }
}

// Verificar alerta por falta
function checkAbsenceAlert(studentId) {
    const student = students.find(s => s.id === studentId);
    const weekKey = getWeekKey(new Date());
    const weekData = weeklyReports[weekKey]?.[studentId];
    
    if (weekData && weekData.summary.absent >= 2) {
        showNotification(
            `⚠️ Alerta: ${student.name} tiene ${weekData.summary.absent} faltas esta semana`,
            'warning',
            5000
        );
    }
}

// Botón de envío semanal
function addWeeklyEmailButton() {
    const actionsPanel = document.querySelector('.actions-panel');
    
    const emailSection = document.createElement('div');
    emailSection.className = 'email-section';
    emailSection.innerHTML = `
        <h4 style="margin-top: 25px; padding-top: 25px; border-top: 2px solid #ddd;">
            <i class="fas fa-envelope"></i> Reporte Semanal
        </h4>
        <button class="action-btn email-btn" onclick="sendWeeklyEmail()">
            <i class="fas fa-paper-plane"></i> Enviar Correos Semanales
        </button>
    `;
    
    actionsPanel.appendChild(emailSection);
}

// Enviar correo semanal
async function sendWeeklyEmail() {
    const weekKey = getWeekKey(new Date());
    const weekData = weeklyReports[weekKey];
    
    if (!weekData) {
        showNotification('No hay reportes para esta semana', 'warning');
        return;
    }
    
    showNotification('Preparando envío de correos...', 'info');
    
    try {
        const response = await fetch(`${API_URL}?action=enviar_correos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                weekKey: weekKey,
                data: weekData
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Correos enviados exitosamente', 'success');
        } else {
            showNotification('Error al enviar correos', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión al enviar correos', 'error');
    }
}
