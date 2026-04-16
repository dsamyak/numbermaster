const TOPICS = [
  { id: 't1', title: 'History of Math', icon: '🏛️', desc: 'Understand counting from tally marks to digits' },
  { id: 't2', title: 'Number Line', icon: '📏', desc: 'Learn to jump and find positions on the line' },
  { id: 't3', title: 'Place Value', icon: '🧱', desc: 'Break down numbers into Tens and Ones' },
  { id: 't4', title: 'Missing Numbers', icon: '🧩', desc: 'Identify patterns and fill in the blanks' },
  { id: 't5', title: 'Comparing Numbers', icon: '⚖️', desc: 'Greater than, less than, and equal to' },
  { id: 't6', title: 'Ascending & Descending', icon: '📈', desc: 'Order sequences of numbers' }
];

let state = {
  currentView: 'dashboard',
  currentTopicId: null,
  topicItems: [],   
  currentIndex: 0,
  score: 0,
  progress: JSON.parse(localStorage.getItem('num_progress') || '{}')
};

/* =======================================================
   RICH SVG VISUALS 
   ======================================================= */
const SVG = {
  tally(n) {
    let svg = `<svg viewBox="0 0 400 150" width="100%" height="200" style="background:rgba(255,255,255,0.02); border-radius:12px;">`;
    let xOffset = 20;
    
    for (let count = 1; count <= n; count++) {
      if (count % 5 === 0) {
        // Strike through
        svg += `<line x1="${xOffset - 40}" y1="110" x2="${xOffset + 20}" y2="30" stroke="#f59e0b" stroke-width="8" stroke-linecap="round">
                  <animate attributeName="x2" from="${xOffset - 40}" to="${xOffset + 20}" dur="0.3s" fill="freeze" />
                  <animate attributeName="y2" from="110" to="30" dur="0.3s" fill="freeze" />
                </line>`;
        xOffset += 40; // larger gap after a group of 5
      } else {
        // Vertical tally
        svg += `<line x1="${xOffset}" y1="40" x2="${xOffset}" y2="100" stroke="#06b6d4" stroke-width="6" stroke-linecap="round">
                  <animate attributeName="y2" from="40" to="100" dur="0.4s" fill="freeze" begin="${count*0.1}s" />
                </line>`;
        xOffset += 12;
      }
    }
    
    // Add text label below
    svg += `<text x="200" y="140" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="Outfit">Total: ${n}</text>`;
    svg += `</svg>`;
    return svg;
  },

  numberLine(min, max, highlights=[], showHop=false) {
    const w = 600, h = 200, pad = 40;
    const lineY = 120;
    const range = max - min;
    const step = (w - pad*2) / range;
    
    let svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="250" style="background:rgba(255,255,255,0.02); border-radius:12px;">`;
    svg += `<line x1="${pad-20}" y1="${lineY}" x2="${w-pad+20}" y2="${lineY}" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>`;
    
    for (let i = min; i <= max; i++) {
        const x = pad + (i - min) * step;
        const hl = highlights.includes(i);
        const color = hl ? '#f59e0b' : '#f8fafc';
        const thick = hl ? 4 : 2;
        
        svg += `<line x1="${x}" y1="${lineY-10}" x2="${x}" y2="${lineY+10}" stroke="#94a3b8" stroke-width="${thick}"/>`;
        svg += `<text x="${x}" y="${lineY+35}" text-anchor="middle" fill="${color}" font-weight="${hl?'bold':'normal'}" font-size="18" font-family="Outfit">${i}</text>`;
        
        if (hl && showHop === false) {
           svg += `<circle cx="${x}" cy="${lineY}" r="8" fill="#f59e0b">
                      <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
                   </circle>`;
        }
    }

    if (showHop && highlights.length >= 2) {
        const from = highlights[0], to = highlights[highlights.length-1];
        const fromX = pad + (from - min) * step;
        const toX = pad + (to - min) * step;
        const midX = (fromX + toX) / 2;
        
        // Animated Arc
        svg += `<path d="M ${fromX} ${lineY} Q ${midX} 40 ${toX} ${lineY}" fill="none" stroke="#10b981" stroke-width="4" stroke-dasharray="10 5" marker-end="url(#arrow)">
                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
                </path>`;
        svg += `<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#10b981"/></marker></defs>`;
        // Frog emoji
        svg += `<text x="${toX}" y="${lineY-30}" text-anchor="middle" font-size="28">🐸</text>`;
    }
    
    svg += `</svg>`;
    return svg;
  },

  base10(tens, ones) {
    let svg = `<svg viewBox="0 0 400 250" width="100%" height="250" style="background:rgba(255,255,255,0.02); border-radius:12px;">`;
    
    let xOffset = 50;
    // TENS (Sticks)
    for(let i=0; i<tens; i++) {
        svg += `<g transform="translate(${xOffset}, 40)">`;
        for(let block=0; block<10; block++) {
            svg += `<rect x="0" y="${block*15}" width="15" height="15" fill="#7c3aed" stroke="#8b5cf6" stroke-width="1.5">
                       <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" begin="${(i*10 + block)*0.02}s" />
                    </rect>`;
        }
        svg += `</g>`;
        xOffset += 25;
    }

    xOffset += 50; // space before ones

    // ONES (Cubes)
    let yOffset = 175;
    let col = 0;
    for(let i=0; i<ones; i++) {
        svg += `<rect x="${xOffset + col*20}" y="${yOffset}" width="15" height="15" fill="#06b6d4" stroke="#67e8f9" stroke-width="1.5">
                    <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" begin="${0.5 + i*0.1}s" />
                </rect>`;
        col++;
        if(col > 4) { col = 0; yOffset -= 20; }
    }

    // Labels
    svg += `<text x="${40 + (tens*25)/2}" y="220" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="Outfit">${tens} Tens</text>`;
    svg += `<text x="${xOffset + 40}" y="220" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="Outfit">${ones} Ones</text>`;
    
    svg += `</svg>`;
    return svg;
  },

  balance(leftVal, rightVal, showValue=true) {
    const diff = leftVal - rightVal;
    const tilt = diff > 0 ? 15 : diff < 0 ? -15 : 0;
    
    let svg = `<svg viewBox="0 0 500 300" width="100%" height="250" style="background:rgba(255,255,255,0.02); border-radius:12px;">`;
    const cx = 250, cy = 250;
    
    // Scale base and fulcrum
    svg += `<polygon points="${cx-40},${cy+30} ${cx+40},${cy+30} ${cx},${cy-20}" fill="#475569" />`;
    svg += `<circle cx="${cx}" cy="${cy-20}" r="8" fill="#f8fafc" />`;
    
    // Group holding the animating beam
    svg += `<g transform="rotate(${tilt}, ${cx}, ${cy-20})" style="transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1)">`;
    // Beam
    svg += `<line x1="${cx-150}" y1="${cy-20}" x2="${cx+150}" y2="${cy-20}" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>`;
    
    // Left Box
    svg += `<line x1="${cx-150}" y1="${cy-20}" x2="${cx-150}" y2="${cy-100}" stroke="#64748b" stroke-dasharray="4"/>`;
    svg += `<rect x="${cx-190}" y="${cy-150}" width="80" height="80" rx="12" fill="#7c3aed" opacity="0.9" />`;
    if(showValue) svg += `<text x="${cx-150}" y="${cy-105}" text-anchor="middle" fill="#fff" font-size="28" font-weight="bold">${leftVal}</text>`;
    else svg += `<text x="${cx-150}" y="${cy-105}" text-anchor="middle" fill="#fff" font-size="28" font-weight="bold">?</text>`;
    
    // Right Box
    svg += `<line x1="${cx+150}" y1="${cy-20}" x2="${cx+150}" y2="${cy-100}" stroke="#64748b" stroke-dasharray="4"/>`;
    svg += `<rect x="${cx+110}" y="${cy-150}" width="80" height="80" rx="12" fill="#06b6d4" opacity="0.9" />`;
    if(showValue) svg += `<text x="${cx+150}" y="${cy-105}" text-anchor="middle" fill="#fff" font-size="28" font-weight="bold">${rightVal}</text>`;
    else svg += `<text x="${cx+150}" y="${cy-105}" text-anchor="middle" fill="#fff" font-size="28" font-weight="bold">?</text>`;
    
    svg += `</g>`;
    
    if (showValue) {
        let sign = diff > 0 ? '>' : diff < 0 ? '<' : '=';
        svg += `<text x="${cx}" y="80" text-anchor="middle" fill="#f59e0b" font-size="48" font-weight="bold">${sign}</text>`;
    }
    
    svg += `</svg>`;
    return svg;
  },

  stairs(values, isAscending) {
      let svg = `<svg viewBox="0 0 500 300" width="100%" height="250" style="background:rgba(255,255,255,0.02); border-radius:12px;">`;
      
      const maxH = 200;
      const stepW = 60;
      let xOffset = 50;

      values.forEach((v, idx) => {
          // Calculate height proportional to index + 1 for visual clarity
          const height = (maxH / values.length) * (idx + 1);
          const yOffset = 250 - height;
          
          svg += `<rect x="${xOffset}" y="${yOffset}" width="${stepW}" height="${height}" fill="#10b981" opacity="0.8">
                     <animate attributeName="y" from="250" to="${yOffset}" dur="0.8s" fill="freeze" begin="${idx*0.2}s" />
                     <animate attributeName="height" from="0" to="${height}" dur="0.8s" fill="freeze" begin="${idx*0.2}s" />
                  </rect>`;
          svg += `<text x="${xOffset + stepW/2}" y="${yOffset - 10}" text-anchor="middle" fill="#fff" font-size="22" font-weight="bold">${v}</text>`;
          xOffset += stepW + 10;
      });

      // Direction Arrow
      const fromY = isAscending ? 230 : 50;
      const toY   = isAscending ? 50 : 230;
      const arrowC = isAscending ? '#3b82f6' : '#ef4444';
      
      svg += `<path d="M ${xOffset+20} ${fromY} L ${xOffset+20} ${toY}" fill="none" stroke="${arrowC}" stroke-width="6" marker-end="url(#tailarrow)"/>`;
      svg += `<defs><marker id="tailarrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${arrowC}"/></marker></defs>`;
      svg += `<text x="${xOffset+50}" y="150" fill="${arrowC}" font-size="16" font-family="Outfit" transform="rotate(-90, ${xOffset+50}, 150)">${isAscending?'Small to Large':'Large to Small'}</text>`;

      svg += `</svg>`;
      return svg;
  }
};

