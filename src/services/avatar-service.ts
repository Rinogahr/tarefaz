interface SalvarAvatarInput {
  dataUrl: string;
  fileName: string;
}

interface SalvarAvatarResponse {
  filePath: string;
}

export const salvarAvatar = async ({ dataUrl, fileName }: SalvarAvatarInput): Promise<string> => {
  const response = await fetch('/api/save-avatar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dataUrl,
      fileName,
    }),
  });

  if (!response.ok) {
    throw new Error('Não foi possível salvar a imagem de perfil');
  }

  const payload = (await response.json()) as SalvarAvatarResponse;
  return payload.filePath;
};
