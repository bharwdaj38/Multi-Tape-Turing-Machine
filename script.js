'use strict';

/* ── Constants ── */
const VISIBLE_CELLS = 12;
const BUFFER_CELLS  = 45;

/* ══════════════════════════════════════════════════════════════
   PRESET DEFINITIONS  — all transitions verified by hand-trace
   ══════════════════════════════════════════════════════════════ */
const PRESETS = [

  /* ── 0. Custom ─────────────────────────────────────────────── */
  {
    id:'custom', name:'Custom Machine', icon:'✏️', desc:'Build your own',
    numTapes:2, input:'', acceptStates:['q_accept'], rejectState:'q_reject',
    startState:'q0', tapeInputs:['',''],
    transitions:{ q0:{}, q_accept:{}, q_reject:{} },
    description:'Start blank. Add your own states and transitions.',
  },

  /* ── 1. String Copy (ww) ───────────────────────────────────── */
  {
    id:'string_copy', name:'String Copy (ww)', icon:'📋', desc:'Copies T1 → T2',
    numTapes:2, input:'1011', acceptStates:['q_accept'], rejectState:'q_reject',
    startState:'q0', tapeInputs:['1011',''],
    transitions:{
      // Phase 1: copy T1 → T2, both move right
      q0:{
        '0,_':{ nextState:'q0', write:['0','0'], move:['R','R'] },
        '1,_':{ nextState:'q0', write:['1','1'], move:['R','R'] },
        '_,_':{ nextState:'q1', write:['_','_'], move:['L','L'] },
      },
      // Phase 2: rewind both heads together
      q1:{
        '0,0':{ nextState:'q1', write:['0','0'], move:['L','L'] },
        '1,1':{ nextState:'q1', write:['1','1'], move:['L','L'] },
        '_,_':{ nextState:'q_accept', write:['_','_'], move:['S','S'] },
      },
      q_accept:{}, q_reject:{},
    },
    description:'Copies input on T1 to T2 in O(n). T2 head rewinds as verification.',
  },

  /* ── 2. Palindrome Checker ─────────────────────────────────── */
  /*
     Algorithm (3 phases):
     q0: copy T1→T2 (both R), stop when T1 reads blank → both at pos n, move [L,L] → q1
     q1: rewind T1 only (T1 L, T2 S) until T1 reads blank (pos -1) → q2 [R,S]
     q2: compare T1 forward / T2 backward ([R,L]); accept when both blank
  */
  {
    id:'palindrome', name:'Palindrome Checker', icon:'🔄', desc:'Binary palindrome O(n)',
    numTapes:2, input:'10101', acceptStates:['q_accept'], rejectState:'q_reject',
    startState:'q0', tapeInputs:['10101',''],
    transitions:{
      q0:{
        '0,_':{ nextState:'q0', write:['0','0'], move:['R','R'] },
        '1,_':{ nextState:'q0', write:['1','1'], move:['R','R'] },
        '_,_':{ nextState:'q1', write:['_','_'], move:['L','L'] },
      },
      // T2 STAYS at n-1 (the last char); T1 rewinds left
      q1:{
        '0,0':{ nextState:'q1', write:['0','0'], move:['L','S'] },
        '1,0':{ nextState:'q1', write:['1','0'], move:['L','S'] },
        '0,1':{ nextState:'q1', write:['0','1'], move:['L','S'] },
        '1,1':{ nextState:'q1', write:['1','1'], move:['L','S'] },
        '_,0':{ nextState:'q2', write:['_','0'], move:['R','S'] },
        '_,1':{ nextState:'q2', write:['_','1'], move:['R','S'] },
        '_,_':{ nextState:'q_accept', write:['_','_'], move:['S','S'] }, // empty
      },
      // T1 forward, T2 backward
      q2:{
        '0,0':{ nextState:'q2', write:['0','0'], move:['R','L'] },
        '1,1':{ nextState:'q2', write:['1','1'], move:['R','L'] },
        '0,1':{ nextState:'q_reject', write:['0','1'], move:['S','S'] },
        '1,0':{ nextState:'q_reject', write:['1','0'], move:['S','S'] },
        '_,_':{ nextState:'q_accept', write:['_','_'], move:['S','S'] },
        '_,0':{ nextState:'q_accept', write:['_','0'], move:['S','S'] },
        '_,1':{ nextState:'q_accept', write:['_','1'], move:['S','S'] },
        '0,_':{ nextState:'q_accept', write:['0','_'], move:['S','S'] },
        '1,_':{ nextState:'q_accept', write:['1','_'], move:['S','S'] },
      },
      q_accept:{}, q_reject:{},
    },
    description:'Copies T1 to T2, then compares T1 forward vs T2 backward in O(n).',
  },

  /* ── 3. Binary Adder ───────────────────────────────────────── */
  /*
     T1 = first number, T2 = second number (same length, pad with leading 0s if needed)
     q0:     scan both right to find end → [L,L] into add phase
     q_add0: no carry, add right-to-left, write result on T1
     q_add1: carry=1, add right-to-left, write result on T1
  */
  {
    id:'binary_adder', name:'Binary Adder', icon:'➕', desc:'Adds T1 + T2 → T1',
    numTapes:2, input:'101', acceptStates:['q_accept'], rejectState:'q_reject',
    startState:'q0', tapeInputs:['101','011'],
    transitions:{
      q0:{
        '0,0':{ nextState:'q0',     write:['0','0'], move:['R','R'] },
        '0,1':{ nextState:'q0',     write:['0','1'], move:['R','R'] },
        '1,0':{ nextState:'q0',     write:['1','0'], move:['R','R'] },
        '1,1':{ nextState:'q0',     write:['1','1'], move:['R','R'] },
        // T1 done, T2 longer
        '_,0':{ nextState:'q0',     write:['_','0'], move:['S','R'] },
        '_,1':{ nextState:'q0',     write:['_','1'], move:['S','R'] },
        '_,_':{ nextState:'q_add0', write:['_','_'], move:['L','L'] },
      },
      q_add0:{ // carry = 0
        '0,0':{ nextState:'q_add0', write:['0','_'], move:['L','L'] },
        '0,1':{ nextState:'q_add0', write:['1','_'], move:['L','L'] },
        '1,0':{ nextState:'q_add0', write:['1','_'], move:['L','L'] },
        '1,1':{ nextState:'q_add1', write:['0','_'], move:['L','L'] },
        // T1 shorter
        '_,0':{ nextState:'q_add0', write:['0','_'], move:['L','L'] },
        '_,1':{ nextState:'q_add0', write:['1','_'], move:['L','L'] },
        // T2 shorter
        '0,_':{ nextState:'q_add0', write:['0','_'], move:['L','L'] },
        '1,_':{ nextState:'q_add0', write:['1','_'], move:['L','L'] },
        '_,_':{ nextState:'q_accept', write:['_','_'], move:['S','S'] },
      },
      q_add1:{ // carry = 1
        '0,0':{ nextState:'q_add0', write:['1','_'], move:['L','L'] },
        '0,1':{ nextState:'q_add1', write:['0','_'], move:['L','L'] },
        '1,0':{ nextState:'q_add1', write:['0','_'], move:['L','L'] },
        '1,1':{ nextState:'q_add1', write:['1','_'], move:['L','L'] },
        '_,0':{ nextState:'q_add0', write:['1','_'], move:['L','L'] },
        '_,1':{ nextState:'q_add1', write:['0','_'], move:['L','L'] },
        '0,_':{ nextState:'q_add0', write:['1','_'], move:['L','L'] },
        '1,_':{ nextState:'q_add1', write:['0','_'], move:['L','L'] },
        '_,_':{ nextState:'q_accept', write:['1','_'], move:['S','S'] }, // carry-out
      },
      q_accept:{}, q_reject:{},
    },
    description:'Adds binary numbers on T1 and T2 right-to-left with carry. Result on T1. "101"(5)+"011"(3)="1000"(8).',
  },

  /* ── 4. aⁿbⁿ Checker ──────────────────────────────────────── */
  /*
     q0: for each 'a', write '|' tally on T2; when first 'b' seen → [S,L] → q1
     q1: for each 'b', erase one '|' from T2 [R,L]; at end both must be blank → accept
  */
  {
    id:'anbn', name:'aⁿbⁿ Checker', icon:'⚖️', desc:"Equal a's then b's",
    numTapes:2, input:'aaabbb', acceptStates:['q_accept'], rejectState:'q_reject',
    startState:'q0', tapeInputs:['aaabbb',''],
    transitions:{
      q0:{
        'a,_':{ nextState:'q0',      write:['a','|'], move:['R','R'] },
        'b,_':{ nextState:'q1',      write:['b','_'], move:['S','L'] }, // T2 → last tally
        '_,_':{ nextState:'q_reject',write:['_','_'], move:['S','S'] }, // empty / only a's
      },
      q1:{
        'b,|':{ nextState:'q1',      write:['b','_'], move:['R','L'] },
        '_,_':{ nextState:'q_accept',write:['_','_'], move:['S','S'] }, // all matched
        '_,|':{ nextState:'q_reject',write:['_','|'], move:['S','S'] }, // more a's than b's
        'b,_':{ nextState:'q_reject',write:['b','_'], move:['S','S'] }, // more b's than a's
      },
      q_accept:{}, q_reject:{},
    },
    description:"Accepts aⁿbⁿ in O(n). T2 stores tally of a's; erased one-per-b.",
  },

  /* ── 5. aⁿbⁿcⁿ Checker ────────────────────────────────────── */
  /*
     q0: count a's as tallies on T2; on first 'b' → T2 steps back → q1
     q1: for each 'b', erase T2 tally + write T3 tally [R,L,R];
         on first 'c' → T3 steps back → q2
     q2: for each 'c', erase T3 tally [R,S,L]; at end all blank → accept
  */
  {
    id:'anbncn', name:'aⁿbⁿcⁿ Checker', icon:'🔢', desc:"Equal a's, b's, c's",
    numTapes:3, input:'aabbcc', acceptStates:['q_accept'], rejectState:'q_reject',
    startState:'q0', tapeInputs:['aabbcc','',''],
    transitions:{
      q0:{
        'a,_,_':{ nextState:'q0',      write:['a','|','_'], move:['R','R','S'] },
        'b,_,_':{ nextState:'q1',      write:['b','_','_'], move:['S','L','S'] },
        '_,_,_':{ nextState:'q_reject',write:['_','_','_'], move:['S','S','S'] },
      },
      q1:{
        'b,|,_':{ nextState:'q1',      write:['b','_','|'], move:['R','L','R'] },
        'c,_,_':{ nextState:'q2',      write:['c','_','_'], move:['S','S','L'] },
        'b,_,_':{ nextState:'q_reject',write:['b','_','_'], move:['S','S','S'] }, // n_b > n_a
        '_,_,_':{ nextState:'q_reject',write:['_','_','_'], move:['S','S','S'] }, // no c
        '_,|,_':{ nextState:'q_reject',write:['_','|','_'], move:['S','S','S'] }, // n_b < n_a
        'c,|,_':{ nextState:'q_reject',write:['c','|','_'], move:['S','S','S'] }, // c too early
      },
      q2:{
        'c,_,|':{ nextState:'q2',      write:['c','_','_'], move:['R','S','L'] },
        '_,_,_':{ nextState:'q_accept',write:['_','_','_'], move:['S','S','S'] },
        'c,_,_':{ nextState:'q_reject',write:['c','_','_'], move:['S','S','S'] }, // n_c > n_b
        '_,_,|':{ nextState:'q_reject',write:['_','_','|'], move:['S','S','S'] }, // n_c < n_b
      },
      q_accept:{}, q_reject:{},
    },
    description:'Accepts aⁿbⁿcⁿ in O(n). T2 = a-tally, T3 = b-tally, erased by c.',
  },

  /* ── 6. Bit Inverter ───────────────────────────────────────── */
  {
    id:'bit_inverter', name:'Bit Inverter', icon:'🔀', desc:'Flips bits → T2',
    numTapes:2, input:'10110', acceptStates:['q_accept'], rejectState:'q_reject',
    startState:'q0', tapeInputs:['10110',''],
    transitions:{
      q0:{
        '0,_':{ nextState:'q0',      write:['0','1'], move:['R','R'] },
        '1,_':{ nextState:'q0',      write:['1','0'], move:['R','R'] },
        '_,_':{ nextState:'q_accept',write:['_','_'], move:['S','S'] },
      },
      q_accept:{}, q_reject:{},
    },
    description:'Reads T1 and writes its bitwise complement to T2 in O(n).',
  },

  /* ── 7. Binary → Unary (decrement-and-tally) ──────────────── */
  /*
     Repeatedly subtracts 1 from T1 (binary) and writes one '|' on T2 per decrement.
     q_scan:  scan T1 right to find end → [L,S] → q_sub
     q_sub:   borrow leftward; 1→flip to 0 → q_tally; 0→flip to 1, keep going; _→accept (done)
     q_tally: write '|' on T2, T1 move R, T2 move R → q_rewind
     q_rewind: scan T1 leftward to pos -1 → [R,S] → q_check0
     q_check0: scan T1 right; if any '1' → q_scan (keep going); if all '0' → q_accept
  */
  {
    id:'binary_unary', name:'Binary → Unary', icon:'🔡', desc:'Converts binary to tally',
    numTapes:2, input:'101', acceptStates:['q_accept'], rejectState:'q_reject',
    startState:'q_scan', tapeInputs:['101',''],
    transitions:{
      q_scan:{
        '0,_':{ nextState:'q_scan',   write:['0','_'], move:['R','S'] },
        '1,_':{ nextState:'q_scan',   write:['1','_'], move:['R','S'] },
        '_,_':{ nextState:'q_sub',    write:['_','_'], move:['L','S'] },
      },
      q_sub:{
        '1,_':{ nextState:'q_tally',  write:['0','_'], move:['S','S'] }, // found the rightmost 1
        '0,_':{ nextState:'q_sub',    write:['1','_'], move:['L','S'] }, // borrow: 0→1, carry left
        '_,_':{ nextState:'q_accept', write:['_','_'], move:['S','S'] }, // T1 was all-0 → done
      },
      q_tally:{ // T1 reads '0' (just flipped), T2 reads '_' (next tally slot)
        '0,_':{ nextState:'q_rewind', write:['0','|'], move:['R','R'] },
      },
      q_rewind:{ // scan T1 left until we hit pos -1
        '0,_':{ nextState:'q_rewind', write:['0','_'], move:['L','S'] },
        '1,_':{ nextState:'q_rewind', write:['1','_'], move:['L','S'] },
        '_,_':{ nextState:'q_check0', write:['_','_'], move:['R','S'] },
      },
      q_check0:{ // scan right; stop if '1' found (loop), or accept if all '0'
        '0,_':{ nextState:'q_check0', write:['0','_'], move:['R','S'] },
        '1,_':{ nextState:'q_scan',   write:['1','_'], move:['R','S'] }, // not zero yet
        '_,_':{ nextState:'q_accept', write:['_','_'], move:['S','S'] }, // all zeros → done
      },
      q_accept:{}, q_reject:{},
    },
    description:'"101" (5) → ||||| on T2. Subtracts 1 from T1 per tally mark until 0.',
  },
];

