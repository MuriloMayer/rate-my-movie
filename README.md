# Rate My Movie

Aplicativo móvel de exemplo para gerenciar e avaliar filmes (Rate My Movie).

Este repositório contém uma aplicação React Native com Expo e TypeScript.

## Tecnologias

- Expo (~54)
- React Native
- TypeScript
- React Navigation
- Axios

## Estrutura principal

- `App.tsx` / `index.ts` - entrada do app
- `src/screens/` - telas do app (ex: `MyMoviesScreen.tsx`, `SearchScreen.tsx`, `ProfileScreen.tsx`, `MovieDetailsScreen.tsx`)
- `src/navigation/` - navegadores (TabNavigator, AppNavigator, AuthNavigator)
- `src/components/` - componentes reutilizáveis
- `src/constants/theme.ts` - cores e tema
- `src/context/` - contexts (Auth, Movies)
- `src/services/` - API e armazenamento
- `src/@types/` - definições TypeScript do projeto

## Instalação

Certifique-se de ter Node.js e npm instalados (ou use `nvm`).

1. Instalar dependências:

```bash
npm install
```

2. (Opcional) Se usar Yarn:

```bash
yarn
```

## Scripts úteis

- Iniciar o Metro / Expo:

```bash
npm run start
# ou
expo start
```

- Rodar o TypeScript checker (sem gerar saída):

```bash
npx tsc --noEmit
```

- iOS / Android via Expo:

```bash
npm run ios
npm run android
```

## Notas sobre tipos e problemas comuns

- Se o VS Code mostrar erro "Cannot find module '@expo/vector-icons'" instale o pacote:

```bash
npm install @expo/vector-icons --save
```

- Se o TypeScript reclamar de tipos quando uma expressão condicional retorna `false | { ... }` (por exemplo em arrays de estilo), adapte para usar ternário ou filtrar valores falsy. Exemplo:

```ts
// ruim - pode ser `false | ViewStyle`
style={[styles.base, variant === 'primary' && styles.primary]}

// bom
style={[styles.base, variant === 'primary' ? styles.primary : undefined]}

// ou filtrar
style={[styles.base, ...(variant === 'primary' ? [styles.primary] : [])]}
```

- Se você instalar novas dependências e o TS/Editor continuar com erro, reinicie o servidor TypeScript no VS Code: Command Palette → "TypeScript: Restart TS Server" ou recarregue a janela (Developer: Reload Window).

## Desenvolvimento e estilo

- Utilize as cores definidas em `src/constants/theme.ts` para manter consistência visual.
- Siga os componentes já criados em `src/components/` quando possível para reaproveitamento.

## Executando checks rápidos

1. Instale dependências
2. Rode o typechecker

```bash
npm install
npx tsc --noEmit
```

## Contribuição

- Abra uma issue para descrever o que pretende mudar.
- Crie um branch por feature/bugfix.

## Contato

Autor: Murilo Mayer

---

Se quiser, posso também:
- Implementar a tela `MyMoviesScreen` seguindo o estilo do projeto;
- Corrigir os dois erros TypeScript que apareceram anteriormente e garantir que `npx tsc --noEmit` fique limpo.