/* =======================================================
   GENERATORS (Learning Phase + Tasks)
   ======================================================= */
const Generators = {
  t1() { // History of Math
    return [
      {
        isLearning: true, 
        title: 'History of M: Tally Marks',
        text: `Before finding digits (0, 1, 2, 3), people used <span class="highlight-text">Tally Marks</span>. For every item, they drew a line. After 4 lines, a diagonal line makes a group of 5!`,
        visual: SVG.tally(13)
      },
      ...Array.from({length: 4}, () => {
        const n = Math.floor(Math.random() * 15) + 3;
        return {
          q: 'Count the tally marks below:',
          visual: SVG.tally(n),
          ans: n,
          choices: [n, n+1, n-2>0?n-2:n+3, n+5].sort(()=>Math.random()-0.5)
        };
      })
    ];
  },
  t2() { // Number Line
    return [
      {
        isLearning: true, 
        title: 'Jumping on the Number Line',
        text: `The <span class="highlight-text">Number Line</span> is a ruler for math! Moving right means numbers get BIGGER. Moving left means they get smaller. Let's trace the frog's jump!`,
        visual: SVG.numberLine(0, 10, [2, 7], true)
      },
      ...Array.from({length: 4}, () => {
        const max = Math.floor(Math.random()*10)+5;
        const target = Math.floor(Math.random()*max);
        return {
          q: 'Which number is hidden by the frog?',
          visual: SVG.numberLine(0, max, [target-1, target+1], false).replace('>?</text>', '>🐸</text>'),
          ans: target,
          choices: [target, target+1, target-1, target+2].sort(()=>Math.random()-0.5)
        };
      })
    ];
  },
  t3() { // Place Value
    return [
      {
        isLearning: true, 
        title: 'Building Blocks of Place Value',
        text: `Big numbers are assembled from smaller parts. A <span class="highlight-text">Ten block</span> is a stack of 10 ones. The Ones are leftover blocks. What happens when we stack them?`,
        visual: SVG.base10(3, 4)
      },
      ...Array.from({length: 4}, () => {
        const t = Math.floor(Math.random()*9)+1;
        const o = Math.floor(Math.random()*9);
        const target = t*10+o;
        return {
          q: `Count the Tens and Ones. What is the total number?`,
          visual: SVG.base10(t, o),
          ans: target,
          choices: [target, target+10, t+o, o*10+t].sort(()=>Math.random()-0.5)
        };
      })
    ];
  },
  t4() { // Missing Numbers
    return [
      {
        isLearning: true, 
        title: 'Finding the Pattern Bridge',
        text: `A <span class="highlight-text">number pattern</span> is a sequence of numbers that follow a specific rule (like skip counting by 2s or 5s). Follow the bridge to find the gap!`,
        visual: `
          <svg viewBox="0 0 500 150" width="100%" height="200" style="background:rgba(255,255,255,0.02)">
             <path d="M50 70 Q 150 20 250 70 T 450 70" fill="none" stroke="#06b6d4" stroke-width="4" stroke-dasharray="8 4"/>
             <circle cx="50" cy="70" r="20" fill="#7c3aed"/><text x="50" y="75" text-anchor="middle" fill="#fff" font-weight="bold">5</text>
             <circle cx="150" cy="45" r="20" fill="#7c3aed"/><text x="150" y="50" text-anchor="middle" fill="#fff" font-weight="bold">10</text>
             <circle cx="250" cy="70" r="20" fill="#f59e0b"/><text x="250" y="75" text-anchor="middle" fill="#fff" font-weight="bold">?</text>
             <circle cx="350" cy="45" r="20" fill="#7c3aed"/><text x="350" y="50" text-anchor="middle" fill="#fff" font-weight="bold">20</text>
             <circle cx="450" cy="70" r="20" fill="#7c3aed"/><text x="450" y="75" text-anchor="middle" fill="#fff" font-weight="bold">25</text>
             <text x="250" y="120" text-anchor="middle" fill="#94a3b8" font-size="16">Rule: +5 every jump. The missing value is 15!</text>
          </svg>
        `
      },
      ...Array.from({length: 4}, () => {
        const step = [2,5,10][Math.floor(Math.random()*3)];
        const start = Math.floor(Math.random()*5)*step;
        const seq = [start, start+step, start+2*step, start+3*step];
        const missingIdx = Math.floor(Math.random()*4);
        const ans = seq[missingIdx];
        
        let displaySeq = [...seq];
        displaySeq[missingIdx] = '?';

        return {
          q: `Identify the missing number in the sequence:`,
          visual: `<div style="font-size:3rem; letter-spacing:10px; font-weight:800; font-family:'Outfit'; text-align:center;">${displaySeq.join(', ')}</div>`,
          ans: ans,
          choices: [ans, ans+step, ans-step, ans+step*2].sort(()=>Math.random()-0.5)
        };
      })
    ];
  },
  t5() { // Comparing Numbers
    return [
      {
        isLearning: true, 
        title: 'The Great Balance Scale',
        text: `We use symbols to weigh amounts:<br><b>></b> (Greater Than) tips heavy on the left.<br><b><</b> (Less Than) tips heavy on the right.<br><b>=</b> (Equal) balances perfectly!`,
        visual: SVG.balance(45, 12, true)
      },
      ...Array.from({length: 4}, () => {
        const a = Math.floor(Math.random()*50)+1;
        let b = Math.floor(Math.random()*50)+1;
        if(a === b) b += 1;
        const ans = a > b ? '>' : '<';
        return {
          q: `Compare giving the weight scale below:`,
          visual: SVG.balance(a, b, false),
          ans: ans,
          choices: ['>', '<', '=']
        };
      })
    ];
  },
  t6() { // Ascending & Descending
    return [
      {
        isLearning: true, 
        title: 'Ordering on the Staircase',
        text: `<span class="highlight-text">Ascending</span> means building blocks up, from Smallest to Largest.<br><span class="highlight-text">Descending</span> means stepping down from Largest to Smallest.`,
        visual: SVG.stairs([12, 34, 45, 80], true)
      },
      ...Array.from({length: 4}, () => {
        const isAsc = Math.random() > 0.5;
        let nums = [Math.floor(Math.random()*15), Math.floor(Math.random()*15)+15, Math.floor(Math.random()*15)+30];
        let shuffled = [...nums].sort(()=>Math.random()-0.5);
        let ansArr = isAsc ? [...nums].sort((a,b)=>a-b) : [...nums].sort((a,b)=>b-a);
        let ansStr = ansArr.join(', ');
        
        let distract1 = [...nums].sort(()=>Math.random()-0.5).join(', ');
        let distract2 = [...nums].sort(()=>Math.random()-0.5).join(', ');
        
        return {
          q: `Sort blocks in <b>${isAsc?'Ascending':'Descending'}</b> order:`,
          visual: `<div style="font-size:2.5rem; letter-spacing:10px; font-weight:800; text-align:center;">${shuffled.join(' | ')}</div>`,
          ans: ansStr,
          choices: [ansStr, ansArr.reverse().join(', '), distract1, distract2].filter((v, i, a) => a.indexOf(v) === i).slice(0,3)
        };
      })
    ];
  }
};