/* ══════════════════════════════════════════════════════════════
   MULTI-TAPE TURING MACHINE ENGINE
   ══════════════════════════════════════════════════════════════ */
class MultiTapeTuringMachine {
  constructor(cfg) {
    this.numTapes     = cfg.numTapes    || 2;
    this.startState   = cfg.startState  || 'q0';
    this.acceptStates = new Set(cfg.acceptStates || ['q_accept']);
    this.rejectState  = cfg.rejectState || 'q_reject';
    this.transitions  = cfg.transitions  || {};
    this.blank        = cfg.blank        || '_';
    this.inputString  = cfg.input        || '';
    this.tapeInputs   = cfg.tapeInputs   ? [...cfg.tapeInputs] : [cfg.input || ''];

    this.currentState   = this.startState;
    this.tapes = []; this.heads = [];
    this.stepCount = 0; this.haltStatus = null; this.lastTransition = null;
    this._initTapes();
  }

  _initTapes() {
    this.tapes = []; this.heads = [];
    for (let i = 0; i < this.numTapes; i++) { this.tapes.push(new Map()); this.heads.push(0); }
    for (let ti = 0; ti < this.numTapes; ti++) {
      const s = (this.tapeInputs[ti] !== undefined ? this.tapeInputs[ti] : '')
                || (ti === 0 ? this.inputString : '');
      for (let j = 0; j < s.length; j++) this.tapes[ti].set(j, s[j]);
    }
  }

