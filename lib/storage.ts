import { User, Client, Loan, PaymentInstallment, Notification, LoanFrequency } from "./types";

// Helper to generate UUIDs safely on client-side
export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

// Initial default user matching the screenshot
export const DEFAULT_USER: User = {
  id: "user-victor",
  name: "Victor Gabriel de Castro Alecrim",
  email: "victorcastroassis@gmail.com",
  phone: "(81) 98311-6278",
  theme: "light",
  pushNotificationsEnabled: true,
  createdAt: "2023-01-01T12:00:00.000Z",
};

// Initial default clients matching screenshot
export const DEFAULT_CLIENTS: Client[] = [
  {
    id: "client-alzemi",
    userId: "user-victor",
    name: "Alzemi Santos",
    cpfCnpj: "123.456.789-00",
    phone: "(81) 99876-5432",
    email: "alzemi.santos@email.com",
    notes: "Cliente pontual de longa data.",
    createdAt: "2023-09-01T10:00:00.000Z",
  },
  {
    id: "client-maria",
    userId: "user-victor",
    name: "Maria Silva",
    cpfCnpj: "987.654.321-11",
    phone: "(81) 99123-4567",
    email: "maria.silva@email.com",
    notes: "Autônoma, vendas de cosméticos.",
    createdAt: "2024-02-10T14:30:00.000Z",
  },
  {
    id: "client-ricardo",
    userId: "user-victor",
    name: "Ricardo Gomes",
    cpfCnpj: "111.222.333-44",
    phone: "(81) 98888-7777",
    email: "ricardo.gomes@email.com",
    notes: "Comerciante, mercearia local.",
    createdAt: "2024-05-15T09:15:00.000Z",
  },
];

// Initial default loans matching screenshots
export const DEFAULT_LOANS: Loan[] = [
  {
    id: "loan-alzemi",
    userId: "user-victor",
    clientId: "client-alzemi",
    amount: 100,
    interestType: "interest",
    interestRate: 30, // 30% interest
    installmentsCount: 1,
    frequency: "mensal",
    status: "paid", // To reflect the "R$ 130,00 Recebido"
    firstDueDate: "2023-10-15",
    chargeLateInterest: true,
    notes: "Contrato #9921",
    createdAt: "2023-09-15T11:00:00.000Z",
    delayProbability: 12,
    suggestedRate: 4.5,
    riskAlerts: ["Cliente antigo com bom histórico."],
    aiRecommendation: "Aprovação segura. Excelente histórico de pagamentos.",
  },
  {
    id: "loan-alzemi-active",
    userId: "user-victor",
    clientId: "client-alzemi",
    amount: 100,
    interestType: "fixed",
    interestRate: 0,
    installmentsCount: 1,
    frequency: "mensal",
    status: "active", // To reflect "Total Emprestado R$ 100,00"
    firstDueDate: "2026-08-15",
    chargeLateInterest: false,
    notes: "Financiamento para capital de giro rápido.",
    createdAt: "2026-07-13T10:00:00.000Z",
    delayProbability: 8,
    suggestedRate: 3.5,
    riskAlerts: [],
    aiRecommendation: "Baixo risco. Recomendável juros baixos para fidelização.",
  }
];

export const DEFAULT_INSTALLMENTS: PaymentInstallment[] = [
  {
    id: "inst-alzemi-paid",
    loanId: "loan-alzemi",
    number: 1,
    amount: 130, // 100 + 30% juros
    dueDate: "2023-10-15",
    status: "paid",
    paymentDate: "2023-10-14",
  },
  {
    id: "inst-alzemi-active",
    loanId: "loan-alzemi-active",
    number: 1,
    amount: 100,
    dueDate: "2026-08-15",
    status: "pending",
  }
];

export const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    userId: "user-victor",
    title: "Análise de Risco Pronta",
    message: "A IA concluiu a análise do novo perfil de Maria Silva: probabilidade de atraso moderada (28%).",
    type: "info",
    isRead: false,
    createdAt: "2026-07-13T11:20:00.000Z",
  },
  {
    id: "notif-2",
    userId: "user-victor",
    title: "Vencimento Próximo",
    message: "O contrato #9921 de Alzemi Santos vence em breve. Alerta automático disparado.",
    type: "warning",
    isRead: false,
    createdAt: "2026-07-13T09:15:00.000Z",
  },
];