/* =======================================================
   UI Binding & App Logic
   ======================================================= */
const DOM = {
  views: document.querySelectorAll('.view'),
  grid: document.getElementById('topics-grid'),
  btnHome: document.getElementById('btn-home'),
  btnBack: document.getElementById('btn-back'),
  lessonTitle: document.getElementById('lesson-title'),
  scoreVal: document.getElementById('lesson-score-val'),
  
  phaseLearning: document.getElementById('phase-learning'),
  lSubtitle: document.getElementById('learn-subtitle'),
  lVisual: document.getElementById('learn-visual'),
  lText: document.getElementById('learn-text'),
  btnUnderstood: document.getElementById('btn-understood'),
  
  phaseTask: document.getElementById('phase-task'),
  tQuestion: document.getElementById('task-question'),
  tVisual: document.getElementById('task-visual'),
  tAnswers: document.getElementById('task-answers'),
  
  modalCompletion: document.getElementById('modal-completion'),
  btnNextTopic: document.getElementById('btn-next-topic'),
  completedName: document.getElementById('completed-topic-name'),
  masteryProgress: document.getElementById('mastery-progress')
};

function init() {
  renderDashboard();
  updateProgressHeader();
  
  DOM.btnHome.onclick = () => navTo('dashboard');
  DOM.btnBack.onclick = () => navTo('dashboard');
  DOM.btnUnderstood.onclick = () => nextItem();
  DOM.btnNextTopic.onclick = () => { DOM.modalCompletion.style.display = 'none'; navTo('dashboard'); };
}

