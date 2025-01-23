# appAutho

appAutho é uma aplicação construída com Node.js e Express para gerenciamento de autenticação de usuários. O projeto utiliza tecnologias modernas e práticas de segurança para criar uma solução robusta e escalável.

## 🚀 Tecnologias Utilizadas

- **Node.js e Express**: Base do servidor backend.
- **JOSE**: Para manipulação de tokens JWT.
- **express-session**: Gerenciamento de sessões no servidor.
- **cookie-parser**: Manipulação de cookies.
- **session-file-store**: Armazenamento de sessões no sistema de arquivos.
- **bcrypt**: Hash de senhas para maior segurança.
- **Prisma**: ORM para comunicação com o banco de dados.
- **MongoDB Atlas**: Banco de dados em nuvem.
- **Zod**: Validação de dados.

## 📝 Endpoints

Endpoints Concluídos

- [x] Signup (POST /signup)
      Criação de uma nova conta de usuário.

- [x] Login (POST /login)
      Autenticação do usuário e criação de sessão.

- [x] Logout (POST /logout)
      Finaliza a sessão do usuário autenticado.

- [x] Alterar Senha (PATCH /change-password)
      Permite ao usuário alterar sua senha atual.

- [x] Buscar Dados do Usuário (GET /me)
      Retorna os dados do usuário autenticado, exceto a senha.

- [x] Deletar Conta (DELETE /delete-account)
      Exclusão definitiva da conta do usuário.

- [x] Atualizar Perfil (PUT /update-profile)
      Permitir que o usuário atualize suas informações.

## Endpoints Planejados

- [ ] Esqueci a Senha (POST /forgot-password)
      Processo para recuperação de senha.

## ⚙️ Configuração e Execução

### Pré-requisitos

- Node.js instalado (versão mínima recomendada: 16.x)
- MongoDB Atlas configurado
- Prisma CLI instalado globalmente
- Passos para Configuração
- Clone este repositório:

**(Ainda em desenvolviment)**
