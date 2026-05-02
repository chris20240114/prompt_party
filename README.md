# PromptParty

PromptParty is a full-stack prompt-sharing platform built with a React Native mobile client, a Python backend, and a recommendation engine. This repository collects all branch work from the Open Project Project and documents the app, API, data, and branch-specific features.

## 🎯 Project Overview

PromptParty enables users to explore prompts, connect with friends, and receive personalized recommendations. The platform is split into three core domains:

- **Frontend**: Mobile app built in React Native with navigation, screens, and native iOS integration
- **Backend**: Python server with GraphQL, REST endpoints, database access, and developer documentation
- **Recommendation Engine**: Profile-based recommendation model with synthetic training data for prompt matching

## 🌿 Branch Structure

This repository uses branch separation to isolate major development areas:

- `main` - Stable integration branch for app, server, and engine
- `frontend` - React Native client development, UI screens, app layout, and mobile-specific assets
- `backend` - Python API, GraphQL schema, REST routes, database integration, and docs
- `rec-engine` - Recommendation model, synthetic dataset generation, and ranking logic

## 📁 Repository Structure

```
PromptParty/
├── client/            # React Native mobile application
├── server/            # Python backend, GraphQL/REST APIs, databases
├── environment.yml    # Conda environment definition
├── requirements.txt   # Python dependencies
├── requirements.yml   # Optional package manifest
└── README.md          # Project overview and setup
```

## 🚀 What Each Branch Contains

### `frontend`
- Full React Native app under `client/`
- Screens for Home, Friends, Profile, and Past Prompts
- Custom UI components and theme support
- iOS project files for native build support
- App configuration using Expo and TypeScript

### `backend`
- Python API server under `server/`
- GraphQL schema and GraphQL test coverage
- REST route support for traditional clients
- Graph database utilities and relational DB integration
- Documentation for GraphQL and backend setup
- Authentication and user management helpers

### `rec-engine`
- Profile recommendation service in `server/profile-recommendation/`
- Synthetic dataset for training and validation
- Recommendation logic for user prompt matching
- Experimental work on cross-user engagement modeling

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| Mobile | React Native, Expo, TypeScript |
| Backend | Python, GraphQL, Flask/FastAPI-style routing |
| Database | Graph DB + relational DB support |
| Environment | Conda + pip | 
| Testing | GraphQL tests, backend unit tests |

## ⚙️ Setup

### 1. Create the environment

```bash
conda env create -f environment.yml
conda activate prompt-party
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the backend server

```bash
cd server
python server.py
```

### 4. Run the mobile client

```bash
cd client
npm install
npm start
```

> The mobile app is built with Expo and includes native iOS shell files under `client/ios/`.

## 📌 Key Project Features

- Prompt discovery and browsing via a mobile app interface
- User and friend profiles with social interaction flows
- GraphQL and REST API support for flexible client consumption
- Recommendation engine for personalized prompt suggestions
- Database adapters for graph-based and relational storage
- Branch-based development for clean feature separation

## 📚 Documentation and Support Files

- `client/README.md` - Frontend-specific notes and mobile setup
- `server/README.md` - Backend-specific setup and API details
- `server/database/graph_db/README.md` - Graph DB utilities and tests
- `server/database/relational_db/README.md` - Relational DB integration notes
- `client/TypeScript_API_Tutorial.md` - API design and TypeScript guidance

## 🧩 Why This README Reflects All Branches

This documentation combines the work from every active branch into a single view:
- `frontend` brings the mobile experience and UI navigation
- `backend` delivers the server logic, API endpoints, and docs
- `rec-engine` powers the recommendation and synthetic data components

## 💡 Notes

- Use `main` for the integration branch when combining features.
- Switch to `frontend`, `backend`, or `rec-engine` to continue isolated development in each domain.
- The project is designed to scale with additional client platforms, services, and recommendation improvements.

## 📞 Questions

If you want, I can also help generate a branch-specific README for `frontend`, `backend`, or `rec-engine` individually.