// Storage Engine
export class JurexStorage {
  private static isClient() {
    return typeof window !== "undefined";
  }

  static initialize() {
    if (!this.isClient()) return;

    // Seed default user if not exists
    if (!localStorage.getItem("jurex_users")) {
      localStorage.setItem("jurex_users", JSON.stringify([DEFAULT_USER]));
    }
    // Seed default clients if not exists
    if (!localStorage.getItem("jurex_clients")) {
      localStorage.setItem("jurex_clients", JSON.stringify(DEFAULT_CLIENTS));
    }
    // Seed default loans if not exists
    if (!localStorage.getItem("jurex_loans")) {
      localStorage.setItem("jurex_loans", JSON.stringify(DEFAULT_LOANS));
    }
    // Seed default installments if not exists
    if (!localStorage.getItem("jurex_installments")) {
      localStorage.setItem("jurex_installments", JSON.stringify(DEFAULT_INSTALLMENTS));
    }
    // Seed default notifications if not exists
    if (!localStorage.getItem("jurex_notifications")) {
      localStorage.setItem("jurex_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    // Seed active session to "user-victor" if no session set
    if (!localStorage.getItem("jurex_active_session")) {
      localStorage.setItem("jurex_active_session", "user-victor");
    }

    this.updateLateInstallments();
  }

  static updateLateInstallments(loanId?: string): void {
    if (!this.isClient()) return;
    const allLoans = localStorage.getItem("jurex_loans");
    if (!allLoans) return;
    const loans: Loan[] = JSON.parse(allLoans);

    const allInst = localStorage.getItem("jurex_installments");
    if (!allInst) return;
    const insts: PaymentInstallment[] = JSON.parse(allInst);

    let updated = false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    insts.forEach((inst) => {
      if (inst.status === "paid") return;

      const loan = loans.find((l) => l.id === inst.loanId);
      if (!loan) return;

      // If loanId filter is provided and doesn't match, skip
      if (loanId && inst.loanId !== loanId) return;

      const baseAmount = inst.originalAmount ?? inst.amount;
      if (inst.originalAmount === undefined) {
        inst.originalAmount = baseAmount;
      }

      const due = new Date(inst.dueDate + "T00:00:00");
      const diffTime = today.getTime() - due.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        if (inst.status !== "late") {
          inst.status = "late";
          updated = true;
        }

        if (loan.chargeLateInterest && loan.lateInterestValue) {
          const rateValue = loan.lateInterestValue;
          let calculatedAmount = baseAmount;
          if (loan.lateInterestType === "percent") {
            calculatedAmount = baseAmount + (baseAmount * (rateValue / 100) * diffDays);
          } else if (loan.lateInterestType === "fixed" || !loan.lateInterestType) {
            calculatedAmount = baseAmount + (rateValue * diffDays);
          }
          const finalAmount = parseFloat(calculatedAmount.toFixed(2));
          if (inst.amount !== finalAmount) {
            inst.amount = finalAmount;
            updated = true;
          }
        }
      } else {
        if (inst.status !== "pending") {
          inst.status = "pending";
          updated = true;
        }
        if (inst.amount !== baseAmount) {
          inst.amount = baseAmount;
          updated = true;
        }
      }
    });

    if (updated) {
      localStorage.setItem("jurex_installments", JSON.stringify(insts));

      // Also update overall status of active/late loans
      loans.forEach((loan) => {
        if (loanId && loan.id !== loanId) return;
        if (loan.status === "paid") return;

        const loanInsts = insts.filter((i) => i.loanId === loan.id);
        const hasLate = loanInsts.some((i) => i.status === "late");
        const newStatus = hasLate ? "late" : "active";
        if (loan.status !== newStatus) {
          loan.status = newStatus;
        }
      });
      localStorage.setItem("jurex_loans", JSON.stringify(loans));
    }
  }

  // Auth Operations
  static getActiveUser(): User | null {
    if (!this.isClient()) return null;
    this.initialize();
    const activeId = localStorage.getItem("jurex_active_session");
    if (!activeId) return null;

    const users = this.getUsers();
    return users.find((u) => u.id === activeId) || null;
  }

  static getUsers(): User[] {
    if (!this.isClient()) return [];
    const u = localStorage.getItem("jurex_users");
    return u ? JSON.parse(u) : [];
  }

  static login(email: string, password_placeholder: string): User | null {
    if (!this.isClient()) return null;
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem("jurex_active_session", user.id);
      return user;
    }
    return null;
  }

