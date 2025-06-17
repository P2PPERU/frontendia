import React, { useState, useEffect } from 'react';

function TestApp() {
  const [status, setStatus] = useState('Verificando...');
  const [apiStatus, setApiStatus] = useState('Verificando API...');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Verificar Tailwind CSS
    const checkTailwind = () => {
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-blue-500';
      document.body.appendChild(testDiv);
      const styles = window.getComputedStyle(testDiv);
      const hasTailwind = styles.backgroundColor === 'rgb(59, 130, 246)';
      document.body.removeChild(testDiv);
      
      if (hasTailwind) {
        setStatus('✅ Tailwind CSS funcionando');
      } else {
        setStatus('❌ Tailwind CSS NO está cargando');
        setErrors(prev => [...prev, 'Tailwind CSS no está funcionando']);
      }
    };

    // Verificar API
    const checkAPI = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          setApiStatus('✅ API respondiendo');
        } else {
          setApiStatus(`❌ API respondió con error: ${response.status}`);
          setErrors(prev => [...prev, `API error: ${response.status}`]);
        }
      } catch (error) {
        setApiStatus('❌ No se puede conectar a la API');
        setErrors(prev => [...prev, 'No se puede conectar a http://localhost:3001']);
      }
    };

    checkTailwind();
    checkAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Diagnóstico IA SPORT
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Estado del Sistema</h2>
          
          <div className="space-y-2">
            <p className="text-lg">{status}</p>
            <p className="text-lg">{apiStatus}</p>
          </div>
          
          {errors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Errores Encontrados:
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Prueba de Estilos Tailwind:</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="bg-blue-500 text-white p-4 rounded">
              bg-blue-500
            </div>
            <div className="bg-green-500 text-white p-4 rounded">
              bg-green-500
            </div>
            <div className="bg-red-500 text-white p-4 rounded">
              bg-red-500
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Si ves los colores arriba, Tailwind está funcionando.</p>
          <p>Si la API no responde, verifica que el backend esté corriendo.</p>
        </div>
      </div>
    </div>
  );
}

export default TestApp;