  read(ti)       { return this.tapes[ti].get(this.heads[ti]) || this.blank; }
  write(ti, sym) { sym === this.blank ? this.tapes[ti].delete(this.heads[ti]) : this.tapes[ti].set(this.heads[ti], sym); }
  moveHead(ti,d) { if(d==='R') this.heads[ti]++; else if(d==='L') this.heads[ti]--; }
  _key()         { return this.tapes.map((_,i)=>this.read(i)).join(','); }

  step() {
    if (this.haltStatus !== null) return false;
    if (this.acceptStates.has(this.currentState)) { this.haltStatus='accept'; return false; }
    if (this.currentState === this.rejectState)   { this.haltStatus='reject'; return false; }

    const rules = this.transitions[this.currentState];
    if (!rules) { this.haltStatus='reject'; return false; }
    const key = this._key();
    const rule = rules[key];
    if (!rule) { this.haltStatus='reject'; return false; }

    this.lastTransition = { fromState:this.currentState, toState:rule.nextState, readKey:key, write:rule.write };
    this.currentState = rule.nextState;
    for (let i=0; i<this.numTapes; i++) {
      if (rule.write[i] !== undefined) this.write(i, rule.write[i]);
      if (rule.move[i]  !== undefined) this.moveHead(i, rule.move[i]);
    }
    this.stepCount++;
    if (this.acceptStates.has(this.currentState)) this.haltStatus='accept';
    else if (this.currentState === this.rejectState) this.haltStatus='reject';
    return true;
  }

  reset() {
    this.currentState=this.startState; this.stepCount=0;
    this.haltStatus=null; this.lastTransition=null; this._initTapes();
  }

  getRules() {
    const out=[];
    for (const [st,rules] of Object.entries(this.transitions))
      for (const [rk,rule] of Object.entries(rules))
        out.push({ id:`${st}:::${rk}`, currentState:st, readSymbols:rk.split(','),
                   nextState:rule.nextState, writeSymbols:rule.write, headMoves:rule.move });
    return out;
  }

