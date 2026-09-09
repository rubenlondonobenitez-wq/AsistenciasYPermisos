document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.requests-list');
    const auditLog = document.querySelector('.audit-log');

    // 1. Cargar y ordenar solicitudes por hora de llegada (recientes primero)
    function renderRequests() {
        const requests = JSON.parse(localStorage.getItem('mago_requests') || '[]');
        
        if (requests.length === 0) {
            container.innerHTML = `<p style="color: var(--muted); text-align: center; padding: 2rem;">No hay solicitudes pendientes.</p>`;
            return;
        }

        // Ordenar cronológicamente descendente
        requests.sort((a, b) => b.rawTime - a.rawTime);

        container.innerHTML = requests.map(req => `
            <div class="stat-card" style="display: block; border-left: 4px solid ${getStatusBorder(req.status)}; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div>
                        <span class="font-mono font-bold" style="color: var(--accent); font-size: 0.85rem;">${req.timestamp}</span>
                        <h4 style="font-size: 1.1rem; margin-top: 0.2rem;">${req.student}</h4>
                    </div>
                    <span class="badge ${getStatusBadgeClass(req.status)}">${req.status.toUpperCase()}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.88rem; margin-bottom: 0.75rem; background: var(--surface2); padding: 0.75rem; border-radius: 8px;">
                    <div><strong style="color: var(--muted);">Destino:</strong> ${req.destination}</div>
                    <div><strong style="color: var(--muted);">Dirigido a:</strong> ${req.targetPerson}</div>
                </div>
                ${req.status === 'pendiente' ? `
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                        <button onclick="updateStatus('${req.id}', 'denegado')" class="btn-secondary" style="color: var(--danger); border-color: rgba(198,40,40,0.3);">Denegar</button>
                        <button onclick="updateStatus('${req.id}', 'aprobado')" class="btn-primary" style="background: var(--success);">Aceptar</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Helpers de Estado
    window.getStatusBorder = (status) => status === 'aprobado' ? 'var(--success)' : status === 'denegado' ? 'var(--danger)' : 'var(--warning)';
    window.getStatusBadgeClass = (status) => status === 'aprobado' ? 'status-presente' : status === 'denegado' ? 'status-ausente' : 'status-tarde';

    // Update de Estado y Auditoría
    window.updateStatus = (id, newStatus) => {
        let requests = JSON.parse(localStorage.getItem('mago_requests') || '[]');
        requests = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
        localStorage.setItem('mago_requests', JSON.stringify(requests));

        // Agregar al Log
        const item = document.createElement('li');
        item.innerHTML = `Solicitud ${id} ${newStatus.toUpperCase()} <span class="time">${new Date().toLocaleTimeString()} — Por Superior</span>`;
        auditLog.prepend(item);

        renderRequests();
    };

    renderRequests();
});