document.addEventListener('DOMContentLoaded', () => {
    // ── ELEMENTOS DEL DOM ──
    const tabs = document.querySelectorAll('.auth-tab');
    const panels = document.querySelectorAll('.auth-panel');
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    const loginForm = document.getElementById('loginForm');
    const docInput = document.getElementById('documentId');
    const pwdInput = document.getElementById('password');
    const rolSelect = document.getElementById('rol');
    const btnFingerprint = document.getElementById('btnFingerprint');
    const btnFacial = document.getElementById('btnFacial');

    // ── MOSTRAR Y OCULTAR MENSAJES ──
    function hideMessages() {
        if (errorDiv) {
            errorDiv.classList.remove('show');
            errorDiv.textContent = '';
        }
        if (successDiv) {
            successDiv.classList.remove('show');
            successDiv.textContent = '';
        }
    }

    function showError(message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }
    }

    function showSuccess(message) {
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.classList.add('show');
        }
    }

    // ── CAMBIO DE PESTAÑAS (TABS) ──
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                panels.forEach(p => p.classList.remove('active'));
                const target = this.getAttribute('data-tab');
                const panel = document.getElementById('panel-' + target);
                if (panel) {
                    panel.classList.add('active');
                }
                hideMessages();
            });
        });
    }

    // ── FORMULARIO CLÁSICO Y REDIRECCIÓN POR ROL ──
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const documentId = docInput ? docInput.value.trim() : '';
            const password = pwdInput ? pwdInput.value : '';
            const rol = rolSelect ? rolSelect.value : '';

            hideMessages();

            // Validaciones
            if (!documentId || !password || !rol) {
                showError('Por favor, completa todos los campos, incluyendo la selección de rol.');
                return;
            }

            if (documentId.length < 6) {
                showError('El documento de identidad debe tener al menos 6 caracteres.');
                return;
            }

            if (!/^\d+$/.test(documentId)) {
                showError('El documento de identidad debe contener solo números.');
                return;
            }

            if (password.length < 4) {
                showError('La contraseña debe tener al menos 4 caracteres.');
                return;
            }

            // Mapa de rutas según el rol
            const paginasPorRol = {
                'acudiente': 'PAGINA INICIAL/PIA.html',
                'estudiante': 'PAGINA INICIAL/PIE.html',
                'superior': 'PAGINA INICIAL/PIS.html'
            };

            if (!paginasPorRol[rol]) {
                showError('El rol seleccionado no es válido.');
                return;
            }

            // Estado visual de carga del botón
            const btn = loginForm.querySelector('.btn-login');
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '0.7';
                btn.textContent = 'Procesando...';
            }

            showSuccess('Inicio de sesión exitoso. Redirigiendo a tu panel institucional...');

            // Redirección con retardo simulado
            setTimeout(() => {
                window.location.href = paginasPorRol[rol];
            }, 1500);
        });
    }

    // ── BOTÓN HUELLA DIGITAL ──
    if (btnFingerprint) {
        btnFingerprint.addEventListener('click', function() {
            hideMessages();
            const btn = this;
            btn.disabled = true;
            btn.textContent = 'Escaneando huella...';
            btn.style.opacity = '0.8';

            setTimeout(() => {
                showSuccess('Huella digital verificada correctamente. Acceso concedido. Redirigiendo...');
                btn.textContent = 'Huella aceptada';
                btn.style.opacity = '1';
                btn.style.background = '#2d6a4f';

                setTimeout(() => {
                    alert('Autenticación biométrica exitosa.\n\nTu huella digital ha sido validada correctamente.');
                    btn.disabled = false;
                    btn.textContent = 'Escanear huella digital';
                    btn.style.background = '';
                    btn.style.opacity = '1';
                    hideMessages();
                }, 1500);
            }, 2000);
        });
    }

    // ── BOTÓN RECONOCIMIENTO FACIAL ──
    if (btnFacial) {
        btnFacial.addEventListener('click', function() {
            hideMessages();
            const btn = this;
            btn.disabled = true;
            btn.textContent = 'Analizando rostro...';
            btn.style.opacity = '0.8';

            setTimeout(() => {
                showSuccess('Rostro verificado correctamente. Identidad confirmada. Redirigiendo...');
                btn.textContent = 'Identidad confirmada';
                btn.style.opacity = '1';
                btn.style.background = '#2d6a4f';

                setTimeout(() => {
                    alert('Reconocimiento facial exitoso.\n\nTu identidad ha sido verificada mediante análisis facial.');
                    btn.disabled = false;
                    btn.textContent = 'Iniciar reconocimiento facial';
                    btn.style.background = '';
                    btn.style.opacity = '1';
                    hideMessages();
                }, 1500);
            }, 2200);
        });
    }

    // ── VALIDACIÓN EN TIEMPO REAL ──
    if (docInput) {
        docInput.addEventListener('input', function() {
            hideMessages();
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        docInput.addEventListener('keypress', function(e) {
            if (this.value.length >= 15) {
                e.preventDefault();
            }
        });
    }

    if (pwdInput) {
        pwdInput.addEventListener('input', function() {
            hideMessages();
        });
    }

    if (rolSelect) {
        rolSelect.addEventListener('change', function() {
            hideMessages();
        });
    }
});