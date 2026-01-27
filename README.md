
# 🛠️ Biel's Service Center (Helpdesk System)

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![AI Built](https://img.shields.io/badge/Built%20by-AI%20Agent-blueviolet?style=for-the-badge&logo=google-bard)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

## 🌟 Sobre o Projeto

O **Biel's Service Center** é uma solução moderna e eficiente de Helpdesk, projetada para facilitar o gerenciamento de chamados e suporte técnico. Este sistema oferece uma interface intuitiva para clientes abrirem tickets e para administradores gerenciarem o fluxo de trabalho de atendimento.

> [!IMPORTANT]
> Este projeto foi **inteiramente arquitetado e desenvolvido por uma Inteligência Artificial (Antigravity Agent)**, demonstrando as capacidades avançadas de agentes autônomos na construção de software complexo.

---

## 🚀 Tecnologias Utilizadas

Este projeto utiliza uma stack moderna e robusta, garantindo performance e escalabilidade.

### Backend (API)
O backend foi construído com **Laravel**, um dos frameworks PHP mais poderosos do mercado.

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)

- **Framework**: Laravel 10+
- **Database**: MySQL
- **Autenticação**: Sanctum

### Frontend (App)
O frontend é uma SPA (Single Page Application) rápida e responsiva, desenvolvida com **React** e **Vite**.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B33030?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

- **Framework**: React 18
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Linguagem**: TypeScript

### Infraestrutura
Configuração pronta para deploy com **Nginx** e **Linux**.

![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)

---

## 🏗️ Arquitetura do Sistema

O sistema é dividido em dois grandes módulos:

1.  **`api/` (Backend)**:
    - Responsável pela regra de negócios, autenticação, e comunicação com o banco de dados.
    - Exposição de endpoints RESTful para o consumo do frontend.
    - Gerenciamento de filas e tarefas agendadas (se aplicável).

2.  **`app/` (Frontend)**:
    - Interface do usuário moderna e responsiva.
    - Comunicação assíncrona com a API.
    - Interface de administração completa com dashboards e relatórios.

---

## 📦 Como Executar

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- [PHP](https://www.php.net/) >= 8.1
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) & NPM
- [MySQL](https://www.mysql.com/)

### Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/seu-usuario/helpdesk-sistema.git
    cd helpdesk-sistema
    ```

2.  **Configuração do Backend**
    ```bash
    cd api
    cp .env.example .env
    composer install
    php artisan key:generate
    php artisan migrate
    php artisan serve
    ```

3.  **Configuração do Frontend**
    ```bash
    cd ../app
    cp .env.example .env
    npm install
    npm run dev
    ```

4.  **Acesse o sistema**
    - Frontend: `http://localhost:5173`
    - Backend API: `http://localhost:8000`

---

## 🤖 Créditos de Desenvolvimento

Este projeto é um exemplo prático da colaboração entre humanos e IA.

- **Desenvolvedor Principal**: Antigravity (Google DeepMind Agent)
- **Co-Piloto Humano**: @biel

---

<p align="center">
  Feito com 💙 e muita ☕ por Gabriel & Antigravity
</p>
