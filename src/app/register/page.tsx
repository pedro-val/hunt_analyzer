"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter no mínimo 6 caracteres";
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Fazendo a requisição de registro
      await authService.register({ name, email, password });
      
      // Se o registro for bem-sucedido, redireciona para a página do app
      router.push("/app");
    } catch (error) {
      console.error("Falha no registro:", error);
      setErrors({ 
        general: error instanceof Error ? error.message : "Erro ao registrar. Tente novamente." 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-8">Criar Conta</h1>
        
        <form onSubmit={handleRegister} className="space-y-6">
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {errors.general}
            </div>
          )}
          
          {/* Nome Field */}
          <div className="relative">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-0.5 rounded-lg">
              <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
                <label className="bg-gray-800 text-white px-4 py-3 font-medium">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-3 focus:outline-none"
                  placeholder="Seu nome completo"
                />
                <button 
                  type="button"
                  className="p-3 text-yellow-500 hover:text-yellow-400"
                  onClick={() => setName("")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

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
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
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
                  placeholder="Mínimo 6 caracteres"
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
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-0.5 rounded-lg">
              <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
                <label className="bg-gray-800 text-white px-4 py-3 font-medium">Confirmar</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-3 focus:outline-none"
                  placeholder="Confirme sua senha"
                />
                <button 
                  type="button"
                  className="p-3 text-yellow-500 hover:text-yellow-400"
                  onClick={() => setConfirmPassword("")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 px-4 rounded-md hover:from-red-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-70"
          >
            {isLoading ? "Registrando..." : "Criar Conta"}
          </button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-white">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-yellow-500 hover:text-yellow-400">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}