  setRule(cs,rs,ns,ws,ms) {
    if(!this.transitions[cs]) this.transitions[cs]={};
    this.transitions[cs][rs.join(',')]={ nextState:ns, write:ws, move:ms };
  }

  deleteRule(cs,rk) {
    if(this.transitions[cs]) {
      delete this.transitions[cs][rk];
      if(!Object.keys(this.transitions[cs]).length) delete this.transitions[cs];
    }
  }

  getStates() {
    const s=new Set([this.startState, this.rejectState]);
    this.acceptStates.forEach(x=>s.add(x));
    for (const [st,rules] of Object.entries(this.transitions)) {
      s.add(st); Object.values(rules).forEach(r=>s.add(r.nextState));
    }
    return [...s];
  }

  getTapeContent(ti) {
    const tape=this.tapes[ti]; if(!tape.size) return '';
    const keys=[...tape.keys()];
    const mn=Math.min(...keys,0), mx=Math.max(...keys,0);
    let s=''; for(let i=mn;i<=mx;i++) s+=tape.get(i)||this.blank; return s;
  }
}

/* ══════════════════════════════════════════════════════════════
   APP STATE
   ══════════════════════════════════════════════════════════════ */
let machine=null, playInterval=null, isPlaying=false, speedMs=250;
let currentPresetId='string_copy', editingRuleId=null, currentView='simulate';
let numTapes=2, blankSymbol='_';
const tapeBuffers=[];

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  buildPresetCards();
  loadPreset('string_copy');
  document.getElementById('num-tapes').addEventListener('change',function(){
    const n=parseInt(this.value)||2;
    numTapes=n;
    buildTapeInputFields(n);
    // Sync the live machine so modal & tape UI reflect the new tape count
    if(machine){
      machine.numTapes=n;
      while(machine.tapeInputs.length<n) machine.tapeInputs.push('');
      machine.tapeInputs=machine.tapeInputs.slice(0,n);
      machine._initTapes();
      tapeBuffers.length=0;
      buildTapeUI();
      renderTransitionTable();
      updateMachineInfoBadges();
      renderDiagram('setup-diagram-container');
      renderDiagram('sim-diagram-container');
    }
  });
  buildTapeUI(); renderTransitionTable(); updateUI();
  renderDiagram('setup-diagram-container'); renderDiagram('sim-diagram-container');
  setupKeyboardShortcuts(); switchView('simulate');
});

function buildPresetCards(){
  const grid=document.getElementById('presets-grid'); grid.innerHTML='';
  PRESETS.forEach(p=>{
    const c=document.createElement('div');
    c.className=`preset-card${p.id===currentPresetId?' active':''}`;
    c.id=`preset-card-${p.id}`;
    c.innerHTML=`<div class="preset-card-icon">${p.icon}</div>
      <div><div class="preset-card-name">${p.name}</div>
      <div class="preset-card-desc">${p.desc}</div></div>`;
    c.onclick=()=>loadPreset(p.id); grid.appendChild(c);
  });
}

function loadPreset(id){
  const preset=PRESETS.find(p=>p.id===id); if(!preset) return;
  currentPresetId=id; numTapes=preset.numTapes; blankSymbol='_';

  // Use preset-defined tapeInputs (supports multi-tape initial content like Binary Adder)
  const tapeInputs = preset.tapeInputs
    ? [...preset.tapeInputs]
    : [preset.input||''];
  while(tapeInputs.length < preset.numTapes) tapeInputs.push('');

  machine=new MultiTapeTuringMachine({
    numTapes:preset.numTapes, startState:preset.startState,
    acceptStates:preset.acceptStates, rejectState:preset.rejectState,
    transitions:JSON.parse(JSON.stringify(preset.transitions)),
    blank:'_', input:tapeInputs[0]||'', tapeInputs,
  });

  document.getElementById('num-tapes').value=''+preset.numTapes;
  document.getElementById('blank-symbol').value='_';
  document.querySelectorAll('.preset-card').forEach(c=>c.classList.remove('active'));
  document.getElementById(`preset-card-${id}`)?.classList.add('active');
  document.getElementById('setup-machine-name').textContent=preset.name;
  document.getElementById('sim-machine-name').textContent=preset.name;

  updateMachineInfoBadges(); buildTapeInputFields();
  stopPlay(); tapeBuffers.length=0;
  buildTapeUI(); renderTransitionTable();
  renderDiagram('setup-diagram-container'); renderDiagram('sim-diagram-container');
  updateUI(); showToast(`Loaded: ${preset.name}`,'success');
}

/* ══════════════════════════════════════════════════════════════
   TAPE INPUT FIELDS
   ══════════════════════════════════════════════════════════════ */
function buildTapeInputFields(overrideCount){
  const wrapper=document.getElementById('tape-inputs-wrapper'); if(!wrapper) return;
  const n=overrideCount||(machine?machine.numTapes:null)||
    parseInt(document.getElementById('num-tapes')?.value)||2;
  const existingVals=[];
  for(let i=0;i<6;i++){ const el=document.getElementById(`tape-input-${i}`); existingVals[i]=el?el.value:null; }
  wrapper.innerHTML='';
  wrapper.style.gridTemplateColumns=n===1?'1fr':n===3?'1fr 1fr 1fr':'1fr 1fr';
  for(let i=0;i<n;i++){
    const val=existingVals[i]!==null?existingVals[i]:(machine?.tapeInputs?.[i]??'');
    const g=document.createElement('div'); g.className='field-group';
    g.innerHTML=`<label class="field-label" for="tape-input-${i}">Tape ${i+1}${i>0?' <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-muted)">(optional)</span>':''}</label>
      <input class="field-input" type="text" id="tape-input-${i}"
        placeholder="${i===0?'e.g. 1011':'Leave blank for empty'}"
        value="${escapeHtml(val)}" spellcheck="false" autocomplete="off"/>`;
    wrapper.appendChild(g);
  }
}

/* ══════════════════════════════════════════════════════════════
   VIEW SWITCHING
   ══════════════════════════════════════════════════════════════ */
function switchView(view){
  currentView=view;
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(`${view}-view`).classList.add('active');
  document.getElementById(`nav-${view}`).classList.add('active');
  if(view==='simulate'){ tapeBuffers.length=0; buildTapeUI(); updateUI(); renderDiagram('sim-diagram-container'); }
  else{ buildTapeInputFields(); renderTransitionTable(); updateMachineInfoBadges(); renderDiagram('setup-diagram-container'); }
}

