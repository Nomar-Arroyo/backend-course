// Entrega 05B — /learn. Interacciones significativas con datos ficticios.
// Cada mecanismo es un dato declarativo; ninguna credencial es real.

// ---------- Inspector ficticio ----------
const FAKE_TOKEN = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJpZCI6InVzcl8yMDI0X3ZhbGVudGluYSIsInJvbGUiOiJyZXF1ZXN0ZXIiLCJpYXQiOjE3MTkwMDAwMDAsImV4cCI6MTcxOTAwMzYwMH0',
  'firma_falsa_solo_demostrativa'
].join('.');

function decodeB64url(seg) {
  const base64 = seg.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  try {
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '(no es base64url válido)';
  }
}

function renderInspector() {
  const box = document.getElementById('inspector');
  if (!box) return;
  const segments = FAKE_TOKEN.split('.');
  box.innerHTML = `
    <p class="field">
      <label for="fake-token">Token ficticio (pre-cargado, no es real):</label>
      <code class="token" id="fake-token" tabindex="0">${segments
        .map((s) => `<span class="seg">${s.slice(0, 16)}…</span>`)
        .join('<span class="dot">.</span>')}</code>
    </p>
    <button type="button" id="inspect" class="btn">Decodificar las partes</button>
    <div id="inspector-out" aria-live="polite">
      <p class="hint">El header y el payload se leen con base64url. La firma NO se verifica aquí: eso vive solo en el servidor.</p>
    </div>`;
  document.getElementById('inspect').addEventListener('click', () => {
    const rows = [
      ['Header', decodeB64url(segments[0])],
      ['Payload', decodeB64url(segments[1])],
      ['Firma', segments[2]]
    ];
    document.getElementById('inspector-out').innerHTML =
      rows
        .map(([k, v]) => `<pre><strong>${k}</strong>\n${v}</pre>`)
        .join('') +
      '<p class="callout"><span class="badge badge-dato">Dato</span> Decodificar NO es verificar. Que el payload diga <em>role requester</em> no prueba nada: la prueba es la firma sobre el secreto del servidor.</p>';
  });
}

// ---------- Comparador ----------
// Dimensiones: 0 qué demuestra · 1 cómo se verifica · 2 costo si se filtra ·
//              3 ¿identifica a una persona? · 4 mitigación típica
const MECANISMOS = {
  password: {
    nombre: 'Password',
    params: [
      'Algo que sabes',
      'Hash lento con sal (scrypt/bcrypt/argon2)',
      'Alto: acceso a esa cuenta',
      'Sí (normalmente)',
      'Largo mínimo, MFA, nunca en claro'
    ],
    resume: 'Una palabra secreta que nunca viaja ni se guarda en claro; de ella se deriva un hash lento con sal.'
  },
  sesion: {
    nombre: 'Sesión con cookie',
    params: [
      'Estado autenticado mantenido en servidor',
      'El servidor la compara contra su almacén de sesiones',
      'Alto: permite actuar como la usuaria',
      'Sí (si se liga al login)',
      'Cookie HttpOnly + Secure + SameSite, expiración y revocación'
    ],
    resume: 'Estado "autenticado" que vive en el servidor; la cookie solo referencia la sesión.'
  },
  bearer: {
    nombre: 'Bearer token (JWT)',
    params: [
      'Posesión del token firmado',
      'Verificación de firma en cada request',
      'Alto: impersonación si se filtra',
      'Sí (por el contenido del token)',
      'TTL corto, HTTPS, rotación y revocación'
    ],
    resume: 'Token que se porta: el que lo tiene pasa. Stateless, se verifica la firma en cada request.'
  },
  apikey: {
    nombre: 'API key',
    params: [
      'La app/servicio consumidor',
      'Comparación contra el secret guardado',
      'Alto: acceso a la API en nombre de la app',
      'No: identifica la app, no a la persona',
      'Rotación, scopes, nunca en el cliente'
    ],
    resume: 'Secreto de larga vida para aplicaciones y servicios; no reemplaza la identidad del usuario.'
  },
  oauth: {
    nombre: 'OAuth 2 / OIDC',
    params: [
      'Autorización delegada (y con OIDC, identidad)',
      'El IdP emite tokens que tu app verifica (firma y aud)',
      'Medio: se mitiga con expiración y revocación',
      'Sí (con OpenID Connect)',
      'IdP maduro, MFA, validar audiencia y expiración'
    ],
    resume: 'Delegación con scopes; OIDC añade identidad. El password de la usuaria nunca llega a tu app.'
  }
};

const DIMENSIONES = [
  'Qué demuestra',
  'Cómo se verifica',
  'Costo si se filtra',
  '¿Identifica a una persona?',
  'Mitigación típica'
];

