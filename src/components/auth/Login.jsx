import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Phone, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = ({ onRegisterClick }) => {
    const { login } = useAuth();
    const [number, setNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(number, password);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid number or password';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-200 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-200 rotate-6 transform hover:rotate-0 transition-transform duration-300">
                        <LogIn size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-500 mt-2 font-medium">Log in to manage your site projects</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="tel"
                                required
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                placeholder="1234567890"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                Sign In
                                <LogIn size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-slate-500 font-bold text-sm">
                        Don't have an account?{' '}
                        <button
                            onClick={onRegisterClick}
                            className="text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2"
                        >
                            Register Now
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