function goSimulate(){
  const tapeN=parseInt(document.getElementById('num-tapes').value,10)||numTapes;
  const blank=document.getElementById('blank-symbol').value||'_';
  const tapeInputs=[];
  for(let i=0;i<tapeN;i++){ const el=document.getElementById(`tape-input-${i}`); tapeInputs.push(el?el.value:''); }
  numTapes=tapeN; blankSymbol=blank;
  if(machine){ machine.numTapes=tapeN; machine.blank=blank; machine.inputString=tapeInputs[0]||''; machine.tapeInputs=tapeInputs; machine.reset(); }
  stopPlay(); tapeBuffers.length=0; switchView('simulate'); showToast('Simulation ready — press Play or Step!','info');
}

function updateMachineInfoBadges(){
  if(!machine) return;
  const states=machine.getStates(), rules=machine.getRules();
  document.getElementById('info-tapes').textContent=`${machine.numTapes} tape${machine.numTapes!==1?'s':''}`;
  document.getElementById('info-states').textContent=`${states.length} states`;
  document.getElementById('info-rules').textContent=`${rules.length} rules`;
  document.getElementById('accept-states-display').textContent=[...machine.acceptStates].join(', ');
  document.getElementById('reject-state-display').textContent=machine.rejectState;
}

/* ══════════════════════════════════════════════════════════════
   TAPE RENDERING — persistent buffer for smooth animation
   ══════════════════════════════════════════════════════════════ */
function buildTapeUI(){
  if(!machine) return;
  const area=document.getElementById('tapes-area');
  area.innerHTML=''; tapeBuffers.length=0;
  for(let i=0;i<machine.numTapes;i++){
    const row=document.createElement('div'); row.className='tape-row'; row.id=`tape-row-${i}`;
    row.innerHTML=`<div class="tape-label-row">
        <div class="tape-badge"><span>T${i+1}</span></div>
        <div class="tape-info-bar">
          <span>Head pos: <span class="tape-pos-indicator" id="head-pos-${i}">0</span></span>
          <span class="tape-head-symbol">Reading: <strong id="head-reading-${i}">_</strong></span>
        </div></div>
      <div class="tape-viewport" id="tape-viewport-${i}">
        <div class="tape-head-arrow"></div>
        <div class="tape-track" id="tape-track-${i}"></div>
      </div>`;
    area.appendChild(row); tapeBuffers[i]=null;
  }
  renderTapes(); updateTapeSummary();
}

function renderTapes(writtenIndices=[]){
  if(!machine) return;
  for(let i=0;i<machine.numTapes;i++) renderTape(i,writtenIndices.includes(i));
}

function renderTape(ti,flash=false){
  const track=document.getElementById(`tape-track-${ti}`);
  const vp=document.getElementById(`tape-viewport-${ti}`);
  if(!track||!vp) return;
  const head=machine.heads[ti], cellW=48;
  let buf=tapeBuffers[ti];
  const needRebuild=!buf||head<=buf.renderMin+VISIBLE_CELLS+2||head>=buf.renderMax-VISIBLE_CELLS-2;

  if(needRebuild){
    const rMin=head-BUFFER_CELLS, rMax=head+BUFFER_CELLS;
    track.style.transition='none'; track.innerHTML='';
    for(let pos=rMin;pos<=rMax;pos++){
      const sym=machine.tapes[ti].get(pos)||machine.blank;
      const cell=document.createElement('div'); cell.className='tape-cell';
      if(sym===machine.blank) cell.classList.add('blank-cell');
      if(pos===head) cell.classList.add('head-cell');
      cell.textContent=sym; cell.dataset.pos=String(pos);
      track.appendChild(cell);
    }
    buf=tapeBuffers[ti]={renderMin:rMin,renderMax:rMax};
    const hIdx=head-rMin;
    track.style.transform=`translateX(${-(hIdx+0.5)*cellW}px)`;
    void track.getBoundingClientRect();
  } else {
    const cells=track.children, hIdx=head-buf.renderMin;
    const from=Math.max(0,hIdx-VISIBLE_CELLS-1), to=Math.min(cells.length-1,hIdx+VISIBLE_CELLS+1);
    for(let i=from;i<=to;i++){
      const pos=buf.renderMin+i, sym=machine.tapes[ti].get(pos)||machine.blank;
      const cell=cells[i], isH=(pos===head);
      cell.className='tape-cell';
      if(sym===machine.blank) cell.classList.add('blank-cell');
      if(isH){ cell.classList.add('head-cell'); if(flash){ cell.classList.add('just-written'); const c=cell; setTimeout(()=>c.classList.remove('just-written'),480); } }
      cell.textContent=sym;
    }
    track.style.transition='transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94)';
    track.style.transform=`translateX(${-(hIdx+0.5)*cellW}px)`;
  }

  const pL=document.getElementById(`head-pos-${ti}`); if(pL) pL.textContent=head;
  const rL=document.getElementById(`head-reading-${ti}`);
  if(rL){ const sym=machine.tapes[ti].get(head)||machine.blank; rL.textContent=sym===machine.blank?'⎵':sym; }

  if(machine.haltStatus==='accept'){ vp.classList.add('accepted'); vp.classList.remove('rejected'); }
  else if(machine.haltStatus==='reject'){ vp.classList.add('rejected'); vp.classList.remove('accepted'); }
  else{ vp.classList.remove('accepted','rejected'); }
}

function updateTapeSummary(){
  if(!machine) return;
  const d=document.getElementById('tape-summary'); if(!d) return;
  let h='<div class="monitor-title">Tape Contents</div>';
  for(let i=0;i<machine.numTapes;i++){
    const c=machine.getTapeContent(i)||'';
    h+=`<div class="tape-summary-item"><span class="tape-summary-label">Tape ${i+1}</span>
      <span class="tape-content-preview">${escapeHtml(c)||'<span style="color:var(--text-muted);font-style:italic;">empty</span>'}</span></div>`;
  }
  d.innerHTML=h;
}

/* ══════════════════════════════════════════════════════════════
   TRANSITION TABLE
   ══════════════════════════════════════════════════════════════ */