function renderComparator() {
  const box = document.getElementById('comparator');
  if (!box) return;
  const options = Object.keys(MECANISMOS)
    .map((k) => `<option value="${k}">${MECANISMOS[k].nombre}</option>`)
    .join('');
  box.innerHTML = `
    <div class="pick">
      <label for="cmp-a">Mecanismo A</label>
      <select id="cmp-a">${options}</select>
      <label for="cmp-b">Mecanismo B</label>
      <select id="cmp-b">${options}</select>
    </div>
    <div class="cmp-wrap">
      <table class="cmp">
        <thead>
          <tr><th scope="col">Dimensión</th><th id="th-a" scope="col"></th><th id="th-b" scope="col"></th></tr>
        </thead>
        <tbody id="cmp-body"></tbody>
      </table>
    </div>
    <p class="resume" id="cmp-resume" aria-live="polite"></p>`;
  const aSel = document.getElementById('cmp-a');
  const bSel = document.getElementById('cmp-b');
  const update = () => {
    const a = MECANISMOS[aSel.value];
    const b = MECANISMOS[bSel.value];
    document.getElementById('th-a').textContent = a.nombre;
    document.getElementById('th-b').textContent = b.nombre;
    document.getElementById('cmp-body').innerHTML = DIMENSIONES.map((dim, i) => {
      const same = a.params[i] === b.params[i];
      return `
        <tr>
          <th scope="row">${dim}</th>
          <td${same ? ' class="same-cell"' : ''}>${a.params[i]}</td>
          <td${same ? ' class="same-cell"' : ''}>${b.params[i]}</td>
        </tr>`;
    }).join('');
    document.getElementById('cmp-resume').textContent =
      `${a.nombre}: ${a.resume} · ${b.nombre}: ${b.resume}`;
  };
  aSel.addEventListener('change', update);
  bSel.addEventListener('change', update);
  update();
}

// ---------- Quiz ----------
const PREGUNTAS = [
  {
    q: 'Tu app recibe el password de la usuaria. ¿Qué guarda la base de datos?',
    opciones: ['El password tal cual, por si acaso', 'Un hash derivado con scrypt y sal', 'El email y el rol, sin relación entre ambos'],
    ok: 1,
    exp: 'Nunca guardamos el password en claro; guardamos un hash lento y con sal.'
  },
  {
    q: 'Un requester pide ver una solicitud de otro requester. ¿Qué respuesta es coherente con no filtrar existencia?',
    opciones: ['200 con datos', '403 Forbidden', '404 Not Found'],
    ok: 2,
    exp: '404 para recursos ajenos: la app no revela si el recurso existe o pertenece a otro.'
  },
  {
    q: 'JWT es:',
    opciones: ['Una solución completa de seguridad', 'Un formato de token firmado', 'Un mecanismo de cifrado de contenido'],
    ok: 1,
    exp: 'JWT es un formato compacto y firmado; firmado ≠ cifrado, y decodificar no verifica.'
  },
  {
    q: 'El frontend esconde el botón que cambia el estado para los requester. Esto es…',
    opciones: ['Autorización correcta y suficiente', 'UX, no autorización; el backend decide', 'Más seguro que hacerlo en el backend'],
    ok: 1,
    exp: 'Ocultar botones es UX. La política real vive y se hace cumplir en el backend.'
  },
  {
    q: '¿Qué aporta OpenID Connect sobre OAuth 2?',
    opciones: ['Identidad (quién eres) vía ID token', 'Cifrado de todos los mensajes', 'Recuerda el password de la usuaria'],
    ok: 0,
    exp: 'OIDC añade un ID token de identidad encima de la autorización delegada de OAuth 2.'
  }
];

