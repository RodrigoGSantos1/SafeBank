# Environment Variables Setup

## Firebase Configuration

Para proteger suas chaves de API do Firebase, você deve configurar as variáveis de ambiente.

### 1. Criar arquivo `.env`

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAKFOO3NnhjgXC1kf1SZEbaKDk1rW1eFwU
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=safebank-189eb.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=safebank-189eb
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=safebank-189eb.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=480796150374
EXPO_PUBLIC_FIREBASE_APP_ID=1:480796150374:web:1f77e4513efaff5109fba7
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-G7CWNYBNQG

# Expo Configuration
EXPO_PROJECT_ID=safebank-189eb
```

### 2. Segurança

- ✅ O arquivo `.env` está no `.gitignore` e não será commitado
- ✅ Use `EXPO_PUBLIC_` prefix para variáveis que precisam estar disponíveis no cliente
- ✅ Nunca commite chaves de API reais no repositório

### 3. Para produção

Para produção, configure as variáveis de ambiente no seu serviço de hospedagem (Vercel, Netlify, etc.) ou use o Expo EAS:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your_api_key"
```

### 4. Verificação

O arquivo `src/services/firebase/config.ts` agora usa as variáveis de ambiente:

```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... outras configurações
};
```

### ⚠️ Importante

- Nunca commite o arquivo `.env` com valores reais
- Mantenha as chaves de API seguras
- Use diferentes projetos Firebase para desenvolvimento e produção 