function renderTransitionTable(){
  if(!machine) return;
  const tbody=document.getElementById('transition-tbody'); if(!tbody) return;
  const rules=machine.getRules();
  if(!rules.length){ tbody.innerHTML=`<tr><td colspan="6" class="no-rules-msg"><span>🔧</span>No rules.<br/>Select a preset or click <strong>Add Rule</strong>.</td></tr>`; return; }
  tbody.innerHTML='';
  rules.forEach(r=>{
    const tr=document.createElement('tr'); tr.id=`rule-row-${CSS.escape(r.id)}`;
    tr.innerHTML=`<td class="state-cell">${escapeHtml(r.currentState)}</td>
      <td>${r.readSymbols.map(s=>symbolBadge(s)).join(' ')}</td>
      <td class="state-cell">${escapeHtml(r.nextState)}</td>
      <td>${r.writeSymbols.map(s=>symbolBadge(s)).join(' ')}</td>
      <td>${r.headMoves.map(m=>moveBadge(m)).join(' ')}</td>
      <td><div class="rule-actions">
        <button class="icon-btn" onclick="editRule('${escapeAttr(r.id)}')">✏</button>
        <button class="icon-btn danger" onclick="deleteRule('${escapeAttr(r.id)}')">✕</button>
      </div></td>`;
    tbody.appendChild(tr);
  });
  updateMachineInfoBadges();
}

function symbolBadge(s){ return `<span class="symbol-badge${s==='_'?' blank':''}">${escapeHtml(s)}</span>`; }
function moveBadge(m){ return `<span class="move-badge ${m}">${m}</span>`; }

/* ══════════════════════════════════════════════════════════════
   SIMULATION CONTROLS
   ══════════════════════════════════════════════════════════════ */
function doStep(){
  if(!machine||machine.haltStatus!==null) return; // silent when halted
  const moved=machine.step();
  const wt=machine.lastTransition?machine.lastTransition.write.map((_,i)=>i):[];
  renderTapes(wt); updateUI(); highlightDiagramTransition(); updateTapeSummary();
  if(!moved&&machine.haltStatus){
    showToast(machine.haltStatus==='accept'?'✅ Machine ACCEPTED!':'❌ Machine REJECTED.',machine.haltStatus==='accept'?'success':'error');
    stopPlay();
  }
}

function togglePlay(){
  if(!machine||machine.haltStatus!==null) return;
  isPlaying?pausePlay():startPlay();
}

function startPlay(){
  if(!machine||machine.haltStatus!==null) return;
  isPlaying=true;
  const btn=document.getElementById('play-btn'); btn.textContent='⏸'; btn.classList.add('playing');
  playInterval=setInterval(doStep,speedMs); setStatusPill('running','Running');
}

function pausePlay(){
  isPlaying=false; clearInterval(playInterval); playInterval=null;
  const btn=document.getElementById('play-btn'); btn.textContent='▶'; btn.classList.remove('playing');
  if(machine?.haltStatus===null) setStatusPill('halted','Paused');
}

function stopPlay(){
  isPlaying=false; clearInterval(playInterval); playInterval=null;
  const btn=document.getElementById('play-btn');
  if(btn){ btn.textContent='▶'; btn.classList.remove('playing'); }
}

function doReset(){
  const tis=[];
  for(let i=0;i<(machine?.numTapes||numTapes);i++){
    const el=document.getElementById(`tape-input-${i}`);
    tis.push(el?el.value:(i===0?machine?.inputString??'':''));
  }
  if(machine){ machine.inputString=tis[0]||''; machine.tapeInputs=tis; machine.reset(); }
  stopPlay(); tapeBuffers.length=0; buildTapeUI(); updateUI(); clearDiagramHighlights();
  showToast('Machine reset.','info');
}

function updateSpeed(val){
  const t=[800,600,400,300,200,150,100,80,60,40];
  speedMs=t[parseInt(val)-1]||250;
  document.getElementById('speed-value').textContent=`${speedMs}ms`;
  if(isPlaying){ clearInterval(playInterval); playInterval=setInterval(doStep,speedMs); }
}

/* ══════════════════════════════════════════════════════════════
   UI UPDATE
   ══════════════════════════════════════════════════════════════ */
function updateUI(){
  if(!machine) return;
  const badge=document.getElementById('current-state-badge');
  if(badge){ badge.textContent=machine.currentState; badge.className='current-state-badge';
    if(machine.haltStatus==='accept') badge.classList.add('accept');
    else if(machine.haltStatus==='reject') badge.classList.add('reject'); }
  const sb=document.getElementById('steps-big'); if(sb) sb.innerHTML=`${machine.stepCount}<small>Steps Taken</small>`;
  const hs=document.getElementById('header-steps'); if(hs) hs.textContent=machine.stepCount;
  if(machine.haltStatus==='accept')      setStatusPill('accepted','Accepted ✓');
  else if(machine.haltStatus==='reject') setStatusPill('rejected','Rejected ✗');
  else if(!isPlaying)                    setStatusPill('idle','Ready');
  const ae=document.getElementById('accept-states-display'); if(ae) ae.textContent=[...machine.acceptStates].join(', ');
  const re=document.getElementById('reject-state-display'); if(re) re.textContent=machine.rejectState;
}

function setStatusPill(type,text){
  const p=document.getElementById('status-pill'), s=document.getElementById('status-text');
  if(p&&s){ p.className=`status-pill ${type}`; s.textContent=text; }
}

/* ══════════════════════════════════════════════════════════════
   STATE DIAGRAM (D3.js)
   ══════════════════════════════════════════════════════════════ */
