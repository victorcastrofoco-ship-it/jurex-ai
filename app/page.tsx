"use client";

import { registerUser } from "../services/authService";
import { addClient, getClients } from "../services/clientService";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Plus, Search, User, Users, TrendingUp, Clock, Lock, 
  Settings, LogOut, Bell, ChevronRight, CreditCard, Calendar, 
  Sparkles, Shield, Moon, Sun, Phone, Mail, Fingerprint, 
  Activity, FileText, CheckCircle, AlertCircle, Percent, Eye, EyeOff, Edit, Trash2, Wallet
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { JurexStorage } from "../lib/storage";
import { User as UserType, Client, Loan, PaymentInstallment, Notification, AIAnalysisResult } from "../lib/types";

// 🔑 Import Firebase Auth
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export default function Home() {
  // Auth state
  const [user, setUser] = useState<UserType | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  // Navigation state
  const [currentTab, setCurrentTab] = useState<"inicio" | "contratos" | "clientes" | "relatorios" | "ajustes">("inicio");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Business state
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Renegotiation, Deletion & WhatsApp sharing states
  const [isRenegotiating, setIsRenegotiating] = useState(false);
  const [renegRate, setRenegRate] = useState("5");
  const [renegCount, setRenegCount] = useState("6");
  const [whatsAppText, setWhatsAppText] = useState("");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // New Payment flow states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInstallment, setPaymentInstallment] = useState<PaymentInstallment | null>(null);
  const [paymentLoan, setPaymentLoan] = useState<Loan | null>(null);
  const [paymentType, setPaymentType] = useState<"parcela" | "juros" | "quitacao">("parcela");
  const [paymentAmount, setPaymentAmount] = useState("");

  // Forms state
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientCpf, setNewClientCpf] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientNotes, setNewClientNotes] = useState("");

  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientName, setEditClientName] = useState("");
  const [editClientCpf, setEditClientCpf] = useState("");
  const [editClientPhone, setEditClientPhone] = useState("");
  const [editClientEmail, setEditClientEmail] = useState("");
  const [editClientNotes, setEditClientNotes] = useState("");
  const [showDeleteClientConfirm, setShowDeleteClientConfirm] = useState(false);

  const [showAddLoan, setShowAddLoan] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestType, setInterestType] = useState<"fixed" | "interest">("interest");
  const [interestRate, setInterestRate] = useState("");
  const [installmentsCount, setInstallmentsCount] = useState("");
  const [frequency, setFrequency] = useState<"diaria" | "semanal" | "quinzenal" | "mensal">("mensal");
  const [firstDueDate, setFirstDueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [chargeLateInterest, setChargeLateInterest] = useState(false);
  const [lateInterestType, setLateInterestType] = useState<"percent" | "fixed">("percent");
  const [lateInterestValue, setLateInterestValue] = useState("1");
  const [loanNotes, setLoanNotes] = useState("");

  // AI State
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [tempAIResult, setTempAIResult] = useState<AIAnalysisResult | null>(null);

  // Profile Form state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  // 📌 Handle Edit Client Submit
  const handleEditClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const updatedClient: Client = {
      ...selectedClient,
      name: editClientName,
      phone: editClientPhone,
      email: editClientEmail,
      notes: editClientNotes,
    };

    JurexStorage.updateClient(updatedClient);
setClients(JurexStorage.getClients(user?.id || ""));
setSelectedClient(updatedClient);
setIsEditingClient(false);

  };

  // App initialization
  useEffect(() => {
    JurexStorage.initialize();
    const active = JurexStorage.getActiveUser();
    if (active) {
      const timer = setTimeout(() => {
        setUser(active);
        setProfileName(active.name);
        setProfilePhone(active.phone);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Firebase integration (novo bloco)
  useEffect(() => {
    async function connectFirebase() {
      try {
        await registerUser("teste@jurex.com", "123456");
        await addClient({
          name: "Cliente Teste",
          cpf: "12345678900",
          createdAt: new Date()
        });
        const clients = await getClients();
        console.log("Clientes cadastrados:", clients);
      } catch (error) {
        console.error("Erro na integração Firebase:", error);
      }
    }
    connectFirebase();
  }, []);

  // Fetch data on user login
  useEffect(() => {
    if (user) {
      const uId = user.id;
      const timer = setTimeout(() => {
        setClients(JurexStorage.getClients(uId));
        setLoans(JurexStorage.getLoans(uId));
        setNotifications(JurexStorage.getNotifications(uId));
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setClients([]);
        setLoans([]);
        setNotifications([]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // 🔑 Handle Authentication (corrigido)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      if (authTab === "login") {
        if (!email || !password) {
          setAuthError("Por favor, preencha todos os campos.");
          return;
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        setUser({
  id: firebaseUser.uid,
  name: firebaseUser.displayName || "",
  email: firebaseUser.email || "",
  phone: "",

  // campos obrigatórios do tipo User
  theme: "light", // ou "dark", conforme padrão
  pushNotificationsEnabled: false, // valor inicial
  createdAt: new Date().toISOString(), // data atual
});
        setProfileName(firebaseUser.displayName || "");
        setProfilePhone(firebaseUser.phoneNumber || "");
      } else {
        if (!name || !email || !password) {
          setAuthError("Por favor, preencha todos os campos.");
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        setUser({
          id: firebaseUser.uid,
          name,
          email: firebaseUser.email || "",
          phone: "",
          theme: "light",
          pushNotificationsEnabled: false,
          createdAt: new Date().toISOString(),
        });
        setProfileName(name);
        setProfilePhone("");
      }
    } catch (erro) {
      if (erro instanceof Error) {
        setAuthError("Erro na autenticação: " + erro.message);
      } else {
        setAuthError("Erro na autenticação: erro desconhecido");
      }
    }
  };

  // 🔑 Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthError("");
    } catch (erro) {
      if (erro instanceof Error) {
        setAuthError("Erro ao sair: " + erro.message);
      } else {
        setAuthError("Erro ao sair: erro desconhecido");
      }
    }
  };

  // 📌 Handle Select Client
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    // Atualiza dados relacionados ao cliente
    setLoans(JurexStorage.getLoans(client.id));
    setNotifications(JurexStorage.getNotifications(client.id));
  };

  // Submit renegotiate
  const handleRenegotiateSubmit = (loanId: string) => {
    if (!user) return;
    const rate = parseFloat(renegRate) || 0;
    const count = parseInt(renegCount) || 1;

    JurexStorage.renegotiateLoan(loanId, rate, count, user.id);
    setLoans(JurexStorage.getLoans(user.id));
    setNotifications(JurexStorage.getNotifications(user.id));

    // Refresh selected loan details
    const refreshedLoans = JurexStorage.getLoans(user.id);
    setSelectedLoan(refreshedLoans.find(l => l.id === loanId) || null);
    setIsRenegotiating(false);
  };

  // Construct sharing content for WhatsApp
  const handleWhatsAppShare = (loan: Loan) => {
    const client = clients.find(c => c.id === loan.clientId);
    if (!client) return;
    const code = loan.code || "#" + loan.id.substring(loan.id.length - 6).toUpperCase();
    const unpaidInsts = JurexStorage.getInstallmentsForLoan(loan.id).filter(i => i.status !== "paid");
    const nextInst = unpaidInsts[0];

    let text = `Olá, ${client.name}! Gostaria de compartilhar as informações de seu contrato de crédito ${code} com a Jurex AI.\n\n`;
    text += `*Valor contratado:* R$ ${loan.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
    text += `*Juros:* ${loan.interestRate}% a.m.\n`;
    text += `*Parcelas:* ${loan.installmentsCount}x\n\n`;

    if (nextInst) {
      text += `*Próximo Vencimento:* Parcela #${nextInst.number} no valor de R$ ${nextInst.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} vencendo em ${new Date(nextInst.dueDate).toLocaleDateString("pt-BR")}.\n\n`;
    } else {
      text += `*Status do Contrato:* Quitado! Parabéns, todas as suas parcelas estão pagas.\n\n`;
    }

    text += `Agradecemos a preferência! Jurex AI • Crédito Inteligente.`;

    setWhatsAppText(text);
    setShowWhatsAppModal(true);
  };

  // Update Profile Settings
  const handleUpdateProfile = () => {
    if (!user) return;
    const updated = {
      ...user,
      name: profileName,
      phone: profilePhone
    };
    JurexStorage.updateUser(updated);
    setUser(updated);
    alert("Perfil atualizado com sucesso!");
  };

  // Toggle theme locally
  const toggleTheme = (theme: "light" | "dark") => {
    if (!user) return;
    const updated = { ...user, theme };
    JurexStorage.updateUser(updated);
    setUser(updated);
  };

  // Toggle push notifications locally
  const togglePushNotifications = () => {
    if (!user) return;
    const updated = { ...user, pushNotificationsEnabled: !user.pushNotificationsEnabled };
    JurexStorage.updateUser(updated);
    setUser(updated);
  };

  // Read notifications
  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
    if (user) {
      JurexStorage.markAllNotificationsRead(user.id);
      setNotifications(JurexStorage.getNotifications(user.id));
    }
  };

  // Micro-interaction ripples
  const triggerRipple = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(el.clientWidth, el.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - el.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - el.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");

    const existingRipple = el.getElementsByClassName("ripple")[0];
    if (existingRipple) {
      existingRipple.remove();
    }
    el.appendChild(circle);
  };

  // Financial Calculators
  const calculateFinancials = () => {
    let totalEmprestado = 0;
    let totalRecebido = 0;
    let totalAReceber = 0;
    let totalLucro = 0;
    let totalEmprestadoEsteMes = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    loans.forEach(loan => {
      const insts = JurexStorage.getInstallmentsForLoan(loan.id);
      let installmentsTotal = 0;
      insts.forEach(inst => {
        installmentsTotal += inst.amount;
        if (inst.status === "paid") {
          totalRecebido += inst.amount;
        } else {
          totalAReceber += inst.amount;
        }
      });
      // Estimated profit of this loan is sum of its installments minus loan principal
      const profit = Math.max(0, installmentsTotal - loan.amount);
      totalLucro += profit;

      // Reflect current active principal loan
      if (loan.status === "active" || loan.status === "late") {
        totalEmprestado += loan.amount;
      }

      // Calculate total loans created this current month
      const loanDate = new Date(loan.createdAt);
      if (loanDate.getMonth() === currentMonth && loanDate.getFullYear() === currentYear) {
        totalEmprestadoEsteMes += loan.amount;
      }
    });

    return { totalEmprestado, totalRecebido, totalAReceber, totalLucro, totalEmprestadoEsteMes };
  };

  const financials = calculateFinancials();

  // Installment value preview calculation
  const getInstallmentPreview = () => {
    const amount = parseFloat(loanAmount) || 0;
    const count = parseInt(installmentsCount) || 1;
    const rate = parseFloat(interestRate) || 0;

    let installmentValue = amount / count;
    if (interestType === "interest" && rate > 0) {
      const totalInterest = amount * (rate / 100);
      installmentValue = (amount + totalInterest) / count;
    }

    const totalToReceive = installmentValue * count;
    const estimatedProfit = totalToReceive > amount ? totalToReceive - amount : 0;

    return {
      value: installmentValue,
      total: totalToReceive,
      profit: estimatedProfit
    };
  };

  const getChartData = () => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const data = [];

    // Let's generate the last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = months[d.getMonth()].toLowerCase();
      const year = d.getFullYear();
      const monthNum = d.getMonth();

      // Real calculation
      let realSaida = 0;
      loans.forEach(loan => {
        const loanDate = new Date(loan.createdAt);
        if (loanDate.getMonth() === monthNum && loanDate.getFullYear() === year) {
          realSaida += loan.amount;
        }
      });

      let realEntrada = 0;
      loans.forEach(loan => {
        const insts = JurexStorage.getInstallmentsForLoan(loan.id);
        insts.forEach(inst => {
          if (inst.status === "paid") {
            const paidDate = inst.paymentDate ? new Date(inst.paymentDate) : new Date(loan.createdAt);
            if (paidDate.getMonth() === monthNum && paidDate.getFullYear() === year) {
              realEntrada += inst.amount;
            }
          }
        });
      });

      data.push({
        name: monthLabel,
        Entrada: realEntrada,
        Saída: realSaida,
      });
    }

    return data;
  };

  const preview = getInstallmentPreview();

  // Dark Mode detection
  const isDarkMode = user?.theme === "dark";

  // Auth Layout (Unauthenticated)
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#f8f9fa] relative overflow-hidden transition-colors duration-200">
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#10b981]/10 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#64f9bc]/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
          {/* Header & Logo */}
          <div className="mb-8 text-center animate-fade-in">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#006c49] to-[#10b981] text-white font-black text-3xl shadow-lg shadow-[#006c49]/20">
              J
            </div>
            <h1 className="font-hanken text-3xl font-bold text-[#191c1d] tracking-tight">Jurex AI</h1>
            <p className="font-inter text-sm text-[#3c4a42]/80 mt-1">Controle total dos seus empréstimos</p>
          </div>

          {/* Main Card */}
          <div className="glass-card w-full rounded-2xl border border-[#bbcabf] p-6 sm:p-8 shadow-xl">
            {/* Auth Switcher Tabs */}
            <div className="flex p-1 bg-[#edeeef] rounded-xl mb-8">
              <button 
                id="tab-login"
                className={`flex-1 py-2.5 px-4 font-hanken text-sm font-semibold rounded-lg transition-all duration-200 ${authTab === "login" ? "bg-[#10b981] text-white shadow" : "text-[#3c4a42] hover:text-[#191c1d]"}`}
                onClick={() => setAuthTab("login")}
              >
                Entrar
              </button>
              <button 
                id="tab-signup"
                className={`flex-1 py-2.5 px-4 font-hanken text-sm font-semibold rounded-lg transition-all duration-200 ${authTab === "signup" ? "bg-[#10b981] text-white shadow" : "text-[#3c4a42] hover:text-[#191c1d]"}`}
                onClick={() => setAuthTab("signup")}
              >
                Criar conta
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            {/* Login & Signup forms */}
            <form className="space-y-5" onSubmit={handleAuth}>
              {authTab === "signup" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#3c4a42] uppercase tracking-wider ml-1">Nome completo</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4a42]" />
                    <input 
                      type="text" 
                      placeholder="Como deseja ser chamado?" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#bbcabf] rounded-xl focus:ring-2 focus:ring-[#10b981] focus:border-[#006c49] outline-none text-sm text-[#191c1d]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#3c4a42] uppercase tracking-wider ml-1">E-mail</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4a42]" />
                  <input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#bbcabf] rounded-xl focus:ring-2 focus:ring-[#10b981] focus:border-[#006c49] outline-none text-sm text-[#191c1d]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#3c4a42] uppercase tracking-wider ml-1">Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4a42]" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-[#bbcabf] rounded-xl focus:ring-2 focus:ring-[#10b981] focus:border-[#006c49] outline-none text-sm text-[#191c1d]"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3c4a42] hover:text-[#006c49]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#006c49] focus:ring-[#10b981] border-[#bbcabf]" />
                  <span className="text-[#3c4a42]">Lembrar acesso</span>
                </label>
                <a href="#" className="font-semibold text-[#006c49] hover:underline">Esqueci minha senha</a>
              </div>

              <button 
                type="submit"
                onClick={triggerRipple}
                className="relative overflow-hidden w-full py-4 bg-[#10b981] hover:bg-[#006c49] text-white font-hanken font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-[#10b981]/20 mt-4 cursor-pointer"
              >
                <span>{authTab === "login" ? "Entrar" : "Criar conta"}</span>
                <ChevronRight size={18} />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#bbcabf]"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/90 px-3 text-[#3c4a42] font-semibold text-[10px]">OU</span></div>
            </div>

            <button 
              onClick={(e) => {
                triggerRipple(e);
                // Fast login
                setEmail("victorcastroassis@gmail.com");
                setPassword("12345678");
              }}
              className="relative overflow-hidden w-full py-3 bg-white border border-[#bbcabf] hover:bg-[#f3f4f5] rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] font-hanken font-semibold text-[#191c1d] cursor-pointer"
            >
              <Fingerprint className="text-[#006c49]" size={22} />
              <span>Entrar com Conta Demo</span>
            </button>
          </div>

          {/* Footer Security */}
          <div className="mt-12 flex items-center gap-2 text-[#3c4a42]/70">
            <Lock size={14} />
            <p className="text-xs font-medium">Seus dados estão protegidos com criptografia de ponta a ponta</p>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard / App Shell layout (Authenticated)
  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${isDarkMode ? "dark bg-[#0f172a] text-slate-100" : "bg-[#f1f5f9] text-slate-900"}`}>
      
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 w-64 h-full hidden md:flex flex-col py-6 px-4 gap-2 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <h1 className="font-hanken text-lg font-bold tracking-tight text-emerald-900 dark:text-emerald-400 leading-none">Jurex AI</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Crédito Inteligente</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          <button 
            onClick={() => setCurrentTab("inicio")} 
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${currentTab === "inicio" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
          >
            <Activity size={18} />
            <span>Início</span>
          </button>
          <button 
            onClick={() => setCurrentTab("contratos")} 
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${currentTab === "contratos" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
          >
            <FileText size={18} />
            <span>Contratos</span>
          </button>
          <button 
            onClick={() => setCurrentTab("clientes")} 
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${currentTab === "clientes" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
          >
            <Users size={18} />
            <span>Clientes</span>
          </button>
          <button 
            onClick={() => setCurrentTab("relatorios")} 
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${currentTab === "relatorios" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
          >
            <TrendingUp size={18} />
            <span>Relatórios</span>
          </button>
          <button 
            onClick={() => setCurrentTab("ajustes")} 
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${currentTab === "ajustes" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}
          >
            <Settings size={18} />
            <span>Ajustes</span>
          </button>
        </nav>

        {/* Pro Plan Box */}
        <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-2xl text-white mt-auto mb-2 border border-slate-800 shadow-sm">
          <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1 tracking-wider">Plano Pro</p>
          <p className="text-sm font-semibold truncate">{user.name}</p>
          <button 
            onClick={() => setCurrentTab("ajustes")}
            className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-all text-center text-white"
          >
            Ajustes
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-medium text-sm transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span>Sair da conta</span>
        </button>
      </aside>

      {/* Top Bar for Mobile */}
      <header className="md:hidden sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 px-4 py-3.5 flex justify-between items-center w-full shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h2 className="font-hanken text-lg font-bold tracking-tight text-emerald-950 dark:text-emerald-400">Jurex AI</h2>
        </div>
        <button 
          onClick={handleOpenNotifications}
          className="relative p-2 text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <Bell size={20} />
          {notifications.some(n => !n.isRead) && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 border-2 border-white dark:border-slate-900 rounded-full"></span>
          )}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 md:ml-64 px-4 md:px-8 pt-4 pb-24 md:pt-8 min-h-screen overflow-y-auto">
        {/* Desktop Header Notification Bell */}
        <header className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h2 className="font-hanken text-2xl font-bold text-slate-800 dark:text-white">
              {currentTab === "inicio" && "Olá, " + user.name.split(" ")[0]}
              {currentTab === "contratos" && "Contratos de Empréstimo"}
              {currentTab === "clientes" && "Gestão de Clientes"}
              {currentTab === "relatorios" && "Relatórios e Análises"}
              {currentTab === "ajustes" && "Ajustes Gerais"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Jurex AI • Sistema inteligente de crédito pessoal</p>
          </div>

          <button 
            onClick={handleOpenNotifications}
            className="relative flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell size={18} />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
            )}
          </button>
        </header>

        {/* Dynamic Content Views */}
        <div className="max-w-4xl animate-fade-in">
          
          {/* TAB: INÍCIO (DASHBOARD) */}
          {currentTab === "inicio" && (
            <div className="space-y-6">
              
              {/* Financial Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Emprestado */}
                <div className="card-gradient p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                  <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Total Emprestado</p>
                  <h3 className="font-hanken text-2xl font-bold transition-all">
                    R$ {financials.totalEmprestado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full">
                      R$ {financials.totalEmprestadoEsteMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} este mês
                    </span>
                  </div>
                </div>

                {/* Recebido */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Recebido</p>
                  <h3 className="font-hanken text-2xl font-bold text-slate-800 dark:text-white">
                    R$ {financials.totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                    </svg>
                    <span>Fluxo saudável</span>
                  </div>
                </div>

                {/* A Receber */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">A Receber</p>
                  <h3 className="font-hanken text-2xl font-bold text-slate-800 dark:text-white">
                    R$ {financials.totalAReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-xs text-amber-500 font-semibold">
                    <span>Em aberto / a vencer</span>
                  </div>
                </div>

                {/* Lucro Estimado */}
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800/40 shadow-sm relative overflow-hidden">
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400 mb-1">Lucro Estimado</p>
                  <h3 className="font-hanken text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    R$ {financials.totalLucro.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Juros acumulados</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <section>
                <h4 className="text-[11px] font-bold text-[#3c4a42] dark:text-[#a1a1a1] uppercase tracking-wider mb-3">Acesso Rápido</h4>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => { setShowAddLoan(true); setShowAddClient(false); }}
                    className="flex items-center gap-2 px-4 py-3 bg-[#10b981] hover:bg-[#006c49] text-white rounded-xl text-xs font-semibold shadow transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Novo Empréstimo</span>
                  </button>
                  <button 
                    onClick={() => { setShowAddClient(true); setShowAddLoan(false); }}
                    className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#181a1b] text-[#191c1d] dark:text-white border border-[#bbcabf]/30 hover:bg-[#f3f4f5] dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Users size={16} />
                    <span>Cadastrar Cliente</span>
                  </button>
                  <button 
                    onClick={() => setCurrentTab("relatorios")}
                    className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#181a1b] text-[#191c1d] dark:text-white border border-[#bbcabf]/30 hover:bg-[#f3f4f5] dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <TrendingUp size={16} />
                    <span>Ver Relatórios</span>
                  </button>
                </div>
              </section>

              {/* Insights IA Jurex */}
              <section className="bg-slate-900 rounded-3xl p-6 text-white ai-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-emerald-400/20 rounded flex items-center justify-center">
                    <Sparkles size={14} className="text-emerald-400" />
                  </div>
                  <h5 className="text-xs font-bold tracking-widest uppercase text-emerald-400">Insights IA Jurex</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-white/60 mb-1 uppercase tracking-tighter">Risco Médio da Carteira</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">4.2%</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-3 bg-emerald-500 rounded-full"></div>
                        <div className="w-1.5 h-3 bg-emerald-500 rounded-full"></div>
                        <div className="w-1.5 h-3 bg-white/20 rounded-full"></div>
                        <div className="w-1.5 h-3 bg-white/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-600/10 rounded-2xl border border-emerald-500/20">
                    <p className="text-xs font-semibold text-emerald-400 mb-2">Recomendação AI Geral:</p>
                    <p className="text-xs leading-relaxed text-slate-300">Baseado na SELIC e perfil de risco, sugerimos taxas de 2.45% a 3.8% a.m para novos contratos com score de crédito B.</p>
                  </div>
                </div>
              </section>

              {/* Active Contracts Bento List */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-[#191c1d] dark:text-white">Contratos Recentes</h4>
                  <button onClick={() => setCurrentTab("contratos")} className="text-[#006c49] dark:text-[#64f9bc] text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer">
                    <span>Ver todos</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="bg-white dark:bg-[#181a1b] rounded-2xl border border-[#bbcabf]/20 shadow-sm overflow-hidden divide-y divide-[#bbcabf]/10">
                  {loans.length === 0 ? (
                    <div className="p-8 text-center text-[#3c4a42] dark:text-zinc-400 text-sm">
                      Nenhum contrato cadastrado. Clique em &quot;Novo Empréstimo&quot; para começar!
                    </div>
                  ) : (
                    loans.map(loan => {
                      const client = clients.find(c => c.id === loan.clientId);
                      const installments = JurexStorage.getInstallmentsForLoan(loan.id);
                      const paidInsts = installments.filter(i => i.status === "paid").length;
                      const progress = installments.length > 0 ? Math.round((paidInsts / installments.length) * 100) : 0;

                      return (
                        <div 
                          key={loan.id}
                          onClick={() => setSelectedLoan(loan)}
                          className="p-4 sm:p-5 hover:bg-[#64f9bc]/5 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/30 text-[#006c49] dark:text-[#64f9bc] rounded-xl flex items-center justify-center shrink-0">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-[#191c1d] dark:text-white truncate">{client?.name || "Cliente Desconhecido"}</h5>
                              <p className="text-xs text-[#3c4a42] dark:text-zinc-400 mt-0.5">
                                {loan.notes || "Empréstimo pessoal"} • {new Date(loan.createdAt).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>

                          <div className="flex-1 max-w-xs min-w-[120px]">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-[#3c4a42] dark:text-[#a1a1a1] uppercase">Pagamento</span>
                              <span className="text-xs font-bold text-[#006c49] dark:text-[#64f9bc]">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#edeeef] dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-hanken font-bold text-[#191c1d] dark:text-white">
                              R$ {loan.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                            <p className={`text-[10px] font-bold uppercase mt-1 ${loan.status === "paid" ? "text-emerald-500" : loan.status === "late" ? "text-red-500" : "text-[#006c49] dark:text-[#64f9bc]"}`}>
                              {loan.status === "paid" ? "Quitado" : loan.status === "late" ? "Atrasado" : "Ativo"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

            </div>
          )}

          {/* TAB: CONTRATOS */}
          {currentTab === "contratos" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-hanken text-xl font-bold">Todos os Contratos</h3>
                <button 
                  onClick={() => { setShowAddLoan(true); setTempAIResult(null); }}
                  className="px-4 py-2.5 bg-[#10b981] hover:bg-[#006c49] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Novo Contrato</span>
                </button>
              </div>

              {/* List card */}
              <div className="bg-white dark:bg-[#181a1b] rounded-2xl border border-[#bbcabf]/20 shadow-sm overflow-hidden divide-y divide-[#bbcabf]/10">
                {loans.length === 0 ? (
                  <div className="p-8 text-center text-[#3c4a42] dark:text-zinc-400 text-sm">
                    Nenhum contrato registrado até o momento.
                  </div>
                ) : (
                  loans.map(loan => {
                    const client = clients.find(c => c.id === loan.clientId);
                    const installments = JurexStorage.getInstallmentsForLoan(loan.id);
                    const paidCount = installments.filter(i => i.status === "paid").length;

                    return (
                      <div 
                        key={loan.id}
                        onClick={() => setSelectedLoan(loan)}
                        className="p-5 hover:bg-[#64f9bc]/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/30 text-[#006c49] dark:text-[#64f9bc] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#191c1d] dark:text-white text-base">{client?.name || "Cliente Desconhecido"}</h4>
                            <p className="text-xs text-[#3c4a42] dark:text-zinc-400 mt-0.5">CPF/CNPJ: {client?.cpfCnpj}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-[10px] font-bold uppercase bg-[#edeeef] dark:bg-zinc-800 text-[#3c4a42] dark:text-zinc-300 px-2 py-0.5 rounded">
                                {loan.installmentsCount} parcelas {loan.frequency}s
                              </span>
                              {loan.delayProbability !== undefined && (
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${loan.delayProbability > 40 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                                  Risco: {loan.delayProbability}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right sm:text-right flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-2 sm:gap-1 border-t sm:border-0 border-zinc-100 pt-3 sm:pt-0">
                          <div>
                            <p className="text-xs text-[#3c4a42] dark:text-zinc-400">Valor Total</p>
                            <p className="font-hanken font-bold text-lg text-[#191c1d] dark:text-white">
                              R$ {loan.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${loan.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-[#64f9bc]/20 text-[#006c49] dark:text-[#64f9bc]"}`}>
                            {loan.status === "paid" ? "Quitado" : `${paidCount}/${installments.length} Parcelas`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: CLIENTES */}
          {currentTab === "clientes" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-hanken text-xl font-bold">Gerenciamento de Clientes</h3>
                <button 
                  onClick={() => setShowAddClient(true)}
                  className="px-4 py-2.5 bg-[#10b981] hover:bg-[#006c49] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Novo Cliente</span>
                </button>
              </div>

              {/* Grid of clients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clients.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-[#3c4a42] dark:text-zinc-400 bg-white dark:bg-[#181a1b] rounded-2xl border border-[#bbcabf]/20">
                    Nenhum cliente cadastrado ainda.
                  </div>
                ) : (
                  clients.map(client => {
                    const clientLoans = loans.filter(l => l.clientId === client.id);
                    return (
                      <div 
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className="bg-white dark:bg-[#181a1b] p-5 rounded-2xl border border-[#bbcabf]/20 hover:border-[#10b981]/50 shadow-sm transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#006c49] text-white font-bold rounded-xl flex items-center justify-center">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#191c1d] dark:text-white leading-tight">{client.name}</h4>
                              <p className="text-xs text-[#3c4a42] dark:text-zinc-400 mt-0.5">Cadastrado em {new Date(client.createdAt).toLocaleDateString("pt-BR")}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs text-[#3c4a42] dark:text-zinc-300">
                            <div className="flex items-center gap-2">
                              <Shield size={14} className="text-[#006c49] dark:text-[#64f9bc]" />
                              <span>CPF/CNPJ: {client.cpfCnpj}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-[#006c49] dark:text-[#64f9bc]" />
                              <span>{client.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-[#006c49] dark:text-[#64f9bc]" />
                              <span>{client.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-[#3c4a42] uppercase">Contratos</span>
                          <span className="text-xs font-bold text-[#006c49] dark:text-[#64f9bc] bg-[#64f9bc]/20 px-2 py-0.5 rounded-full">
                            {clientLoans.length} empréstimo(s)
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: RELATÓRIOS */}
          {currentTab === "relatorios" && (() => {
            const chartData = getChartData();
            const currentProfit = financials.totalRecebido - financials.totalEmprestado;
            return (
              <div className="space-y-6">
                {/* Summary Cards Grid */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Emprestado Card */}
                  <div className="bg-white dark:bg-[#181a1b] p-4 flex flex-col gap-3 border border-[#bbcabf]/20 shadow-sm rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest block">Emprestado</p>
                      <p className="font-hanken font-bold text-lg sm:text-xl text-slate-800 dark:text-white mt-0.5">
                        R$ {financials.totalEmprestado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Recebido Card */}
                  <div className="bg-white dark:bg-[#181a1b] p-4 flex flex-col gap-3 border border-[#bbcabf]/20 shadow-sm rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest block">Recebido</p>
                      <p className="font-hanken font-bold text-lg sm:text-xl text-emerald-600 dark:text-emerald-400 mt-0.5">
                        R$ {financials.totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Pendente Card */}
                  <div className="bg-white dark:bg-[#181a1b] p-4 flex flex-col gap-3 border border-[#bbcabf]/20 shadow-sm rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest block">Pendente</p>
                      <p className="font-hanken font-bold text-lg sm:text-xl text-amber-600 dark:text-amber-400 mt-0.5">
                        R$ {financials.totalAReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Lucro Card */}
                  <div className="bg-white dark:bg-[#181a1b] p-4 flex flex-col gap-3 border border-[#bbcabf]/20 shadow-sm rounded-2xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentProfit >= 0 ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"}`}>
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest block">Lucro</p>
                      <p className={`font-hanken font-bold text-lg sm:text-xl mt-0.5 ${currentProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {currentProfit < 0 ? "-" : ""}R$ {Math.abs(currentProfit).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Main Charts Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Entrada vs Saída Bar Chart Card */}
                  <div className="bg-white dark:bg-[#181a1b] p-6 rounded-3xl border border-slate-200 dark:border-[#bbcabf]/20 shadow-sm flex flex-col gap-6">
                    <div>
                      <h3 className="font-hanken font-bold text-[#191c1d] dark:text-white text-lg">Entrada vs Saída</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Últimos 6 meses</p>
                    </div>
                    {/* Filter Controls */}
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 rounded-xl bg-[#006c49] text-white font-bold text-xs shadow">Últimos 6 meses</button>
                      <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#bbcabf]/20 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold">Período específico</button>
                    </div>
                    {/* Chart Container */}
                    <div className="h-64 relative mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                          <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v}`} />
                          <Tooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
                          <Bar dataKey="Entrada" fill="#006c49" radius={[4, 4, 0, 0]} barSize={16} name="Entrada" />
                          <Bar dataKey="Saída" fill="#ba1a1a" radius={[4, 4, 0, 0]} barSize={16} name="Saída" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Evolução de Recebimentos Line Chart Card */}
                  <div className="bg-white dark:bg-[#181a1b] p-6 rounded-3xl border border-slate-200 dark:border-[#bbcabf]/20 shadow-sm flex flex-col gap-6">
                    <div>
                      <h3 className="font-hanken font-bold text-[#191c1d] dark:text-white text-lg">Evolução de recebimentos</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Últimos 6 meses</p>
                    </div>
                    <div className="h-64 relative mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                          <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v}`} />
                          <Tooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
                          <Area type="monotone" dataKey="Entrada" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEntrada)" name="Recebido" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </section>
              </div>
            );
          })()}

          {/* TAB: AJUSTES */}
          {currentTab === "ajustes" && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <section className="bg-white dark:bg-[#181a1b] rounded-2xl p-6 border border-[#bbcabf]/20 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 bg-[#006c49] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400 tracking-widest block mb-0.5">PERFIL</span>
                  <h3 className="font-hanken text-lg font-bold text-[#191c1d] dark:text-white">{user.name}</h3>
                  <p className="text-xs text-[#3c4a42] dark:text-zinc-400 mt-0.5">{user.email}</p>
                </div>
              </section>

              {/* Theme selection */}
              <section className="space-y-2">
                <h4 className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400 tracking-wider">APARÊNCIA</h4>
                <div className="bg-white dark:bg-[#181a1b] rounded-2xl p-4 border border-[#bbcabf]/20 shadow-sm space-y-3">
                  <p className="text-xs font-bold text-[#3c4a42] dark:text-zinc-300">TEMA DO APLICATIVO</p>
                  <div className="flex bg-[#edeeef] dark:bg-zinc-800 rounded-xl p-1 gap-1">
                    <button 
                      onClick={() => toggleTheme("light")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs font-semibold ${!isDarkMode ? "bg-[#006c49] text-white shadow" : "text-[#3c4a42] dark:text-zinc-400 hover:bg-zinc-700/50"}`}
                    >
                      <Sun size={14} />
                      <span>Claro</span>
                    </button>
                    <button 
                      onClick={() => toggleTheme("dark")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-xs font-semibold ${isDarkMode ? "bg-[#10b981] text-white shadow" : "text-[#3c4a42] dark:text-zinc-500 hover:bg-zinc-100"}`}
                    >
                      <Moon size={14} />
                      <span>Escuro</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Profile fields */}
              <section className="space-y-2">
                <h4 className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400 tracking-wider">DADOS GERAIS</h4>
                <div className="bg-white dark:bg-[#181a1b] rounded-2xl p-6 border border-[#bbcabf]/20 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">NOME EXIBIDO</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">TELEFONE DE CONTATO</label>
                    <input 
                      type="text" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                    />
                  </div>
                  <button 
                    onClick={handleUpdateProfile}
                    className="bg-[#006c49] hover:bg-[#005137] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow active:scale-95 transition-all cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </section>

              {/* Push notifications and security */}
              <section className="space-y-2">
                <h4 className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400 tracking-wider">NOTIFICAÇÕES E SEGURANÇA</h4>
                <div className="bg-white dark:bg-[#181a1b] rounded-2xl border border-[#bbcabf]/20 shadow-sm overflow-hidden divide-y divide-[#bbcabf]/10">
                  
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#64f9bc]/10 text-[#006c49] dark:text-[#64f9bc] rounded-xl flex items-center justify-center shrink-0">
                        <Bell size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#191c1d] dark:text-white">Notificações Push</p>
                        <p className="text-[10px] text-[#3c4a42] dark:text-zinc-400 mt-0.5">Alerta de parcelas prestes a vencer</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={user.pushNotificationsEnabled}
                        onChange={togglePushNotifications}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-[#10b981]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#64f9bc]/10 text-[#006c49] dark:text-[#64f9bc] rounded-xl flex items-center justify-center shrink-0">
                        <Lock size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#191c1d] dark:text-white">Criptografia de Ponta a Ponta</p>
                        <p className="text-[10px] text-[#3c4a42] dark:text-zinc-400 mt-0.5">Proteção avançada de contratos locais</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">ATIVO</span>
                  </div>

                </div>
              </section>

              {/* Logout Button */}
              <section className="pt-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm rounded-2xl hover:bg-red-100/40 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sair da conta</span>
                </button>
              </section>
            </div>
          )}

        </div>
      </main>

      {/* Slide-over / Modal for Notifications */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-white dark:bg-[#181a1b] h-full shadow-xl flex flex-col p-6 animate-fade-in relative">
            <button 
              onClick={() => setIsNotificationsOpen(false)}
              className="absolute top-5 right-5 text-[#3c4a42] hover:text-black dark:text-zinc-400 dark:hover:text-white p-1 rounded-full cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <h3 className="font-hanken text-lg font-bold mb-4 flex items-center gap-2">
              <Bell size={18} className="text-[#006c49]" />
              <span>Notificações</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#3c4a42] text-sm">
                  Sem notificações novas.
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-[#bbcabf]/10 relative">
                    <h5 className="font-bold text-xs flex items-center gap-1.5">
                      {n.type === "success" && <CheckCircle size={12} className="text-emerald-500" />}
                      {n.type === "warning" && <AlertCircle size={12} className="text-yellow-500" />}
                      {n.type === "info" && <Activity size={12} className="text-[#006c49]" />}
                      <span>{n.title}</span>
                    </h5>
                    <p className="text-[10.5px] text-[#3c4a42] dark:text-zinc-300 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[8px] text-[#3c4a42] block mt-2">{new Date(n.createdAt).toLocaleTimeString("pt-BR")}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Client Registration details popup */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-[#181a1b] rounded-3xl p-6 shadow-xl border border-[#bbcabf]/20 animate-fade-in relative max-h-[90vh] overflow-y-auto scroll-hide">
            <button 
              onClick={() => { setSelectedClient(null); setIsEditingClient(false); }}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black dark:hover:text-white p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            >
              <XIcon />
            </button>

            {!isEditingClient ? (
              // CLIENT DETAIL VIEW
              <div className="space-y-6">
                {/* Header Profile Info */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 bg-[#006c49] text-white font-bold rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0">
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-hanken text-lg font-bold text-[#191c1d] dark:text-white leading-tight">
                      {selectedClient.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Cliente desde {new Date(selectedClient.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Score Médio
                    </span>
                  </div>
                </div>

                {/* mini stats grid */}
                {(() => {
                  const clientLoans = loans.filter(l => l.clientId === selectedClient.id);
                  const totalEmprestado = clientLoans.reduce((sum, l) => sum + l.amount, 0);
                  const totalRecebido = clientLoans.reduce((sum, l) => {
                    const insts = JurexStorage.getInstallmentsForLoan(l.id);
                    return sum + insts.filter(i => i.status === "paid").reduce((acc, i) => acc + i.amount, 0);
                  }, 0);

                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-900 border border-[#bbcabf]/10 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">EMPRESTADO</span>
                        <span className="font-hanken font-bold text-base text-slate-800 dark:text-white block mt-0.5">
                          R$ {totalEmprestado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/10 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">RECEBIDO</span>
                        <span className="font-hanken font-bold text-base text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          R$ {totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Contact details list */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                      <Shield size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">CPF / CNPJ</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5">
                        {selectedClient.cpfCnpj}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                      <Phone size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">TELEFONE</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5">
                        {selectedClient.phone || "Não informado"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                      <Mail size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">E-MAIL</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5">
                        {selectedClient.email || "Não informado"}
                      </span>
                    </div>
                  </div>
                  {selectedClient.notes && (
                    <div className="pt-2 border-t border-slate-200/40 mt-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">OBSERVAÇÕES</span>
                      <p className="text-xs italic text-slate-500 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {selectedClient.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Edit & Delete Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsEditingClient(true)}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <Edit size={14} />
                    <span>Editar Cliente</span>
                  </button>
                  <button 
                    onClick={() => setShowDeleteClientConfirm(true)}
                    className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/40 text-red-600 dark:text-red-400 py-3.5 px-4 rounded-xl text-xs font-bold hover:bg-red-100/40 transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Excluir Cliente</span>
                  </button>
                </div>

                {/* Contracts section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Histórico de Contratos
                  </p>

                  {(() => {
                    const clientLoans = loans.filter(l => l.clientId === selectedClient.id);
                    const activeLoans = clientLoans.filter(l => l.status !== "paid");
                    const paidLoans = clientLoans.filter(l => l.status === "paid");

                    if (clientLoans.length === 0) {
                      return <p className="text-xs text-slate-400 italic">Sem contratos registrados.</p>;
                    }

                    return (
                      <div className="space-y-4">
                        {/* ACTIVE LOANS */}
                        {activeLoans.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded-full">
                              Ativos ({activeLoans.length})
                            </span>
                            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                              {activeLoans.map(l => (
                                <div 
                                  key={l.id} 
                                  onClick={() => {
                                    setSelectedLoan(l);
                                    setSelectedClient(null);
                                  }}
                                  className="flex justify-between items-center text-xs p-2.5 bg-white dark:bg-slate-900 hover:bg-yellow-500/5 dark:hover:bg-yellow-500/5 border border-slate-200 dark:border-slate-800 hover:border-yellow-400 dark:hover:border-yellow-500/50 rounded-xl transition-all cursor-pointer shadow-sm"
                                >
                                  <div>
                                    <p className="font-bold text-slate-800 dark:text-white">R$ {l.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">{new Date(l.createdAt).toLocaleDateString("pt-BR")} • {l.code || "S/C"}</p>
                                  </div>
                                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400">
                                    Ativo
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PAID LOANS */}
                        {paidLoans.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                              Quitados ({paidLoans.length})
                            </span>
                            <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                              {paidLoans.map(l => (
                                <div 
                                  key={l.id} 
                                  onClick={() => {
                                    setSelectedLoan(l);
                                    setSelectedClient(null);
                                  }}
                                  className="flex justify-between items-center text-xs p-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/5 border border-slate-200 dark:border-slate-800 hover:border-[#10b981] dark:hover:border-[#10b981]/50 rounded-xl transition-all cursor-pointer shadow-sm"
                                >
                                  <div>
                                    <p className="font-bold text-slate-800 dark:text-white">R$ {l.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">{new Date(l.createdAt).toLocaleDateString("pt-BR")} • {l.code || "S/C"}</p>
                                  </div>
                                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                                    Quitado
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              // CLIENT EDIT VIEW
              <div className="space-y-4">
                <h3 className="font-hanken text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                  <Edit size={18} className="text-[#006c49]" />
                  <span>Editar Cliente</span>
                </h3>

                <form onSubmit={handleEditClientSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">NOME DO CLIENTE</label>
                    <input 
                      type="text" 
                      required
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">CPF / CNPJ (OPCIONAL)</label>
                    <input 
                      type="text" 
                      value={editClientCpf}
                      onChange={(e) => setEditClientCpf(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">TELEFONE</label>
                      <input 
                        type="text" 
                        value={editClientPhone}
                        onChange={(e) => setEditClientPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">EMAIL (OPCIONAL)</label>
                      <input 
                        type="email" 
                        value={editClientEmail}
                        onChange={(e) => setEditClientEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">NOTAS / OBSERVAÇÕES</label>
                    <textarea 
                      rows={2}
                      value={editClientNotes}
                      onChange={(e) => setEditClientNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-xs"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsEditingClient(false)}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3.5 bg-[#10b981] hover:bg-[#006c49] text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Confirm Deletion of Client */}
      {showDeleteClientConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in text-center relative">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-hanken text-lg font-bold text-slate-800 dark:text-white mb-2">Excluir Cliente?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Tem certeza que deseja excluir o cliente <strong className="font-bold">{selectedClient?.name}</strong>? Esta ação é irreversível e excluirá permanentemente todos os seus contratos e parcelas vinculadas.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowDeleteClientConfirm(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              // 📌 Handle Delete Client
const handleDeleteClient = (clientId: string) => {
  JurexStorage.deleteClient(clientId, user?.id || "");
  setClients(JurexStorage.getClients(user?.id || ""));
  setSelectedClient(null);
  setIsEditingClient(false);
};

// ...

<button 
  onClick={() => {
    if (selectedClient) {
      handleDeleteClient(selectedClient.id);
    }
  }}
  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
>
  Confirmar Exclusão
</button>

{/* Modal: Loan Detail View & Repayment management */}
      {selectedLoan && (() => {
        const client = clients.find(c => c.id === selectedLoan.clientId);
        const code = selectedLoan.code || "#" + selectedLoan.id.substring(selectedLoan.id.length - 6).toUpperCase();
        const installments = JurexStorage.getInstallmentsForLoan(selectedLoan.id);
        const paidCount = installments.filter(i => i.status === "paid").length;
        const progress = installments.length > 0 ? Math.round((paidCount / installments.length) * 100) : 0;
        const totalPaidAmount = installments.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
        const unpaidInsts = installments.filter(i => i.status !== "paid");
        const nextInst = unpaidInsts[0];

        return (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in relative max-h-[90vh] overflow-y-auto no-scrollbar">
              
              {/* Back & Close header */}
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-hanken text-lg font-bold text-slate-800 dark:text-white leading-none">{code}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cliente: {client?.name || "Não informado"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedLoan(null); setIsRenegotiating(false); setShowDeleteConfirm(false); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
                >
                  <XIcon />
                </button>
              </div>

              {/* Inline Renegotiation Form */}
              {isRenegotiating ? (
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 animate-fade-in">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                    <TrendingUp size={14} />
                    <span>Renegociar Contrato</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Nova Taxa % A.M.</label>
                      <input 
                        type="number" 
                        value={renegRate}
                        onChange={(e) => setRenegRate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Novas Parcelas</label>
                      <input 
                        type="number" 
                        value={renegCount}
                        onChange={(e) => setRenegCount(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button 
                      onClick={() => setIsRenegotiating(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => handleRenegotiateSubmit(selectedLoan.id)}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition-all active:scale-95"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Summary Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor do Contrato</span>
                    <h3 className="font-hanken text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      R$ {selectedLoan.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    selectedLoan.status === "paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                    selectedLoan.status === "late" ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" :
                    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedLoan.status === "paid" ? "bg-emerald-500" :
                      selectedLoan.status === "late" ? "bg-red-500" :
                      "bg-amber-500"
                    }`}></span>
                    {selectedLoan.status === "paid" ? "Quitado" : selectedLoan.status === "late" ? "Atrasado" : "Em dia"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">Juros</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{selectedLoan.interestRate}% a.m.</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">Parcelas</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{selectedLoan.installmentsCount}x</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">Início</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                      {new Date(selectedLoan.firstDueDate || selectedLoan.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {selectedLoan.chargeLateInterest && selectedLoan.lateInterestValue !== undefined && (
                  <div className="mb-4 bg-red-500/[0.03] dark:bg-red-950/20 border border-red-500/10 rounded-2xl p-3 flex justify-between items-center text-xs">
                    <span className="text-red-700 dark:text-red-400 font-semibold uppercase tracking-wider text-[10px]">
                      Juros de atraso ativos:
                    </span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {selectedLoan.lateInterestType === "percent" 
                        ? `${selectedLoan.lateInterestValue}% ao dia` 
                        : `R$ ${selectedLoan.lateInterestValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} fixo ao dia`}
                    </span>
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Progresso de Quitação</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>{paidCount} de {installments.length} pagas</span>
                    <span>Recebido: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">R$ {totalPaidAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
                  </div>
                </div>

                {/* Next Due Date card if active */}
                {nextInst && (
                  <div className="mt-5 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/40 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight block">Próximo Vencimento</span>
                      <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">Parcela #{nextInst.number} • R$ {nextInst.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{new Date(nextInst.dueDate).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
              </div>

              {/* AI predictions section if exists */}
              {selectedLoan.delayProbability !== undefined && (
                <div className="mb-6 bg-gradient-to-tr from-emerald-500/[0.05] to-teal-500/[0.05] border border-emerald-500/20 rounded-3xl p-5">
                  <h5 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} />
                    <span>Análise de Risco Jurex AI</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    <div className="bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-500 block">Chance de Atraso:</span>
                      <strong className={`text-sm font-bold ${selectedLoan.delayProbability > 40 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>{selectedLoan.delayProbability}%</strong>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-500 block">Taxa Ideal Sugerida:</span>
                      <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{selectedLoan.suggestedRate}% a.m.</strong>
                    </div>
                  </div>
                  {selectedLoan.aiRecommendation && (
                    <p className="text-[10.5px] text-slate-600 dark:text-slate-300 italic border-t border-slate-200/40 dark:border-slate-800/40 pt-2 leading-relaxed">
                      &ldquo;{selectedLoan.aiRecommendation}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Actions row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <button 
                  onClick={() => handleWhatsAppShare(selectedLoan)}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.455L0 24zm6.59-4.846c1.66.986 3.288 1.503 5.342 1.504 5.573 0 10.107-4.505 10.11-10.051.002-2.687-1.036-5.212-2.924-7.103-1.886-1.887-4.394-2.924-7.081-2.925-5.584 0-10.12 4.505-10.124 10.053-.002 2.154.562 3.86 1.637 5.563L1.93 22.14l6.402-1.677c-1.67-.912-1.68-.92-1.685-.909z"/>
                  </svg>
                  <span>Enviar via WhatsApp</span>
                </button>
                <button 
                  onClick={() => {
                    setIsRenegotiating(true);
                    setRenegRate(String(selectedLoan.interestRate));
                    setRenegCount(String(selectedLoan.installmentsCount));
                  }}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-3.5 px-4 rounded-2xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Renegociar</span>
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 py-3.5 px-4 rounded-2xl text-xs font-bold hover:bg-red-100/40 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Excluir Contrato</span>
                </button>
              </div>

              {/* Installments header */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Parcelas do Contrato</h4>
                <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
                  {installments.map(inst => (
                    <div key={inst.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          inst.status === "paid" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" :
                          inst.status === "late" ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400" :
                          "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                        }`}>
                          {inst.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {inst.originalAmount && inst.amount !== inst.originalAmount && (
                              <span className="text-[10.5px] text-slate-400 line-through">
                                R$ {inst.originalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            )}
                            <span className="font-bold text-slate-800 dark:text-white text-sm">
                              R$ {inst.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                            {inst.originalAmount && inst.amount !== inst.originalAmount && (
                              <span className="text-[9px] bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-1.5 py-0.5 rounded font-bold">
                                +R$ {(inst.amount - inst.originalAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} de juros
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              inst.status === "paid" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" :
                              inst.status === "late" ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" :
                              "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {inst.status === "paid" ? "Paga" : inst.status === "late" ? "Atrasada" : "A vencer"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">Vencimento: {new Date(inst.dueDate).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      {inst.status !== "paid" && (
                        <div className="flex gap-2 w-full md:w-auto">
                          <button 
                            onClick={() => {
                              // Share charging template via a dynamic alert or WhatsApp copy
                              const shareText = `Olá, ${client?.name}! Lembrando do vencimento da sua parcela #${inst.number} no valor de R$ ${inst.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em ${new Date(inst.dueDate).toLocaleDateString("pt-BR")}. Segue chave Pix para pagamento. Obrigado!`;
                              setWhatsAppText(shareText);
                              setShowWhatsAppModal(true);
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            <span>Cobrar</span>
                          </button>
                          <button 
                            onClick={() => {
                              setIsRenegotiating(true);
                              setRenegRate(String(selectedLoan.interestRate));
                              setRenegCount(String(selectedLoan.installmentsCount));
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            <span>Renegociar</span>
                          </button>
                          <button 
                            onClick={() => handlePayInstallment(inst.id, selectedLoan.id)}
                            className="flex-1 md:flex-none flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-all active:scale-95 cursor-pointer"
                          >
                            <span>Pagar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Modal: Confirm Deletion */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in text-center relative">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-hanken text-lg font-bold text-slate-800 dark:text-white mb-2">Excluir Contrato?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Tem certeza que deseja excluir o contrato <strong className="font-bold">{selectedLoan?.code}</strong>? Esta ação é irreversível e removerá todas as parcelas associadas de forma permanente.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (selectedLoan) {
                    handleDeleteLoan(selectedLoan.id);
                  }
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Receber Pagamento */}
      {showPaymentModal && paymentInstallment && paymentLoan && (() => {
        const client = clients.find(c => c.id === paymentLoan.clientId);
        const clientName = client ? client.name : "Cliente";
        const displayValue = paymentType === "parcela"
          ? paymentInstallment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : paymentType === "juros"
            ? (getSuggestedInterest(paymentInstallment, paymentLoan)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : (paymentInstallment.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h3 className="font-hanken text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CreditCard className="text-[#006c49]" size={20} />
                  <span>Receber pagamento</span>
                </h3>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentInstallment(null);
                    setPaymentLoan(null);
                  }}
                  className="text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
                >
                  <XIcon />
                </button>
              </div>

              {/* Highlight Card */}
              <div className="bg-[#f0fdf4] dark:bg-emerald-950/20 border border-[#dcfce7] dark:border-emerald-900/30 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#006c49]"></div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest mb-1">TOTAL A RECEBER</p>
                <h2 className="font-hanken font-bold text-3xl text-[#006c49] dark:text-emerald-400 mb-1">
                  R$ {displayValue}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {clientName} • Parcela {paymentInstallment.number}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Vencimento {new Date(paymentInstallment.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest">TIPO DE RECEBIMENTO</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option: Parcela */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("parcela");
                      setPaymentAmount(String(paymentInstallment.amount));
                    }}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      paymentType === "parcela"
                        ? "bg-[#006c49] text-white border-[#006c49] shadow-md shadow-[#006c49]/20"
                        : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-zinc-800 hover:border-[#006c49]/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentType === "parcela" ? "bg-white/20" : "bg-emerald-50 dark:bg-emerald-950/20 text-[#006c49]"}`}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Parcela</p>
                      <p className={`text-[9px] mt-0.5 leading-tight ${paymentType === "parcela" ? "text-white/80" : "text-slate-400"}`}>Quitar parcela atual</p>
                    </div>
                  </button>

                  {/* Option: Apenas juros */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("juros");
                      const sugInt = getSuggestedInterest(paymentInstallment, paymentLoan);
                      setPaymentAmount(String(sugInt || 150));
                    }}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      paymentType === "juros"
                        ? "bg-[#006c49] text-white border-[#006c49] shadow-md shadow-[#006c49]/20"
                        : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-zinc-800 hover:border-[#006c49]/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentType === "juros" ? "bg-white/20" : "bg-amber-50 dark:bg-amber-950/20 text-amber-600"}`}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Apenas juros</p>
                      <p className={`text-[9px] mt-0.5 leading-tight ${paymentType === "juros" ? "text-white/80" : "text-slate-400"}`}>Renovar por 30 dias</p>
                    </div>
                  </button>

                  {/* Option: Quitação total */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("quitacao");
                      setPaymentAmount(String(paymentInstallment.amount));
                    }}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      paymentType === "quitacao"
                        ? "bg-[#006c49] text-white border-[#006c49] shadow-md shadow-[#006c49]/20"
                        : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-zinc-800 hover:border-[#006c49]/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentType === "quitacao" ? "bg-white/20" : "bg-blue-50 dark:bg-blue-950/20 text-blue-600"}`}>
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Quitação total</p>
                      <p className={`text-[9px] mt-0.5 leading-tight ${paymentType === "quitacao" ? "text-white/80" : "text-slate-400"}`}>Valor flexível</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Input section */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest block">
                  {paymentType === "parcela" && "VALOR RECEBIDO"}
                  {paymentType === "juros" && "JUROS DO PERÍODO (R$)"}
                  {paymentType === "quitacao" && "VALOR DA QUITAÇÃO"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    disabled={paymentType === "parcela"}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className={`w-full px-4 py-3.5 pl-12 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none text-base font-bold text-slate-800 dark:text-white ${
                      paymentType === "parcela" ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                {paymentType === "juros" && (
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center mt-1">
                    Sugerido: R$ {getSuggestedInterest(paymentInstallment, paymentLoan).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({paymentLoan.interestRate}% a.m. sobre R$ {paymentLoan.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                  </p>
                )}
                {paymentType === "quitacao" && (
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center mt-1">
                    Digite o valor negociado para encerrar este contrato.
                  </p>
                )}
              </div>

              {/* Summary recals */}
              {(paymentType === "juros" || paymentType === "quitacao") && (
                <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-zinc-400">Saldo principal atual</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-200">
                      R$ {paymentLoan.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-zinc-400">
                      {paymentType === "juros" ? "Juros pagos agora" : "Valor de quitação pago"}
                    </span>
                    <span className="font-bold text-[#006c49] dark:text-emerald-400">
                      R$ {(parseFloat(paymentAmount) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 dark:border-zinc-800 pt-3 text-sm">
                    <span className="text-slate-500 dark:text-zinc-400 font-semibold">Novo saldo principal</span>
                    <span className="font-bold text-[#006c49] dark:text-emerald-400">
                      R$ {paymentType === "juros" ? paymentLoan.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
                    </span>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 text-[10px] p-3 rounded-lg flex gap-2 items-start leading-relaxed">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <p>
                      {paymentType === "juros"
                        ? "Saldo principal mantido — apenas juros foram quitados. Novo vencimento gerado automaticamente para o próximo período."
                        : "Contrato encerrado — todas as parcelas restantes serão marcadas como pagas com valor zerado."}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button 
                onClick={handleConfirmPaymentWithOptions}
                className="w-full py-4 bg-[#006c49] hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-[#006c49]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <CheckCircle size={18} />
                <span>Confirmar recebimento</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Modal: WhatsApp Share/Copy Message */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in relative">
            <button 
              onClick={() => setShowWhatsAppModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
            >
              <XIcon />
            </button>
            <h3 className="font-hanken text-lg font-bold mb-3 flex items-center gap-2 text-slate-800 dark:text-white">
              <span className="text-emerald-600">⚡</span>
              <span>Mensagem Jurex AI</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Copiando este texto você poderá enviá-lo diretamente pelo WhatsApp para o seu cliente.
            </p>

            <textarea 
              readOnly
              value={whatsAppText}
              rows={8}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono outline-none resize-none mb-4"
            />

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(whatsAppText);
                  alert("Mensagem copiada com sucesso!");
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow active:scale-95 transition-all cursor-pointer"
              >
                Copiar Texto
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(whatsAppText);
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`, "_blank");
                  setShowWhatsAppModal(false);
                }}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs rounded-2xl active:scale-95 transition-all cursor-pointer"
              >
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Client Registration Form */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#181a1b] rounded-2xl p-6 shadow-xl border border-[#bbcabf]/20 animate-fade-in relative">
            <button 
              onClick={() => setShowAddClient(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
            >
              <XIcon />
            </button>
            <h3 className="font-hanken text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-[#006c49]" />
              <span>Cadastrar Novo Cliente</span>
            </h3>

            <form onSubmit={handleAddClientSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">NOME DO CLIENTE</label>
                <input 
                  type="text" 
                  placeholder="Nome completo do devedor" 
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">CPF / CNPJ (OPCIONAL)</label>
                <input 
                  type="text" 
                  placeholder="000.000.000-00" 
                  value={newClientCpf}
                  onChange={(e) => setNewClientCpf(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">TELEFONE</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000" 
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">EMAIL (OPCIONAL)</label>
                  <input 
                    type="email" 
                    placeholder="email@dominio.com" 
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">NOTAS / OBSERVAÇÕES</label>
                <textarea 
                  rows={2}
                  placeholder="Observações complementares sobre o cliente" 
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-xs"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-[#10b981] hover:bg-[#006c49] text-white font-bold rounded-xl transition-all shadow cursor-pointer"
              >
                Cadastrar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Contract Creation & AI Analysis Form */}
      {showAddLoan && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-[#181a1b] rounded-2xl p-6 shadow-xl border border-[#bbcabf]/20 animate-fade-in relative my-8">
            <button 
              onClick={() => { setShowAddLoan(false); setTempAIResult(null); setClientSearchTerm(""); }}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
            >
              <XIcon />
            </button>
            <h3 className="font-hanken text-lg font-bold mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#006c49]" />
              <span>Novo Contrato</span>
            </h3>

            <form onSubmit={handleCreateLoanSubmit} className="space-y-4">
              
              {/* Client Selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">CLIENTE</label>
                  <button 
                    type="button" 
                    onClick={() => { setShowAddClient(true); }}
                    className="text-[10px] font-bold text-[#10b981] hover:underline"
                  >
                    + Novo Cliente
                  </button>
                </div>

                {/* Procura de cliente */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Procurar cliente por nome..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl outline-none focus:ring-1 focus:ring-[#10b981] dark:text-white"
                  />
                  {clientSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setClientSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 hover:text-black dark:hover:text-white"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <select 
                  required
                  value={selectedClientId}
                  onChange={(e) => { setSelectedClientId(e.target.value); setTempAIResult(null); }}
                  className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl outline-none text-sm dark:text-white"
                >
                  <option value="">Selecionar cliente...</option>
                  {clients
                    .filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()))
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">VALOR EMPRESTADO (R$)</label>
                <input 
                  type="number" 
                  placeholder="0,00" 
                  required
                  value={loanAmount}
                  onChange={(e) => { setLoanAmount(e.target.value); setTempAIResult(null); }}
                  className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                />
              </div>

              {/* Loan Type */}
              <div className="grid grid-cols-2 gap-2 bg-[#edeeef] dark:bg-zinc-800 p-1 rounded-xl">
                <button 
                  type="button"
                  onClick={() => { setInterestType("fixed"); setTempAIResult(null); }}
                  className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${interestType === "fixed" ? "bg-white dark:bg-[#181a1b] text-black dark:text-white shadow" : "text-[#3c4a42] dark:text-zinc-400"}`}
                >
                  Valor Fixo
                </button>
                <button 
                  type="button"
                  onClick={() => { setInterestType("interest"); setTempAIResult(null); }}
                  className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${interestType === "interest" ? "bg-[#10b981] text-white shadow" : "text-[#3c4a42] dark:text-zinc-400"}`}
                >
                  Com Juros
                </button>
              </div>

              {/* Interest and Installments */}
              {interestType === "interest" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">JUROS % A.M. (AO MÊS)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Ex: 3"
                      value={interestRate}
                      onChange={(e) => { setInterestRate(e.target.value); setTempAIResult(null); }}
                      className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">Nº PARCELAS</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Ex: 6"
                      value={installmentsCount}
                      onChange={(e) => { setInstallmentsCount(e.target.value); setTempAIResult(null); }}
                      className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl outline-none text-sm"
                    />
                  </div>
                </div>
              )}

              {interestType === "fixed" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">Nº PARCELAS</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Ex: 6"
                    value={installmentsCount}
                    onChange={(e) => { setInstallmentsCount(e.target.value); setTempAIResult(null); }}
                    className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl outline-none text-sm"
                  />
                </div>
              )}

              {/* Payment Frequency */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">FREQUÊNCIA DE PAGAMENTO</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {["diaria", "semanal", "quinzenal", "mensal"].map(freq => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => { setFrequency(freq as any); setTempAIResult(null); }}
                      className={`flex-1 min-w-[80px] border border-[#bbcabf]/20 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${frequency === freq ? "bg-[#10b981] text-white border-transparent" : "bg-white dark:bg-zinc-900 text-[#3c4a42] hover:bg-zinc-100"}`}
                    >
                      {freq === "diaria" ? "Diária" : freq === "semanal" ? "Semanal" : freq === "quinzenal" ? "Quinzenal" : "Mensal"}
                    </button>
                  ))}
                </div>
              </div>

              {/* First installment date and Late interest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400">DATA DA PRIMEIRA PARCELA</label>
                  <input 
                    type="date" 
                    value={firstDueDate}
                    onChange={(e) => { setFirstDueDate(e.target.value); setTempAIResult(null); }}
                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                    onFocus={(e) => { try { e.currentTarget.showPicker(); } catch (err) {} }}
                    className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl outline-none text-sm cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between border border-[#bbcabf]/20 rounded-xl p-3 bg-white dark:bg-zinc-900 self-end h-[48px]">
                  <span className="text-xs font-medium text-[#3c4a42]">Cobra juros em atraso</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={chargeLateInterest}
                      onChange={(e) => { setChargeLateInterest(e.target.checked); setTempAIResult(null); }}
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#10b981]"></div>
                  </label>
                </div>
              </div>

              {/* Se cobrar juros em atraso estiver ativo */}
              {chargeLateInterest && (
                <div className="bg-emerald-500/[0.02] dark:bg-zinc-900/50 border border-[#bbcabf]/15 rounded-2xl p-4 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2 bg-[#edeeef] dark:bg-zinc-800 p-1 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => { setLateInterestType("percent"); setTempAIResult(null); }}
                      className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${lateInterestType === "percent" ? "bg-[#10b981] text-white shadow" : "text-[#3c4a42] dark:text-zinc-400"}`}
                    >
                      % ao valor da parcela
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setLateInterestType("fixed"); setTempAIResult(null); }}
                      className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${lateInterestType === "fixed" ? "bg-[#10b981] text-white shadow" : "text-[#3c4a42] dark:text-zinc-400"}`}
                    >
                      Valor fixo
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3c4a42] dark:text-zinc-400 uppercase">
                      {lateInterestType === "percent" ? "JUROS % AO DIA (SOBRE A PARCELA EM ATRASO)" : "VALOR FIXO DIÁRIO DE MULTA (R$)"}
                    </label>
                    <input 
                      type="number" 
                      step="any"
                      placeholder="0"
                      value={lateInterestValue}
                      onChange={(e) => { setLateInterestValue(e.target.value); setTempAIResult(null); }}
                      className="w-full px-4 py-3 bg-[#f8f9fa] dark:bg-zinc-900 border border-[#bbcabf]/20 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* PREVIEW CARD */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-[#bbcabf]/10 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#3c4a42]">Valor da parcela:</span>
                  <strong className="font-bold text-[#191c1d] dark:text-white">R$ {preview.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3c4a42]">Total a receber:</span>
                  <strong className="font-bold text-[#10b981]">R$ {preview.total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                {interestType === "interest" && (
                  <div className="flex justify-between">
                    <span className="text-[#3c4a42]">Lucro estimado:</span>
                    <strong className="font-bold text-[#10b981]">R$ {preview.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                )}
                {chargeLateInterest && (
                  <div className="flex justify-between border-t border-dashed border-[#bbcabf]/20 pt-2 text-[10px] text-red-500 font-semibold">
                    <span>Juros de atraso ativos:</span>
                    <span>
                      {lateInterestType === "percent" 
                        ? `+${lateInterestValue}% ao dia` 
                        : `+R$ ${parseFloat(lateInterestValue || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })} por dia`}
                    </span>
                  </div>
                )}
              </div>

              {/* INTEGRATED AI PREDICTION AND INSIGHTS CARD */}
              <div className="border border-[#10b981]/30 rounded-2xl p-4 bg-emerald-500/[0.03]">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-sm text-[#006c49] dark:text-[#64f9bc] flex items-center gap-1.5">
                      <Sparkles size={16} />
                      <span>Análise de Risco com Jurex AI</span>
                    </h5>
                    <p className="text-[10.5px] text-[#3c4a42] mt-0.5">Analise as chances de atraso e receba sugestões automáticas baseadas em dados reais.</p>
                  </div>
                  <button 
                    type="button"
                    disabled={!selectedClientId || !loanAmount || isAnalyzingRisk}
                    onClick={handlePreAnalyzeRisk}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight shadow transition-all ${(!selectedClientId || !loanAmount) ? "bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none" : "bg-[#10b981] hover:bg-[#006c49] text-white active:scale-95 cursor-pointer"}`}
                  >
                    {isAnalyzingRisk ? "Analisando..." : "Analisar"}
                  </button>
                </div>

                {/* AI Results */}
                {tempAIResult && (
                  <div className="mt-3 pt-3 border-t border-[#10b981]/20 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl">
                        <span className="text-[10px] text-[#3c4a42]">Chance de Atraso:</span>
                        <strong className={`block text-sm font-bold ${tempAIResult.delayProbability > 40 ? "text-red-500" : "text-emerald-600"}`}>{tempAIResult.delayProbability}%</strong>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-2 rounded-xl">
                        <span className="text-[10px] text-[#3c4a42]">Taxa Ideal Recomendada:</span>
                        <strong className="block text-sm font-bold text-emerald-600">{tempAIResult.suggestedRate}% a.m.</strong>
                      </div>
                    </div>

                    {tempAIResult.riskAlerts.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#3c4a42]">Sinais de Risco:</span>
                        <div className="space-y-1 pl-1">
                          {tempAIResult.riskAlerts.map((alert, idx) => (
                            <div key={idx} className="text-[10px] text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle size={10} />
                              <span>{alert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] italic text-zinc-600 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-2 rounded-xl">
                      &ldquo;{tempAIResult.recommendation}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Submit contract */}
              <button 
                type="submit"
                className="w-full py-4 bg-[#10b981] hover:bg-[#006c49] text-white font-bold rounded-xl transition-all shadow-lg active:scale-98 cursor-pointer"
              >
                Criar contrato
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-white dark:bg-[#181a1b] border-t border-[#bbcabf]/20 px-2 z-50 shadow-lg">
        <button 
          onClick={() => setCurrentTab("inicio")} 
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${currentTab === "inicio" ? "text-[#006c49] dark:text-[#64f9bc] scale-105 font-bold" : "text-[#3c4a42] dark:text-zinc-400"}`}
        >
          <Activity size={18} />
          <span className="text-[9px] uppercase font-bold mt-1 tracking-wider">Início</span>
        </button>
        <button 
          onClick={() => setCurrentTab("contratos")} 
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${currentTab === "contratos" ? "text-[#006c49] dark:text-[#64f9bc] scale-105 font-bold" : "text-[#3c4a42] dark:text-zinc-400"}`}
        >
          <FileText size={18} />
          <span className="text-[9px] uppercase font-bold mt-1 tracking-wider">Contratos</span>
        </button>
        <button 
          onClick={() => setCurrentTab("clientes")} 
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${currentTab === "clientes" ? "text-[#006c49] dark:text-[#64f9bc] scale-105 font-bold" : "text-[#3c4a42] dark:text-zinc-400"}`}
        >
          <Users size={18} />
          <span className="text-[9px] uppercase font-bold mt-1 tracking-wider">Clientes</span>
        </button>
        <button 
          onClick={() => setCurrentTab("relatorios")} 
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${currentTab === "relatorios" ? "text-[#006c49] dark:text-[#64f9bc] scale-105 font-bold" : "text-[#3c4a42] dark:text-zinc-400"}`}
        >
          <TrendingUp size={18} />
          <span className="text-[9px] uppercase font-bold mt-1 tracking-wider">Relatórios</span>
        </button>
        <button 
          onClick={() => setCurrentTab("ajustes")} 
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${currentTab === "ajustes" ? "text-[#006c49] dark:text-[#64f9bc] scale-105 font-bold" : "text-[#3c4a42] dark:text-zinc-400"}`}
        >
          <Settings size={18} />
          <span className="text-[9px] uppercase font-bold mt-1 tracking-wider">Ajustes</span>
        </button>
      </nav>

    </div>
  );
}

// Micro icons for closing modal
function XIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}