# Multi-Tape Turing Machine Simulator

An interactive, web-based Multi-Tape Turing Machine simulator built for the **Theory of Automata & Formal Languages** course. Features smooth tape animations, a real-time state diagram, and 7 built-in preset machines.

> **Made by Bhardwaj**

---

## 🎯 What Is This?

A [Turing Machine](https://en.wikipedia.org/wiki/Turing_machine) is a mathematical model of computation that defines an abstract machine operating on a strip of tape. A **Multi-Tape Turing Machine** extends this concept with multiple tapes, each with its own independent read/write head — while remaining computationally equivalent to a single-tape machine, it can solve problems in fewer steps.

This simulator lets you:
- **Visualize** how multi-tape Turing machines process input step-by-step
- **Build** custom machines by defining states and transition rules
- **Run** 7 built-in preset machines covering classic automata theory problems
- **Watch** the state diagram highlight transitions in real-time as the machine executes

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Multi-Tape Support** | 1, 2, or 3 tapes with independent heads |
| **Smooth Tape Animation** | GPU-accelerated sliding tape with head tracking |
| **Live State Diagram** | D3.js-powered graph with real-time transition highlighting |
| **7 Preset Machines** | Classic automata problems with pre-loaded inputs |
| **Custom Machine Builder** | Define your own states, transitions, and tape inputs |
| **Keyboard Shortcuts** | `Space` = Play/Pause, `→` = Step, `R` = Reset |
| **Adjustable Speed** | 10 speed levels from 40ms to 800ms per step |
| **Dark Theme UI** | Premium dark interface with cyan/purple accents |

---

## 🧮 Built-in Preset Machines

### 1. String Copy (ww)
Copies the contents of Tape 1 to Tape 2.
- **Tapes:** 2
- **Example:** Input `1011` → T2 = `1011`
- **Complexity:** O(n)

### 2. Palindrome Checker
Determines whether a binary string is a palindrome.
- **Tapes:** 2
- **Example:** `10101` → Accept ✓ | `1010` → Reject ✗
- **Algorithm:** Copies T1 → T2, then compares T1 forward vs T2 backward

### 3. Binary Adder
Adds two binary numbers stored on separate tapes.
- **Tapes:** 2
- **Example:** `101` (5) + `011` (3) = `1000` (8)
- **Algorithm:** Right-to-left addition with carry propagation

### 4. aⁿbⁿ Checker
Accepts strings of the form aⁿbⁿ (equal a's followed by equal b's).
- **Tapes:** 2
- **Example:** `aaabbb` → Accept ✓ | `aabbb` → Reject ✗
- **Algorithm:** Tallies a's on T2, erases one tally per b

### 5. aⁿbⁿcⁿ Checker
Accepts strings of the form aⁿbⁿcⁿ — a context-sensitive language.
- **Tapes:** 3
- **Example:** `aabbcc` → Accept ✓ | `aabbc` → Reject ✗
- **Algorithm:** T2 = a-tally, T3 = b-tally, c's erase T3

### 6. Bit Inverter
Reads a binary string and writes its bitwise complement.
- **Tapes:** 2
- **Example:** `10110` → T2 = `01001`
- **Complexity:** O(n)

### 7. Binary → Unary Converter
Converts a binary number to unary (tally mark) representation.
- **Tapes:** 2
- **Example:** `101` (5) → T2 = `|||||` (5 tallies)
- **Algorithm:** Repeatedly subtracts 1 from T1 and writes a tally on T2

---

## 🏗️ Project Structure

```
Multi-Tape Turing Machine/
├── index.html      # Main HTML — app shell, views, modal
├── style.css       # Complete dark theme design system
├── script.js       # Turing machine engine + UI logic
└── README.md       # This file
```

### Architecture

```
┌─────────────────────────────────────────────────┐
│                   index.html                     │
│  ┌─────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Setup   │  │  Transition  │  │   State    │ │
│  │  Panel   │  │    Editor    │  │  Diagram   │ │
│  └─────────┘  └──────────────┘  └────────────┘ │
│  ┌──────────────────────────────────────────────┤
│  │           Simulate View                      │
│  │  ┌──────────────┐  ┌───────────────────────┐│
│  │  │  Tape Area   │  │  Machine Monitor +    ││
│  │  │  (animated)  │  │  State Diagram        ││
│  │  └──────────────┘  └───────────────────────┘│
│  └──────────────────────────────────────────────┤
├─────────────────────────────────────────────────┤
│                   script.js                      │
│  ┌─────────────────────────────────────────────┐│
│  │  MultiTapeTuringMachine (Engine)            ││
│  │  - step(), reset(), read(), write()         ││
│  │  - Transition lookup via state + read key   ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │  UI Layer                                    ││
│  │  - Buffered tape rendering (±45 cells)      ││
│  │  - D3.js state diagram with BFS layout      ││
│  │  - Modal for add/edit transition rules      ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

---

## 🚀 How to Use

### Quick Start
1. Open `index.html` in any modern browser (Chrome, Firefox, Edge)
2. Select a preset machine from the left panel
3. Click **▶ Launch Simulation** to switch to the Simulate view
4. Use the controls:
   - **▶ Play** — Run the machine automatically
   - **⏭ Step** — Execute one transition at a time
   - **⟳ Reset** — Reset the machine to initial state
   - **Speed slider** — Adjust execution speed

### Building a Custom Machine
1. Select **Custom Machine** from the presets
2. Set the number of tapes (1–3)
3. Enter initial tape contents in the input fields
4. Click **+ Add Rule** to define transition rules:
   - **Current State** → **Next State**
   - **Read Symbols** (one per tape) → **Write Symbols** (one per tape)
   - **Head Movements** (R = Right, L = Left, S = Stay)
5. Launch the simulation to test

---

## ⚙️ Formal Definition

A Multi-Tape Turing Machine is formally defined as a 7-tuple:

**M = (Q, Σ, Γ, δ, q₀, q_accept, q_reject)**

| Symbol | Meaning |
|--------|---------|
| **Q** | Finite set of states |
| **Σ** | Input alphabet (symbols on the tape, excluding blank) |
| **Γ** | Tape alphabet (Σ ∪ {\_}, where \_ is the blank symbol) |
| **δ** | Transition function: Q × Γᵏ → Q × Γᵏ × {L, R, S}ᵏ |
| **q₀** | Start state |
| **q_accept** | Accept state (machine halts and accepts) |
| **q_reject** | Reject state (machine halts and rejects) |

Where **k** is the number of tapes.

### Transition Function

Each transition rule maps:
```
(current_state, read₁, read₂, ..., readₖ) →
  (next_state, write₁, write₂, ..., writeₖ, move₁, move₂, ..., moveₖ)
```

The machine halts when it enters `q_accept` or `q_reject`, or when no matching transition rule exists for the current state and read symbols (implicit reject).

---

## 🛠️ Technology Stack

- **HTML5** — Semantic markup with accessible structure
- **CSS3** — Custom dark theme with CSS custom properties, animations, glassmorphism
- **Vanilla JavaScript** — No frameworks; ES6+ classes and modules
- **D3.js v7** — State diagram rendering with SVG
- **Google Fonts** — Inter (UI) + JetBrains Mono (code/symbols)

### No Build Step Required
This is a pure static site — just open `index.html` in a browser. No Node.js, no bundler, no compilation needed.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `→` (Arrow Right) | Step forward |
| `R` | Reset machine |
| `Escape` | Close modal |

---

## 📋 Course Information

**Subject:** Theory of Automata & Formal Languages  
**Topic:** Multi-Tape Turing Machines  
**Key Concepts Demonstrated:**
- Deterministic Turing Machine computation model
- Multi-tape extensions and their O(n) advantages
- Context-free language recognition (aⁿbⁿ)
- Context-sensitive language recognition (aⁿbⁿcⁿ)
- Binary arithmetic on Turing machines
- Church-Turing thesis — computational universality

---

## 📄 License

This project is created for educational purposes.