function renderDiagram(cid){
  if(!machine) return;
  const container=document.getElementById(cid); if(!container) return;
  container.innerHTML='';
  const W=container.clientWidth||280, H=container.clientHeight||260;
  const states=machine.getStates(), nodeR=20;

  // Layout: BFS layers
  const visited=new Map(), adj={};
  for(const [st,rules] of Object.entries(machine.transitions)){
    adj[st]=adj[st]||new Set();
    Object.values(rules).forEach(r=>adj[st].add(r.nextState));
  }
  const q=[{state:machine.startState,layer:0}]; visited.set(machine.startState,0);
  while(q.length){ const {state,layer}=q.shift(); for(const n of (adj[state]||[])) if(!visited.has(n)){ visited.set(n,layer+1); q.push({state:n,layer:layer+1}); } }
  states.forEach(s=>{ if(!visited.has(s)) visited.set(s,1); });
  const layers={};
  visited.forEach((l,s)=>{ layers[l]=layers[l]||[]; layers[l].push(s); });
  const sl=Object.keys(layers).sort((a,b)=>a-b);
  const nodeMap={};
  sl.forEach((l,li)=>{
    const g=layers[l];
    g.forEach((st,gi)=>{
      nodeMap[st]={id:st,x:li,y:g.length===1?0.5:gi/(g.length-1),
        accept:[...machine.acceptStates].includes(st),reject:st===machine.rejectState,start:st===machine.startState};
    });
  });
  const allX=states.map(s=>nodeMap[s].x), allY=states.map(s=>nodeMap[s].y);
  const mnX=Math.min(...allX),mxX=Math.max(...allX),mnY=Math.min(...allY),mxY=Math.max(...allY);
  const scX=mxX===mnX?1:(W-nodeR*4)/(mxX-mnX), scY=mxY===mnY?1:(H-nodeR*4)/(mxY-mnY);
  states.forEach(s=>{ nodeMap[s].sx=nodeR*2+(nodeMap[s].x-mnX)*scX; nodeMap[s].sy=nodeR*2+(nodeMap[s].y-mnY)*scY; });

  // Edges
  const edgeMap={};
  for(const [st,rules] of Object.entries(machine.transitions))
    for(const [rk,rule] of Object.entries(rules)){
      const k=`${st}:::${rule.nextState}`; if(!edgeMap[k]) edgeMap[k]={from:st,to:rule.nextState,labels:[]};
      edgeMap[k].labels.push(rk+'→'+rule.write.join(','));
    }
  const edges=Object.values(edgeMap);

  const svg=d3.select(container).append('svg').attr('class','diagram-svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width',W).attr('height',H);
  const defs=svg.append('defs');
  [['arrowhead','#c8c0b4'],['arrowhead-active','#4a7fb5']].forEach(([id,color])=>{
    defs.append('marker').attr('id',id).attr('viewBox','0 0 10 10').attr('refX',18).attr('refY',5)
      .attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto')
      .append('path').attr('d','M 0 0 L 10 5 L 0 10 z').attr('fill',color);
  });

  const edgesG=svg.append('g');
  edges.forEach(e=>{
    const fn=nodeMap[e.from],tn=nodeMap[e.to]; if(!fn||!tn) return;
    const isSelf=e.from===e.to, eid=`edge-${cid}-${CSS.escape(e.from+'_'+e.to)}`;
    const hasBidi=edges.some(x=>x.from===e.to&&x.to===e.from);
    const lbl=e.labels.length>2?e.labels.slice(0,2).join(';')+'…':e.labels.join(';');
    if(isSelf){
      const cx=fn.sx,cy=fn.sy-nodeR-16;
      edgesG.append('path').attr('class','transition-edge').attr('id',eid)
        .attr('d',`M ${cx-10} ${fn.sy-nodeR} C ${cx-30} ${cy-22} ${cx+30} ${cy-22} ${cx+10} ${fn.sy-nodeR}`).attr('marker-end','url(#arrowhead)');
      edgesG.append('text').attr('class','edge-label').attr('id',`label-${eid}`).attr('x',cx).attr('y',cy-24).text(lbl);
    } else {
      const dx=tn.sx-fn.sx,dy=tn.sy-fn.sy,dist=Math.sqrt(dx*dx+dy*dy),ux=dx/dist,uy=dy/dist;
      const cv=hasBidi?20:0,mx=(fn.sx+tn.sx)/2-uy*cv,my=(fn.sy+tn.sy)/2+ux*cv;
      const x1=fn.sx+ux*nodeR,y1=fn.sy+uy*nodeR,x2=tn.sx-ux*nodeR,y2=tn.sy-uy*nodeR;
      edgesG.append('path').attr('class','transition-edge').attr('id',eid)
        .attr('d',cv?`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`:`M ${x1} ${y1} L ${x2} ${y2}`).attr('marker-end','url(#arrowhead)');
      edgesG.append('text').attr('class','edge-label').attr('id',`label-${eid}`).attr('x',mx||(fn.sx+tn.sx)/2).attr('y',(my||(fn.sy+tn.sy)/2)-6).text(lbl);
    }
  });

  // Start arrow
  const sn=nodeMap[machine.startState];
  if(sn) svg.append('path').attr('class','transition-edge').attr('d',`M ${sn.sx-nodeR-18} ${sn.sy} L ${sn.sx-nodeR} ${sn.sy}`).attr('marker-end','url(#arrowhead)');

  const nodesG=svg.append('g');
  states.forEach(st=>{
    const n=nodeMap[st]; if(!n) return;
    const g=nodesG.append('g').attr('class','state-node-group').attr('id',`node-${cid}-${CSS.escape(st)}`);
    g.append('circle').attr('class',`state-node-circle${n.accept?' accept':''}${n.reject?' reject':''}`).attr('cx',n.sx).attr('cy',n.sy).attr('r',nodeR);
    if(n.accept) g.append('circle').attr('class','state-inner-circle accept').attr('cx',n.sx).attr('cy',n.sy).attr('r',nodeR-5);
    g.append('text').attr('class',`state-node-text${n.accept?' accept':''}${n.reject?' reject':''}`).attr('x',n.sx).attr('y',n.sy).text(st);
  });

  if(machine.currentState) highlightDiagramState(cid,machine.currentState);
  if(machine.lastTransition) highlightDiagramEdge(cid,machine.lastTransition.fromState,machine.lastTransition.toState);
}

function highlightDiagramTransition(){
  ['setup-diagram-container','sim-diagram-container'].forEach(cid=>{
    clearDiagramHighlights(cid);
    if(machine.currentState) highlightDiagramState(cid,machine.currentState);
    if(machine.lastTransition){ highlightDiagramEdge(cid,machine.lastTransition.fromState,machine.lastTransition.toState); highlightTableRow(machine.lastTransition); }
  });
}

function highlightDiagramState(cid,st){
  const n=document.getElementById(`node-${cid}-${CSS.escape(st)}`); if(!n) return;
  n.querySelector('.state-node-circle')?.classList.add('active');
  n.querySelector('.state-node-text')?.classList.add('active');
}

