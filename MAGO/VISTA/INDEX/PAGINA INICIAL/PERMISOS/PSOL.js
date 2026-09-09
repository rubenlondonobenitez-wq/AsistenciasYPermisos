document.addEventListener('DOMContentLoaded', () => {
    const timestampElem = document.getElementById('autoTimestamp');
    const form = document.getElementById('permissionForm');

    // 1. Reloj en tiempo real para la hora de registro
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-CO', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        });
        if (timestampElem) timestampElem.textContent = timeString;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 2. Envío de solicitud y almacenamiento
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const newRequest = {
            id: 'PERM-' + Date.now().toString().slice(-4),
            timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }),
            rawTime: new Date().getTime(),
            student: document.getElementById('studentInfo').value,
            destination: document.getElementById('destination').value,
            targetPerson: document.getElementById('targetPerson').value,
            status: 'pendiente'
        };

        // Guardar en LocalStorage para simular backend
        const requests = JSON.parse(localStorage.getItem('mago_requests') || '[]');
        requests.push(newRequest);
        localStorage.setItem('mago_requests', JSON.stringify(requests));

        alert('✅ Solicitud enviada correctamente con marca de agua horaria.');
        form.reset();
        updateClock();
    });
});