function navTo(view) {
  DOM.views.forEach(v => v.classList.remove('active'));
  document.getElementById('view-'+view).classList.add('active');
  if(view === 'dashboard') renderDashboard();
}

function renderDashboard() {
  DOM.grid.innerHTML = '';
  TOPICS.forEach((t, i) => {
    const isDone = state.progress[t.id];
    let card = document.createElement('div');
    card.className = 'topic-card glass';
    card.innerHTML = `
      <div class="topic-icon">${t.icon}</div>
      <div class="topic-title">Topic ${i+1}: ${t.title}</div>
      <div class="topic-desc">${t.desc}</div>
      <div class="topic-status ${isDone?'done':''}">${isDone ? '✨ Mastered' : '▶️ Begin Concept'}</div>
    `;
    card.onclick = () => startLesson(t);
    DOM.grid.appendChild(card);
  });
}

function updateProgressHeader() {
  const completed = Object.keys(state.progress).length;
  DOM.masteryProgress.style.width = `${(completed / TOPICS.length) * 100}%`;
}

function startLesson(topic) {
  state.currentTopicId = topic.id;
  state.topicItems = Generators[topic.id]();
  state.currentIndex = 0;
  state.score = 0;
  
  DOM.lessonTitle.textContent = topic.title;
  DOM.scoreVal.textContent = '0';
  
  navTo('lesson');
  renderCurrentItem();
}

