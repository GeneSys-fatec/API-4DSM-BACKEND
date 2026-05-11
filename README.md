# API-4DSM-BACKEND

## ⬇ Guia de Instalação

Este guia oferece instruções detalhadas sobre como baixar, configurar e executar este projeto em sua máquina local.

### Pré-requisitos
- **Node.js**: Ambiente de execução de JavaScript open-source. [Baixe o Node.js](https://nodejs.org/pt-br/download)
- **VSCode**: Editor de código para visualização e edição do projeto. [Baixe o VSCode](https://code.visualstudio.com/download)
- **PostgreSQL**: Banco de dados para armazenar informações necessárias ao sistema. [Baixe o PostgreSQL](https://www.postgresql.org/download/)

---

### Como Executar Localmente

#### Passos para Executar o Backend

**1. Clone o Repositório**

```bash
git clone https://github.com/GeneSys-fatec/API-4DSM-BACKEND.git
```

**2. Configuração e Execução do Backend**
> Atualize a branch:
```bash
git pull origin master 
```


> Configure o `.env` do projeto:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
#DB_PASSWORD=[senhadb]
#DB_DATABASE=[db_utilizado]
#JWT_TOKEN=[secret_key] (32 caracteres)
```


> Instale as dependências do backend:
```bash
npm install
```


> Inicie o backend com o comando:
```bash
npm run dev
```
---
