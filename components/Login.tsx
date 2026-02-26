
import React, { useState } from 'react';
import { authService } from '../hooks/usePlanData';

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
        if (isSignUp) {
            if (name.trim() === '') {
                throw new Error("O nome é obrigatório para o cadastro.");
            }
            await authService.signup(email, password, name);
            setMessage("Conta criada com sucesso! Você será redirecionado.");
        } else {
            await authService.login(email, password);
        }
    } catch (error: any) {
        console.error(error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
             setError('Usuário não encontrado ou senha incorreta. Se é seu primeiro acesso, clique em "Não tem uma conta? Cadastre-se" abaixo.');
        } else if (error.code === 'auth/email-already-in-use') {
             setError('Este email já está cadastrado. Tente fazer login.');
        } else {
             setError(error.message || 'Ocorreu um erro. Verifique suas credenciais.');
        }
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
        await authService.loginWithGoogle();
    } catch (error: any) {
        setError(error.message || 'Falha no login com Google. Verifique se o Firebase está configurado corretamente.');
        setIsLoading(false);
    }
  }
  
  const handlePasswordReset = async () => {
    if (!email) {
        setError("Por favor, insira seu e-mail para recuperar a senha.");
        return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
        await authService.resetPassword(email);
        setMessage("E-mail de recuperação de senha enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
        setError(error.message || "Falha ao enviar e-mail de recuperação.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light-gray flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-4xl font-bold text-brand-dark tracking-wider text-center">GESTÃO DE IMPACTO</h1>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-dark">
          {isSignUp ? 'Crie sua conta Grátis' : 'Acesse sua conta'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          para iniciar seu planejamento estratégico
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl ring-1 ring-black ring-opacity-5 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleAuthAction}>
            {isSignUp && (
                <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Seu Nome Completo
                </label>
                <div className="mt-1">
                    <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm bg-white text-gray-900"
                    />
                </div>
                </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Endereço de e-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                 <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-brand-orange hover:text-orange-500">
                    {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Cadastre-se'}
                </button>
              </div>

              {!isSignUp && (
                <div className="text-sm">
                    <button type="button" onClick={handlePasswordReset} className="font-medium text-brand-orange hover:text-orange-500">
                    Esqueceu sua senha?
                    </button>
                </div>
              )}
            </div>
            
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                </div>
            )}
            {message && <p className="text-sm text-green-600 text-center">{message}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:bg-gray-400"
              >
                {isLoading ? 'Aguarde...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-200"
              >
                <span className="sr-only">Entrar com Google</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
