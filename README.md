# ⚛️ Rectify

Rectify is a lightweight React-inspired UI library that implements a **Fiber architecture**, **function components**, **hooks**, and a **reconciliation + commit pipeline** from scratch.

The goal of Rectify is educational and experimental — to understand how modern UI runtimes like React work internally while providing a usable rendering engine.

---

## ✨ Features

- 🧠 Fiber architecture (work units, alternate tree, flags)
- 🔁 Reconciliation with keyed diffing
- ⚙️ Render → Commit pipeline
- 🪝 Hooks system
  - `useState`
  - `useEffect`
  - custom hook support
- 🌲 Function components
- 🧱 Host components & text nodes
- 🎯 Placement / Update / Deletion flags
- 🧹 Effect cleanup on unmount
- 🧵 Batched updates via microtask scheduling

---

## 📦 Installation

```bash
npm install rectify
```
or
```bash
yarn add rectify
```

## 🚀 Quick Example

```typescript
import { createRoot, jsx, useState } from "rectify";

const Counter = () => {
  const [count, setCount] = useState(0);

  return jsx("div", {
    children: [
      jsx("h1", { children: ["Count: ", count] }),
      jsx("button", {
        onClick: () => setCount((c) => c + 1),
        children: "Increment",
      }),
    ],
  });
};

const root = createRoot(document.getElementById("app"));
root.render(jsx(Counter));
```

## 🧩 Architecture Overview
Rectify follows a simplified React model:

```
Update scheduled
      ↓
Render phase (DFS Fiber work loop)
      ↓
Reconciliation (diff children)
      ↓
Commit phase (DOM mutations)
      ↓
Flush passive effects
```

## 🪝 Hooks
Hooks are stored on the fiber and processed during render.

### useState

```typescript
const [value, setValue] = useState(initial);
```
- Queue based updates
- Supports functional updates
- Triggers scheduling

### useEffect

```typescript
useEffect(() => {
  // effect
  return () => cleanup();
}, []);
```

- Runs after commit
- Cleanup runs on deletion or dependency change

---
Thanks
