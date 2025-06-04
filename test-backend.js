// Script de prueba para verificar conectividad con el backend
const https = require('http');

const baseUrl = 'http://127.0.0.1:5000';

// Función para hacer peticiones HTTP
function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: url,
      method: 'GET',
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testBackend() {
  console.log('=== PRUEBA DE CONECTIVIDAD CON EL BACKEND ===');
  console.log('Base URL:', baseUrl);
  
  // Test 1: Verificar que el servidor responda
  try {
    console.log('\n1. Probando endpoint /Docentes/ sin token...');
    const response1 = await makeRequest('/Docentes/');
    console.log('Status:', response1.status);
    console.log('Response:', response1.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
  // Test 2: Verificar otros endpoints
  const endpoints = [
    '/Estudiantes/',
    '/Materias/',
    '/Curso/',
    '/Evaluacion/',
    '/DocenteMateria/buscar/12345678'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n2. Probando endpoint ${endpoint}...`);
      const response = await makeRequest(endpoint);
      console.log('Status:', response.status);
      console.log('Response type:', typeof response.data);
      if (typeof response.data === 'object') {
        console.log('Response keys:', Object.keys(response.data));
      } else {
        console.log('Response:', response.data);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testBackend();
