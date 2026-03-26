const authStorageKey = 'auth-user';

interface SalvarSessaoInput {
  login: string;
}

export interface AuthSessionView {
  salvarSessaoAutenticada: (input: SalvarSessaoInput) => void;
  limparSessaoAutenticada: () => void;
  possuiSessaoAutenticada: () => boolean;
}

export const criarAuthSessionView = (): AuthSessionView => ({
  salvarSessaoAutenticada: ({ login }: SalvarSessaoInput): void => {
    localStorage.setItem(authStorageKey, login);
  },
  limparSessaoAutenticada: (): void => {
    localStorage.removeItem(authStorageKey);
  },
  possuiSessaoAutenticada: (): boolean => Boolean(localStorage.getItem(authStorageKey)),
});
