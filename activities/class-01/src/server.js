const http = require('http');

const server = http.createServer((request, response) => {
  const { method, url } = request;

  console.log(`${method} ${url}`);

  if (url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bienvenido al servidor de Desarrollo Backend');
    return;
  }

  if (url === '/health') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('OK');
    return;
  }

  if (url === '/api/info') {
    const data = {
      materia: 'Desarrollo Backend',
      clase: 1,
      tema: 'Del clic a la respuesta',
      estado: 'activo'
    };
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(data));
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Ruta no encontrada');
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
