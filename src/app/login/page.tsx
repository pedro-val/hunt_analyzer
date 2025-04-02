"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Fazendo a requisição de login
      await authService.login({ email, password });
      
      // Se o login for bem-sucedido, redireciona para a página do app
      router.push("/app");
    } catch (error) {
      console.error("Falha no login:", error);
      setError(error instanceof Error ? error.message : "Credenciais inválidas. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-8">Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="relative">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-0.5 rounded-lg">
              <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
                <label className="bg-gray-800 text-white px-4 py-3 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-3 focus:outline-none"
                  placeholder="seu@email.com"
                />
                <button 
                  type="button"
                  className="p-3 text-yellow-500 hover:text-yellow-400"
                  onClick={() => setEmail("")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-0.5 rounded-lg">
              <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
                <label className="bg-gray-800 text-white px-4 py-3 font-medium">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-3 focus:outline-none"
                  placeholder="******"
                />
                <button 
                  type="button"
                  className="p-3 text-yellow-500 hover:text-yellow-400"
                  onClick={() => setPassword("")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Remember Login Checkbox */}
          <div className="flex items-center space-x-3">
            <div 
              className={`w-6 h-6 flex items-center justify-center rounded-md border-2 ${rememberLogin ? 'bg-green-600 border-green-700' : 'bg-gray-800 border-yellow-500'}`}
              onClick={() => setRememberLogin(!rememberLogin)}
            >
              {rememberLogin && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-white">Lembrar meus dados</span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 px-4 rounded-md hover:from-red-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-70"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
          
          {/* Register Link */}
          <div className="text-center mt-4">
            <p className="text-white">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-yellow-500 hover:text-yellow-400">
                Registre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}