![ieeecs-template-header](https://github.com/user-attachments/assets/c3c40c85-51a2-4a5e-82a4-c32a0223e336)

<h1 align="center">Deep Learning Platform</h1>

<h4 align="center">A visual, drag and drop platform for learning how ML and deep learning models are built and trained.</h4>

---

## Overview

Learning machine learning usually means reading code and staring at loss curves without ever seeing how the pieces of a pipeline actually connect. This project is a visual learning platform: users drag and drop nodes onto a canvas — dataset, preprocessing, train test split, neural network, model — wire them together, and run the resulting pipeline to see how a real ML/DL model gets built and trained, step by step.

- The problem being addressed: ML/DL concepts are hard to learn when the pipeline is hidden behind code; there's no visual, hands on way to see how data flows from raw dataset to a trained model.
- Why it is relevant: a drag and drop, node based builder turns an abstract pipeline into something a learner can see, rearrange, and experiment with.
- What this project aims to achieve: let users visually construct an ML/DL pipeline (dataset → split → preprocess → model → train) on a canvas, execute it on remote infrastructure, and learn how each stage affects the outcome.

---

## Features

- **Visual pipeline builder** — drag and drop canvas (dataset, preprocessing, train-test split, neural network, model nodes) for assembling ML/DL pipelines without hand writing training code.
- **Code generation** — every pipeline is translated into the equivalent Python code (imports, data loading, preprocessing, model definition, training loop, metrics) so learners can see exactly what their visual pipeline produces.
- **Run comparison** — save pipeline runs and compare metrics and loss curves across them side by side.
- **Result visualizations** — confusion matrices, class distribution, actual vs predicted, residual plots, and prediction distribution charts generated automatically from a run's output.
- **Pipeline history** — save and reload previously built pipelines.

---

## Architecture Overview

The system is split into three services:

- **Frontend** — a Next.js canvas (built with `@xyflow/react`/`reactflow`) where users assemble pipeline nodes (dataset, preprocessing, train test split, neural network, model) and configure each one.
- **Backend** — a FastAPI service that validates the submitted pipeline graph, resolves node execution order, runs the pipeline executor, and exposes the available node types to the frontend.
- **Modal Service** — Modal functions (`train_mlp`, `train_cnn`, `load_mnist`, `load_fashion_mnist`, `load_cifar10`, `split_and_train_mlp`, `split_and_train_cnn`) that perform the actual dataset loading and model training remotely on Modal's infrastructure.

**Data flow:** the frontend sends the pipeline graph (nodes + edges) to the backend's `/run_pipeline` endpoint → the backend executor walks the graph and, for training/dataset nodes, calls out to the Modal service → Modal loads the dataset and/or trains the model (MLP or CNN) → results are returned back through the backend to the frontend for display.

External integrations: Modal (remote compute for dataset loading and training).

---

## Tech Stack

| Layer       | Technology Used |
|-------------|-----------------|
| Frontend    | Next.js, React, TypeScript, Tailwind CSS, React Flow, Zustand |
| Backend     | FastAPI, Pydantic, uv |
| DevOps      | Modal (remote training/compute) |
| Other Tools | scikit-learn, PyTorch, torchvision, NumPy |

---

## Project Structure

```bash
deeplearning-platform/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint
│   │   ├── routes/               # API routes (/run_pipeline, /nodes)
│   │   ├── pipeline/              # Executor, validator, schemas, node registry
│   │   │   ├── nodes/              # dataset, preprocess, train_test_split, neural_network, model nodes
│   │   │   ├── generators/
│   │   │   ├── models/
│   │   │   └── registry/
│   │   └── services/
│   │       └── modal_service.py   # Calls into Modal functions
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/            # Canvas, ConfigPanel, Sidebar, HistoryPanel, node components, output views
│       ├── lib/                   # API client, config schema, dataset groups, error handling
│       └── store/                 # Zustand stores (pipeline, output, toast)
├── modal_service/
│   ├── train.py                   # Modal app + functions (train_mlp, train_cnn, load_mnist, etc.)
│   ├── trainers/                  # mlp_trainer, cnn_trainer
│   └── models/                    # mlp, cnn model definitions
└── scratch/                       # Ad hoc test/scratch scripts
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/IEEECS-VIT/deep-learning-platform
cd deep-learning-platform
```

### 2. Install Dependencies

Backend:

```bash
cd backend
uv sync
```

Frontend:

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

The frontend reads `NEXT_PUBLIC_API_BASE_URL` to know where the backend lives (defaults to `http://127.0.0.1:8000` if not set).

The Modal service requires a Modal account/token to be configured (`modal token new` / `modal setup`) before functions can be deployed or invoked.

### 4. Run the Project

Backend:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

Modal service (deploy the training/dataset functions):

```bash
cd modal_service
modal deploy train.py
```

---

## Git Hooks Setup

This repository uses custom Git hooks to enforce commit standards and branch discipline.

After cloning the repository, run the following command once:

```bash
make setup
```

This enables:
- Commit message validation
- Blocking direct pushes to `main`

---

## Environment Variables

| Variable Name | Description |
|--------------|------------|
| NEXT_PUBLIC_API_BASE_URL | Base URL of the FastAPI backend used by the frontend's `/api` proxy (defaults to `http://127.0.0.1:8000`) |

---

## Testing

Backend tests (pytest):

```bash
cd backend
uv run pytest
```

---

## Project Status

- 🟢 In Development