function renderQuiz() {
  const box = document.getElementById('quiz');
  if (!box) return;
  let idx = 0;
  let score = 0;
  box.innerHTML = `
    <div id="q-region" aria-live="assertive"></div>
    <p id="q-score" class="score" aria-live="polite"></p>`;
  const region = document.getElementById('q-region');
  const scoreEl = document.getElementById('q-score');
  const show = () => {
    const p = PREGUNTAS[idx];
    region.innerHTML = `
      <p class="q"><strong>${idx + 1} / ${PREGUNTAS.length}. ${p.q}</strong></p>
      <div class="opts">
        ${p.opciones
          .map((o, i) => `<button type="button" class="opt" data-i="${i}">${o}</button>`)
          .join('')}
      </div>
      <p class="feedback" hidden></p>
      <button type="button" id="next-q" class="btn ghost" hidden>Siguiente pregunta</button>`;
    region.querySelectorAll('.opt').forEach((btn) =>
      btn.addEventListener('click', () => {
        const chosen = Number(btn.dataset.i);
        const correct = chosen === p.ok;
        const fb = region.querySelector('.feedback');
        region.querySelectorAll('.opt').forEach((b) => {
          b.disabled = true;
          if (Number(b.dataset.i) === p.ok) b.classList.add('ok');
          if (chosen === Number(b.dataset.i) && !correct) b.classList.add('bad');
        });
        if (correct) score++;
        fb.hidden = false;
        fb.textContent = (correct ? 'Correcto. ' : 'Incorrecto. ') + p.exp;
        scoreEl.textContent = `Aciertos: ${score} / ${idx + 1}`;
        document.getElementById('next-q').hidden = false;
      })
    );
    document.getElementById('next-q').addEventListener('click', () => {
      idx++;
      if (idx < PREGUNTAS.length) show();
      else {
        region.innerHTML = `<p class="final"><strong>Resultado: ${score} / ${PREGUNTAS.length}</strong>. ${score === PREGUNTAS.length ? '¡Perfecto!' : 'Revisa las secciones 3, 9, 12 y 17 para consolidar.'}</p>`;
        scoreEl.textContent = '';
      }
    });
  };
  show();
}

// ---------- Árbol de decisión ----------
const ARBOL = {
  preguntas: [
    {
      key: 'p1',
      texto: '¿Quién usa el sistema?',
      opciones: [
        { label: 'Personas (clientes) en un navegador', ramas: 'cliente' },
        { label: 'Personas internas (empleados)', ramas: 'interno' },
        { label: 'Solo máquinas (otras apps)', ramas: 'maquina' }
      ]
    },
    {
      key: 'p2',
      texto: '¿Necesitas saber QUIÉN es cada persona?',
      opciones: [
        { label: 'Sí, y gestionar cuentas es crítico', ramas: 'identidad' },
        { label: 'No, basta distinguir autenticado de anónimo', ramas: 'anonimo' }
      ]
    },
    {
      key: 'p3',
      texto: '¿Puedes depender de un tercero para autenticar?',
      opciones: [
        { label: 'Sí, no hay motivo para reinventarlo', ramas: 'tercero' },
        { label: 'No, necesito control total (o es un ejercicio de aprendizaje)', ramas: 'propio' }
      ]
    }
  ],
  resultado: (e) => {
    if (e.p1 === 'maquina') return 'API keys u OAuth client credentials: identifican la app, no a una persona.';
    if (e.p2 === 'anonimo') return 'Sesiones anónimas o un bearer ligero bastan; no necesitas un IdP.';
    if (e.p3 === 'tercero') return 'OIDC con un IdP gestionado (Google, GitHub, corporativo): identidad + MFA sin guardar passwords.';
    return 'Autenticación propia con hash lento (scrypt/bcrypt) + Bearer JWT + auditoría — como la 05A. Documenta el porqué.';
  }
};

function renderTree() {
  const box = document.getElementById('tree');
  if (!box) return;
  let paso = 0;
  const estado = {};
  box.innerHTML = '<div id="tree-stage" aria-live="polite"></div>';
  const stage = document.getElementById('tree-stage');
  const renderTreeStep = () => {
    if (paso < ARBOL.preguntas.length) {
      const p = ARBOL.preguntas[paso];
      stage.innerHTML = `
        <p class="q"><strong>Pregunta ${paso + 1} de ${ARBOL.preguntas.length}: ${p.texto}</strong></p>
        <div class="opts">
          ${p.opciones.map((o, i) => `<button type="button" class="opt" data-i="${i}">${o.label}</button>`).join('')}
        </div>
        <button type="button" id="back-tree" class="btn ghost" ${paso === 0 ? 'hidden' : ''}>← Atrás</button>`;
      stage.querySelectorAll('.opt').forEach((btn, i) =>
        btn.addEventListener('click', () => {
          estado[p.key] = p.opciones[i].ramas;
          paso++;
          renderTreeStep();
        })
      );
      const back = document.getElementById('back-tree');
      if (back) back.addEventListener('click', () => { paso--; renderTreeStep(); });
    } else {
      stage.innerHTML = `
        <p class="final"><strong>Decisión sugerida según tus respuestas:</strong> ${ARBOL.resultado(estado)}</p>
        <button type="button" id="reset-tree" class="btn ghost">Reiniciar</button>`;
      document.getElementById('reset-tree').addEventListener('click', () => {
        paso = 0;
        Object.keys(estado).forEach((k) => delete estado[k]);
        renderTreeStep();
      });
    }
  };
  renderTreeStep();
}

renderInspector();
renderComparator();
renderQuiz();
renderTree();