function renderCurrentItem() {
  const item = state.topicItems[state.currentIndex];
  
  if(!item) {
    completeLesson();
    return;
  }
  
  if(item.isLearning) {
    DOM.phaseLearning.style.display = 'block';
    DOM.phaseTask.style.display = 'none';
    
    DOM.phaseLearning.style.animation = 'none';
    DOM.phaseLearning.offsetHeight; 
    DOM.phaseLearning.style.animation = null;

    DOM.lSubtitle.textContent = item.title;
    DOM.lText.innerHTML = item.text;
    DOM.lVisual.innerHTML = item.visual;
  } else {
    DOM.phaseLearning.style.display = 'none';
    DOM.phaseTask.style.display = 'block';

    DOM.phaseTask.style.animation = 'none';
    DOM.phaseTask.offsetHeight; 
    DOM.phaseTask.style.animation = null;

    DOM.tQuestion.innerHTML = item.q;
    DOM.tVisual.innerHTML = item.visual || '';
    
    DOM.tAnswers.innerHTML = '';
    item.choices.forEach(c => {
      let btn = document.createElement('button');
      btn.className = 'ans-btn';
      btn.textContent = c;
      btn.onclick = () => handleAnswer(c == item.ans, item.ans, btn);
      DOM.tAnswers.appendChild(btn);
    });
  }
}

function nextItem() {
  state.currentIndex++;
  renderCurrentItem();
}

function handleAnswer(isCorect, correctAns, btn) {
  Array.from(DOM.tAnswers.children).forEach(b => b.style.pointerEvents = 'none');
  
  if(isCorect) {
    btn.classList.add('correct');
    state.score++;
    DOM.scoreVal.textContent = state.score;
    // Tiny confetti effect could go here
    setTimeout(nextItem, 800);
  } else {
    btn.classList.add('wrong');
    Array.from(DOM.tAnswers.children).forEach(b => {
      if(b.textContent == correctAns) b.style.border = '2px solid var(--success)';
    });
    setTimeout(nextItem, 1500);
  }
}

function completeLesson() {
  state.progress[state.currentTopicId] = true;
  localStorage.setItem('num_progress', JSON.stringify(state.progress));
  updateProgressHeader();
  
  const t = TOPICS.find(x => x.id === state.currentTopicId);
  DOM.completedName.textContent = t.title;
  DOM.modalCompletion.style.display = 'flex';
}

init();