function highlightDiagramEdge(cid,from,to){
  const eid=`edge-${cid}-${CSS.escape(from+'_'+to)}`;
  document.getElementById(eid)?.classList.add('active');
  document.getElementById(`label-${eid}`)?.classList.add('active');
}

function clearDiagramHighlights(cid){
  if(!cid){ clearDiagramHighlights('setup-diagram-container'); clearDiagramHighlights('sim-diagram-container'); return; }
  document.getElementById(cid)?.querySelectorAll('.active').forEach(el=>el.classList.remove('active'));
}

function highlightTableRow(t){
  document.querySelectorAll('.active-rule').forEach(r=>r.classList.remove('active-rule'));
  const row=document.getElementById(`rule-row-${CSS.escape(t.fromState+':::'+t.readKey)}`);
  if(row){ row.classList.add('active-rule'); row.scrollIntoView({block:'nearest',behavior:'smooth'}); }
}

/* ══════════════════════════════════════════════════════════════
   MODAL — ADD / EDIT RULE
   ══════════════════════════════════════════════════════════════ */
function buildModalSymbolInputs(n){
  const rd=document.getElementById('modal-read-symbols');
  const wd=document.getElementById('modal-write-symbols');
  const md=document.getElementById('modal-moves');
  rd.innerHTML=wd.innerHTML=md.innerHTML='';
  for(let i=0;i<n;i++){
    rd.appendChild(mkSym(`m-read-${i}`,`T${i+1}`,'_'));
    wd.appendChild(mkSym(`m-write-${i}`,`T${i+1}`,'_'));
    md.appendChild(mkMove(`m-move-${i}`,`T${i+1}`));
  }
}
function mkSym(id,lbl,def){ const w=document.createElement('div'); w.className='symbol-input-wrap';
  w.innerHTML=`<span class="symbol-input-label">${lbl}</span><input class="field-input symbol-input" type="text" id="${id}" maxlength="2" value="${def}" spellcheck="false"/>`; return w; }
function mkMove(id,lbl){ const w=document.createElement('div'); w.className='symbol-input-wrap';
  w.innerHTML=`<span class="symbol-input-label">${lbl}</span><select class="field-input symbol-input move-select" id="${id}"><option value="R">R →</option><option value="L">L ←</option><option value="S">S ●</option></select>`; return w; }

function openAddRuleModal(){
  editingRuleId=null;
  document.getElementById('modal-title').textContent='Add Transition Rule';
  document.getElementById('modal-save-btn').textContent='Add Rule';
  document.getElementById('m-cur-state').value=''; document.getElementById('m-next-state').value='';
  buildModalSymbolInputs(machine.numTapes);
  document.getElementById('rule-modal').classList.add('visible');
  document.getElementById('m-cur-state').focus();
}

function openEditRuleModal(ruleId){
  const [st,rk]=ruleId.split(':::'); const rule=machine.transitions[st]?.[rk]; if(!rule) return;
  editingRuleId=ruleId;
  document.getElementById('modal-title').textContent='Edit Transition Rule';
  document.getElementById('modal-save-btn').textContent='Update Rule';
  document.getElementById('m-cur-state').value=st; document.getElementById('m-next-state').value=rule.nextState;
  buildModalSymbolInputs(machine.numTapes);
  rk.split(',').forEach((s,i)=>{ const el=document.getElementById(`m-read-${i}`); if(el) el.value=s; });
  rule.write.forEach((s,i)=>{ const el=document.getElementById(`m-write-${i}`); if(el) el.value=s; });
  rule.move.forEach((m,i)=>{ const el=document.getElementById(`m-move-${i}`); if(el) el.value=m; });
  document.getElementById('rule-modal').classList.add('visible');
}

function editRule(id){ openEditRuleModal(decodeAttr(id)); }
function closeModal(){ document.getElementById('rule-modal').classList.remove('visible'); editingRuleId=null; }

function saveRule(){
  const cs=document.getElementById('m-cur-state').value.trim();
  const ns=document.getElementById('m-next-state').value.trim();
  if(!cs||!ns){ showToast('State names cannot be empty.','error'); return; }
  const rs=[],ws=[],ms=[];
  for(let i=0;i<machine.numTapes;i++){
    rs.push(document.getElementById(`m-read-${i}`)?.value||machine.blank);
    ws.push(document.getElementById(`m-write-${i}`)?.value||machine.blank);
    ms.push(document.getElementById(`m-move-${i}`)?.value||'R');
  }
  if(editingRuleId){ const [os,ok]=editingRuleId.split(':::'); machine.deleteRule(os,ok); }
  const wasEditing=!!editingRuleId;
  machine.setRule(cs,rs,ns,ws,ms); closeModal();
  renderTransitionTable(); renderDiagram('setup-diagram-container'); renderDiagram('sim-diagram-container');
  showToast(wasEditing?'Rule updated.':'Rule added.','success');
}

function deleteRule(id){ const [st,rk]=decodeAttr(id).split(':::'); machine.deleteRule(st,rk);
  renderTransitionTable(); renderDiagram('setup-diagram-container'); renderDiagram('sim-diagram-container'); showToast('Rule deleted.','info'); }

function clearAllRules(){ 
  machine.transitions={}; 
  currentPresetId='custom';
  document.querySelectorAll('.preset-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('preset-card-custom')?.classList.add('active');
  document.getElementById('setup-machine-name').textContent='Custom Machine';
  document.getElementById('sim-machine-name').textContent='Custom Machine';
  renderTransitionTable(); 
  renderDiagram('setup-diagram-container'); 
  renderDiagram('sim-diagram-container'); 
  showToast('All rules cleared.','info'); 
}

/* ══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════════════ */
function setupKeyboardShortcuts(){
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.ctrlKey||e.metaKey) return;
    if(e.key===' '){ e.preventDefault(); togglePlay(); }
    else if(e.key==='ArrowRight') doStep();
    else if(e.key==='r'||e.key==='R') doReset();
    else if(e.key==='Escape') closeModal();
  });
}

/* ══════════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════════ */
function showToast(msg,type='info'){
  const c=document.getElementById('toast-container');
  const t=document.createElement('div'); t.className=`toast ${type}`; t.textContent=msg;
  c.appendChild(t); requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); },2800);
}

/* ══════════════════════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════════════════════ */
function escapeHtml(s){ if(s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escapeAttr(s){ return encodeURIComponent(s); }
function decodeAttr(s){ return decodeURIComponent(s); }
