import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Eye, EyeOff, Phone, Mail, Lock, User, ChevronRight, 
  ArrowLeft, Shield, Check, AlertCircle, Smartphone, MessageCircle,
  TrendingUp, Target
} from 'lucide-react';
import authService from '../../services/api/auth';
import { VALIDATION } from '../../utils/constants';

const AuthSystem = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      if (user?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    }
  }, [navigate]);

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    if (phoneNumber.startsWith('51')) {
      return phoneNumber.slice(0, 11);
    } else if (phoneNumber.startsWith('9')) {
      return '51' + phoneNumber.slice(0, 9);
    }
    return phoneNumber.slice(0, 11);
  };

  const validatePhone = (phone) => {
    return VALIDATION.PHONE_REGEX.test(phone);
  };

  const validateEmail = (email) => {
    return VALIDATION.EMAIL_REGEX.test(email);
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(formData.phone, formData.password);
      
      if (result.success) {
        setSuccess('¡Inicio de sesión exitoso!');
        
        setTimeout(() => {
          const user = authService.getCurrentUser();
          if (user?.isAdmin) {
            navigate('/admin');
          } else {
            navigate('/app');
          }
        }, 1000);
      } else {
        setError(result.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
    }
    
    setLoading(false);
  };

  const handleRegister = async () => {
    setError('');
    
    if (!formData.name || formData.name.length < VALIDATION.MIN_NAME_LENGTH) {
      setError(`El nombre debe tener al menos ${VALIDATION.MIN_NAME_LENGTH} caracteres`);
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Número de teléfono inválido. Debe ser un número peruano');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Email inválido');
      return;
    }

    if (formData.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        setSuccess('¡Cuenta creada exitosamente!');
        
        if (result.user && result.token) {
          setTimeout(() => {
            navigate('/app');
          }, 1500);
        } else {
          setCurrentView('verify');
        }
      } else {
        setError(result.message || 'Error al crear la cuenta');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setError('');
    
    if (!formData.phone && !formData.email) {
      setError('Ingresa tu número de teléfono o email');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.forgotPassword(formData.phone || formData.email);
      
      if (result.success) {
        setSuccess('Código de verificación enviado');
        setCurrentView('verify');
      } else {
        setError(result.message || 'No se encontró una cuenta con estos datos');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
    }
    
    setLoading(false);
  };

  const handleVerification = async () => {
    const code = verificationCode.join('');
    if (code.length !== VALIDATION.OTP_LENGTH) {
      setError('Ingresa el código completo');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.verifyOTP(formData.phone, code);
      
      if (result.success) {
        setSuccess('¡Verificación exitosa!');
        
        if (result.token) {
          setTimeout(() => {
            navigate('/app');
          }, 1000);
        } else {
          setTimeout(() => {
            setCurrentView('login');
          }, 1000);
        }
      } else {
        setError(result.message || 'Código incorrecto');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
    }
    
    setLoading(false);
  };

  const handleCodeInput = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const LoginView = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 pt-12 pb-24 rounded-b-3xl shadow-lg">
        <div className="text-center">
          <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">IA SPORT</h1>
          <p className="text-blue-100">Predicciones Inteligentes con IA</p>
        </div>
      </div>

      <div className="px-6 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm animate-pulse">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700 text-sm animate-pulse">
              <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono o Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="+51 999 999 999 o correo@ejemplo.com"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? 
                    <EyeOff className="w-5 h-5" /> : 
                    <Eye className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              <button 
                onClick={() => setCurrentView('forgot')}
                className="text-sm text-blue-600 hover:underline"
                disabled={loading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Iniciar Sesión
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <button 
                onClick={() => setCurrentView('register')}
                className="text-blue-600 font-medium hover:underline"
                disabled={loading}
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 pb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Target className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-bold text-gray-800">89% Precisión</h3>
            <p className="text-xs text-gray-600 mt-1">En predicciones deportivas</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-bold text-gray-800">+42% ROI</h3>
            <p className="text-xs text-gray-600 mt-1">Retorno promedio semanal</p>
          </div>
        </div>
      </div>
    </div>
  );

  const RegisterView = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setCurrentView('login')}
            className="text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Crear Cuenta</h1>
        </div>
        <p className="text-blue-100">Únete a miles de usuarios ganadores</p>
      </div>

      <div className="px-6 mt-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm animate-pulse">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700 text-sm animate-pulse">
              <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Teléfono
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Recibirás alertas de predicciones calientes</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={`Mínimo ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? 
                    <EyeOff className="w-5 h-5" /> : 
                    <Eye className="w-5 h-5" />
                  }
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
                <Shield className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <label className="flex items-start">
              <input 
                type="checkbox" 
                className="mr-2 mt-1"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                disabled={loading}
              />
              <span className="text-sm text-gray-600">
                Acepto los <button type="button" className="text-blue-600 underline" onClick={() => window.open('/terms', '_blank')}>términos y condiciones</button> y 
                la <button type="button" className="text-blue-600 underline" onClick={() => window.open('/privacy', '_blank')}>política de privacidad</button>
              </span>
            </label>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Crear Cuenta
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>Acceso a predicciones con 89% de precisión</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>2 predicciones premium gratis cada día</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>Alertas de predicciones calientes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ForgotPasswordView = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setCurrentView('login')}
            className="text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Recuperar Contraseña</h1>
        </div>
        <p className="text-blue-100">Te enviaremos un código de verificación</p>
      </div>

      <div className="px-6 mt-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm animate-pulse">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700 text-sm animate-pulse">
              <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Teléfono o Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="+51 999 999 999 o correo@ejemplo.com"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ingresa el teléfono o email asociado a tu cuenta
              </p>
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enviar Código
                </>
              )}
            </button>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">¿Cómo funciona?</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Ingresa tu teléfono o email</li>
              <li>2. Recibirás un código de 6 dígitos</li>
              <li>3. Ingresa el código para crear una nueva contraseña</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );

  const VerificationView = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setCurrentView('login')}
            className="text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={loading}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Verificación</h1>
        </div>
        <p className="text-blue-100">Ingresa el código de 6 dígitos</p>
      </div>

      <div className="px-6 mt-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600">
              Hemos enviado un código a<br />
              <span className="font-bold text-gray-800">{formData.phone || formData.email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm animate-pulse">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700 text-sm animate-pulse">
              <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleCodeInput(index, e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={loading}
              />
            ))}
          </div>

          <button
            onClick={handleVerification}
            disabled={loading || verificationCode.join('').length !== VALIDATION.OTP_LENGTH}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Verificar
                <Check className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              ¿No recibiste el código?
            </p>
            <button 
              className="text-blue-600 font-medium hover:underline"
              disabled={loading}
              onClick={handleForgotPassword}
            >
              Reenviar código
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const views = {
    login: <LoginView />,
    register: <RegisterView />,
    forgot: <ForgotPasswordView />,
    verify: <VerificationView />
  };

  return views[currentView];
};

export default AuthSystem;