  static register(name: string, email: string, phone: string): User {
    if (!this.isClient()) throw new Error("Client side only");
    const users = this.getUsers();
    
    // Check if exists
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return existing;
    }

    const newUser: User = {
      id: "user-" + generateId(),
      name,
      email,
      phone,
      theme: "light",
      pushNotificationsEnabled: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("jurex_users", JSON.stringify(users));
    localStorage.setItem("jurex_active_session", newUser.id);
    return newUser;
  }

  static updateUser(updated: User) {
    if (!this.isClient()) return;
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === updated.id);
    if (index !== -1) {
      users[index] = updated;
      localStorage.setItem("jurex_users", JSON.stringify(users));
    }
  }

  static logout() {
    if (!this.isClient()) return;
    localStorage.removeItem("jurex_active_session");
  }

  // Clients Operations
  static getClients(userId: string): Client[] {
    if (!this.isClient()) return [];
    this.initialize();
    const all = localStorage.getItem("jurex_clients");
    const clients: Client[] = all ? JSON.parse(all) : [];
    return clients.filter((c) => c.userId === userId);
  }

  static addClient(userId: string, name: string, cpfCnpj: string, phone: string, email: string, notes?: string): Client {
    if (!this.isClient()) throw new Error("Client-side required");
    const all = localStorage.getItem("jurex_clients");
    const clients: Client[] = all ? JSON.parse(all) : [];

    const newClient: Client = {
      id: "client-" + generateId(),
      userId,
      name,
      cpfCnpj,
      phone,
      email,
      notes,
      createdAt: new Date().toISOString(),
    };

    clients.push(newClient);
    localStorage.setItem("jurex_clients", JSON.stringify(clients));
    return newClient;
  }

  static updateClient(updated: Client): void {
    if (!this.isClient()) return;
    const all = localStorage.getItem("jurex_clients");
    const clients: Client[] = all ? JSON.parse(all) : [];
    const index = clients.findIndex((c) => c.id === updated.id);
    if (index !== -1) {
      clients[index] = updated;
      localStorage.setItem("jurex_clients", JSON.stringify(clients));
    }
  }

  static deleteClient(clientId: string): void {
    if (!this.isClient()) return;
    const allClients = localStorage.getItem("jurex_clients");
    const clients: Client[] = allClients ? JSON.parse(allClients) : [];
    const filteredClients = clients.filter((c) => c.id !== clientId);
    localStorage.setItem("jurex_clients", JSON.stringify(filteredClients));

    const allLoans = localStorage.getItem("jurex_loans");
    const loans: Loan[] = allLoans ? JSON.parse(allLoans) : [];
    const clientLoans = loans.filter((l) => l.clientId === clientId);
    const remainingLoans = loans.filter((l) => l.clientId !== clientId);
    localStorage.setItem("jurex_loans", JSON.stringify(remainingLoans));

    const allInstallments = localStorage.getItem("jurex_installments");
    const installments: PaymentInstallment[] = allInstallments ? JSON.parse(allInstallments) : [];
    const loanIdsToDelete = clientLoans.map((l) => l.id);
    const remainingInstallments = installments.filter((inst) => !loanIdsToDelete.includes(inst.loanId));
    localStorage.setItem("jurex_installments", JSON.stringify(remainingInstallments));
  }

  // Loans Operations
  static getLoans(userId: string): Loan[] {
    if (!this.isClient()) return [];
    this.initialize();
    this.updateLateInstallments();
    const all = localStorage.getItem("jurex_loans");
    const loans: Loan[] = all ? JSON.parse(all) : [];
    return loans.filter((l) => l.userId === userId);
  }

  static createLoan(
    userId: string,
    clientId: string,
    amount: number,
    interestType: "fixed" | "interest",
    interestRate: number,
    installmentsCount: number,
    frequency: LoanFrequency,
    firstDueDate: string,
    chargeLateInterest: boolean,
    lateInterestType?: "percent" | "fixed",
    lateInterestValue?: number,
    notes?: string,
    aiResult?: {
      delayProbability?: number;
      suggestedRate?: number;
      riskAlerts?: string[];
      recommendation?: string;
    }
  ): Loan {
    if (!this.isClient()) throw new Error("Client-side required");
    const allLoans = localStorage.getItem("jurex_loans");
    const loans: Loan[] = allLoans ? JSON.parse(allLoans) : [];

    const loanId = "loan-" + generateId();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const codeLetter1 = letters[Math.floor(Math.random() * 26)];
    const codeLetter2 = letters[Math.floor(Math.random() * 26)];
    const codeDigits = Math.floor(1000 + Math.random() * 9000);
    const contractCode = `#${codeLetter1}${codeLetter2}-${codeDigits}`;

    const newLoan: Loan = {
      id: loanId,
      userId,
      clientId,
      amount,
      interestType,
      interestRate,
      installmentsCount,
      frequency,
      status: "active",
      firstDueDate,
      chargeLateInterest,
      lateInterestType,
      lateInterestValue,
      notes,
      createdAt: new Date().toISOString(),
      code: contractCode,
      delayProbability: aiResult?.delayProbability,
      suggestedRate: aiResult?.suggestedRate,
      riskAlerts: aiResult?.riskAlerts,
      aiRecommendation: aiResult?.recommendation,
    };

    loans.push(newLoan);
    localStorage.setItem("jurex_loans", JSON.stringify(loans));

    // Generate Installments
    const allInst = localStorage.getItem("jurex_installments");
    const installments: PaymentInstallment[] = allInst ? JSON.parse(allInst) : [];

    // Calculate installment value
    let installmentValue = amount / installmentsCount;
    if (interestType === "interest" && interestRate > 0) {
      // Simple monthly interest applied per installment or compound interest. Let's do simple markup for direct clarity
      // e.g. total = amount * (1 + (rate/100) * (installmentsCount)) or simple fixed monthly interest
      const totalInterest = amount * (interestRate / 100);
      installmentValue = (amount + totalInterest) / installmentsCount;
    }

    const firstDateObj = new Date(firstDueDate);

    for (let i = 1; i <= installmentsCount; i++) {
      const dueDate = new Date(firstDateObj);
      if (frequency === "diaria") {
        dueDate.setDate(firstDateObj.getDate() + (i - 1));
      } else if (frequency === "semanal") {
        dueDate.setDate(firstDateObj.getDate() + (i - 1) * 7);
      } else if (frequency === "quinzenal") {
        dueDate.setDate(firstDateObj.getDate() + (i - 1) * 15);
      } else {
        dueDate.setMonth(firstDateObj.getMonth() + (i - 1));
      }

      const inst: PaymentInstallment = {
        id: `inst-${generateId()}`,
        loanId,
        number: i,
        amount: parseFloat(installmentValue.toFixed(2)),
        originalAmount: parseFloat(installmentValue.toFixed(2)),
        dueDate: dueDate.toISOString().split("T")[0],
        status: "pending",
      };
      installments.push(inst);
    }

    localStorage.setItem("jurex_installments", JSON.stringify(installments));

    // Register a local notification for the new loan!
    this.addNotification(
      userId,
      "Novo Contrato Criado",
      `Contrato de R$ ${amount.toFixed(2)} registrado com sucesso para o cliente.`,
      "success"
    );

    return newLoan;
  }

  // Installments Operations
  static getInstallmentsForLoan(loanId: string): PaymentInstallment[] {
    if (!this.isClient()) return [];
    this.initialize();
    this.updateLateInstallments(loanId);
    const all = localStorage.getItem("jurex_installments");
    const insts: PaymentInstallment[] = all ? JSON.parse(all) : [];
    return insts.filter((i) => i.loanId === loanId);
  }

  static payInstallment(installmentId: string, userId: string): void {
    this.payInstallmentWithOptions(installmentId, "parcela", 0, userId);
  }

  static payInstallmentWithOptions(
    installmentId: string,
    type: "parcela" | "juros" | "quitacao",
    customAmount: number,
    userId: string
  ): void {
    if (!this.isClient()) return;
    this.updateLateInstallments();
    const allInst = localStorage.getItem("jurex_installments");
    const insts: PaymentInstallment[] = allInst ? JSON.parse(allInst) : [];

    const allLoans = localStorage.getItem("jurex_loans");
    const loans: Loan[] = allLoans ? JSON.parse(allLoans) : [];

    const index = insts.findIndex((i) => i.id === installmentId);
    if (index === -1) return;

    const currentInst = insts[index];
    const loan = loans.find((l) => l.id === currentInst.loanId);
    if (!loan) return;

    if (type === "parcela") {
      currentInst.status = "paid";
      currentInst.paymentDate = new Date().toISOString().split("T")[0];
      if (customAmount > 0) {
        currentInst.amount = customAmount;
      }
      localStorage.setItem("jurex_installments", JSON.stringify(insts));

      const loanInsts = insts.filter((i) => i.loanId === loan.id);
      const allPaid = loanInsts.every((i) => i.status === "paid");

      if (allPaid) {
        const loanIndex = loans.findIndex((l) => l.id === loan.id);
        if (loanIndex !== -1) {
          loans[loanIndex].status = "paid";
          localStorage.setItem("jurex_loans", JSON.stringify(loans));
        }

        this.addNotification(
          userId,
          "Contrato Quitado!",
          `Todas as parcelas do contrato do cliente foram pagas. Status atualizado para Quitado.`,
          "success"
        );
      } else {
        this.addNotification(
          userId,
          "Parcela Recebida",
          `A parcela #${currentInst.number} foi marcada como paga com sucesso.`,
          "info"
        );
      }
    } else if (type === "juros") {
      currentInst.status = "paid";
      currentInst.paymentDate = new Date().toISOString().split("T")[0];
      currentInst.amount = customAmount;
      localStorage.setItem("jurex_installments", JSON.stringify(insts));

      const principalPortion = loan.amount;

      const newAmount = currentInst.originalAmount || currentInst.amount;

      const baseDueDate = new Date(currentInst.dueDate + "T00:00:00");
      const nextDueDateObj = new Date(baseDueDate);
      if (loan.frequency === "diaria") {
        nextDueDateObj.setDate(baseDueDate.getDate() + 1);
      } else if (loan.frequency === "semanal") {
        nextDueDateObj.setDate(baseDueDate.getDate() + 7);
      } else if (loan.frequency === "quinzenal") {
        nextDueDateObj.setDate(baseDueDate.getDate() + 15);
      } else {
        nextDueDateObj.setMonth(baseDueDate.getMonth() + 1);
      }

      const currentLoanInsts = insts.filter((i) => i.loanId === loan.id);
      const nextNumber = currentLoanInsts.length + 1;

      const loanIndex = loans.findIndex((l) => l.id === loan.id);
      if (loanIndex !== -1) {
        loans[loanIndex].installmentsCount = loan.installmentsCount + 1;
        loans[loanIndex].status = "active";
        localStorage.setItem("jurex_loans", JSON.stringify(loans));
      }

      const newInst: PaymentInstallment = {
        id: `inst-${generateId()}`,
        loanId: loan.id,
        number: nextNumber,
        amount: parseFloat(newAmount.toFixed(2)),
        originalAmount: parseFloat(newAmount.toFixed(2)),
        dueDate: nextDueDateObj.toISOString().split("T")[0],
        status: "pending",
      };

      insts.push(newInst);
      localStorage.setItem("jurex_installments", JSON.stringify(insts));

      this.addNotification(
        userId,
        "Juros Recebidos (Renovação)",
        `Os juros de R$ ${customAmount.toFixed(2)} do contrato ${loan.code || ""} foram pagos. O saldo principal de R$ ${principalPortion.toFixed(2)} foi mantido e renovado para o próximo vencimento em ${newInst.dueDate.split("-").reverse().join("/")}.`,
        "success"
      );
    } else if (type === "quitacao") {
      currentInst.status = "paid";
      currentInst.paymentDate = new Date().toISOString().split("T")[0];
      currentInst.amount = customAmount;

      insts.forEach((inst) => {
        if (inst.loanId === loan.id && inst.status !== "paid") {
          inst.status = "paid";
          inst.paymentDate = new Date().toISOString().split("T")[0];
          inst.amount = 0;
        }
      });
      localStorage.setItem("jurex_installments", JSON.stringify(insts));

      const loanIndex = loans.findIndex((l) => l.id === loan.id);
      if (loanIndex !== -1) {
        loans[loanIndex].status = "paid";
        localStorage.setItem("jurex_loans", JSON.stringify(loans));
      }

      this.addNotification(
        userId,
        "Contrato Quitado (Negociação)",
        `O contrato ${loan.code || ""} foi quitado integralmente por R$ ${customAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
        "success"
      );
    }
  }

  static deleteLoan(loanId: string): void {
    if (!this.isClient()) return;
    const allLoans = localStorage.getItem("jurex_loans");
    const loans: Loan[] = allLoans ? JSON.parse(allLoans) : [];
    const filteredLoans = loans.filter((l) => l.id !== loanId);
    localStorage.setItem("jurex_loans", JSON.stringify(filteredLoans));

    const allInst = localStorage.getItem("jurex_installments");
    const insts: PaymentInstallment[] = allInst ? JSON.parse(allInst) : [];
    const filteredInsts = insts.filter((i) => i.loanId !== loanId);
    localStorage.setItem("jurex_installments", JSON.stringify(filteredInsts));
  }

  static renegotiateLoan(
    loanId: string,
    newRate: number,
    newCount: number,
    userId: string
  ): void {
    if (!this.isClient()) return;
    const allLoans = localStorage.getItem("jurex_loans");
    const loans: Loan[] = allLoans ? JSON.parse(allLoans) : [];
    const loanIndex = loans.findIndex((l) => l.id === loanId);
    if (loanIndex === -1) return;

    const loan = loans[loanIndex];
    loan.interestRate = newRate;
    loan.installmentsCount = newCount;
    loan.status = "active";
    localStorage.setItem("jurex_loans", JSON.stringify(loans));

    const allInst = localStorage.getItem("jurex_installments");
    const insts: PaymentInstallment[] = allInst ? JSON.parse(allInst) : [];
    
    const paidInsts = insts.filter((i) => i.loanId === loanId && i.status === "paid");
    const otherLoanInsts = insts.filter((i) => i.loanId !== loanId || i.status === "paid");
    
    let installmentValue = loan.amount / newCount;
    if (loan.interestType === "interest" && newRate > 0) {
      const totalInterest = loan.amount * (newRate / 100);
      installmentValue = (loan.amount + totalInterest) / newCount;
    }

    const firstDateObj = new Date();
    const newPendingInsts: PaymentInstallment[] = [];
    for (let i = 1; i <= newCount; i++) {
      const dueDate = new Date(firstDateObj);
      if (loan.frequency === "diaria") {
        dueDate.setDate(firstDateObj.getDate() + i);
      } else if (loan.frequency === "semanal") {
        dueDate.setDate(firstDateObj.getDate() + i * 7);
      } else if (loan.frequency === "quinzenal") {
        dueDate.setDate(firstDateObj.getDate() + i * 15);
      } else {
        dueDate.setMonth(firstDateObj.getMonth() + i);
      }

      const inst: PaymentInstallment = {
        id: `inst-${generateId()}`,
        loanId,
        number: paidInsts.length + i,
        amount: parseFloat(installmentValue.toFixed(2)),
        originalAmount: parseFloat(installmentValue.toFixed(2)),
        dueDate: dueDate.toISOString().split("T")[0],
        status: "pending",
      };
      newPendingInsts.push(inst);
    }

    const finalInsts = [...otherLoanInsts, ...newPendingInsts];
    localStorage.setItem("jurex_installments", JSON.stringify(finalInsts));

    this.addNotification(
      userId,
      "Contrato Renegociado",
      `Contrato renegociado com nova taxa de ${newRate}% e parcelamento de ${newCount}x.`,
      "info"
    );
  }

  // Notifications
  static getNotifications(userId: string): Notification[] {
    if (!this.isClient()) return [];
    this.initialize();
    const all = localStorage.getItem("jurex_notifications");
    const notifs: Notification[] = all ? JSON.parse(all) : [];
    return notifs.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static addNotification(userId: string, title: string, message: string, type: "info" | "warning" | "success" | "risk"): Notification {
    if (!this.isClient()) throw new Error("Client side only");
    const all = localStorage.getItem("jurex_notifications");
    const notifs: Notification[] = all ? JSON.parse(all) : [];

    const newNotif: Notification = {
      id: "notif-" + generateId(),
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    notifs.push(newNotif);
    localStorage.setItem("jurex_notifications", JSON.stringify(notifs));
    return newNotif;
  }

  static markAllNotificationsRead(userId: string) {
    if (!this.isClient()) return;
    const all = localStorage.getItem("jurex_notifications");
    const notifs: Notification[] = all ? JSON.parse(all) : [];
    notifs.forEach((n) => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    localStorage.setItem("jurex_notifications", JSON.stringify(notifs));
  }
}
