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
  tally(n, showTotal=true) {
    let svg = `<svg viewBox="0 0 400 150" width="100%" height="200" style="background:rgba(0,0,0,0.02); border-radius:12px;">`;
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
    if (showTotal) {
      svg += `<text x="200" y="140" text-anchor="middle" fill="#475569" font-size="16" font-family="Outfit">Total: ${n}</text>`;
    }
    svg += `</svg>`;
    return svg;
  },

  numberLine(min, max, highlights=[], showHop=false, hiddenValue=null) {
    const w = 600, h = 200, pad = 40;
    const lineY = 120;
    const range = max - min;
    const step = (w - pad*2) / range;
    
    let svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="250" style="background:rgba(0,0,0,0.02); border-radius:12px;">`;
    svg += `<line x1="${pad-20}" y1="${lineY}" x2="${w-pad+20}" y2="${lineY}" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>`;
    
    for (let i = min; i <= max; i++) {
        const x = pad + (i - min) * step;
        const hl = highlights.includes(i);
        const color = hl ? '#d97706' : '#0f172a';
        const thick = hl ? 4 : 2;
        
        svg += `<line x1="${x}" y1="${lineY-10}" x2="${x}" y2="${lineY+10}" stroke="#64748b" stroke-width="${thick}"/>`;
        if (i === hiddenValue) {
            svg += `<text x="${x}" y="${lineY+35}" text-anchor="middle" fill="${color}" font-weight="${hl?'bold':'normal'}" font-size="24" font-family="Outfit">🐸</text>`;
        } else {
            svg += `<text x="${x}" y="${lineY+35}" text-anchor="middle" fill="${color}" font-weight="${hl?'bold':'normal'}" font-size="18" font-family="Outfit">${i}</text>`;
        }
        
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

  base10(tens, ones, showLabels=true) {
    let svg = `<svg viewBox="0 0 400 250" width="100%" height="250" style="background:rgba(0,0,0,0.02); border-radius:12px;">`;
    
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
    if(showLabels) {
      svg += `<text x="${40 + (tens*25)/2}" y="220" text-anchor="middle" fill="#475569" font-size="16" font-family="Outfit">${tens} Tens</text>`;
      svg += `<text x="${xOffset + 40}" y="220" text-anchor="middle" fill="#475569" font-size="16" font-family="Outfit">${ones} Ones</text>`;
    }
    
    svg += `</svg>`;
    return svg;
  },

  balance(leftVal, rightVal, showValue=true) {
    const diff = leftVal - rightVal;
    
    let svg = `<svg viewBox="0 0 500 250" width="100%" height="250" style="background:rgba(0,0,0,0.02); border-radius:12px; overflow:visible;">
      <style>
        .group-l { animation: clashMoveL 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .group-r { animation: clashMoveR 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes clashMoveL { 0% { transform: translateX(-150px); } 30%, 100% { transform: translateX(0); } }
        @keyframes clashMoveR { 0% { transform: translateX(150px); } 30%, 100% { transform: translateX(0); } }
        
        .clash-win { animation: clashWinEff 1s forwards; }
        .clash-lose { animation: clashLoseEff 1s forwards; }
        .clash-eq { animation: clashEqEff 1s forwards; }
        
        @keyframes clashWinEff { 0%, 30% { transform: scale(1); } 40% { transform: scale(1.3); } 100% { transform: scale(1.15); } }
        @keyframes clashLoseEff { 0%, 30% { transform: scale(1) rotate(0); opacity:1;} 40%, 100% { transform: scale(0.6) rotate(-20deg) translateY(30px); opacity:0.4; filter: grayscale(0.8); } }
        @keyframes clashEqEff { 0%, 30% { transform: scale(1); } 40% { transform: scale(1.1); } 100% { transform: scale(1); } }
        
        .clash-boom { animation: clashBoomEff 1s forwards; }
        @keyframes clashBoomEff { 0%, 25% { transform: scale(0); opacity: 0; } 35% { transform: scale(1.5); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        
        .clash-spark { animation: clashSparkEff 1s forwards; }
        @keyframes clashSparkEff { 0%, 29% { opacity: 0; transform: scale(0); } 30% { opacity: 1; transform: scale(1); } 50%, 100% { opacity: 0; transform: scale(2.5); } }
      </style>
      <defs>
         <filter id="clash-glow" x="-20%" y="-20%" width="140%" height="140%">
           <feGaussianBlur stdDeviation="5" result="blur" />
           <feComposite in="SourceGraphic" in2="blur" operator="over" />
         </filter>
      </defs>
    `;

    const leftCls = diff > 0 ? 'clash-win' : diff < 0 ? 'clash-lose' : 'clash-eq';
    const rightCls = diff < 0 ? 'clash-win' : diff > 0 ? 'clash-lose' : 'clash-eq';

    svg += `<g class="clash-spark" style="transform-origin: 250px 125px;">
              <circle cx="250" cy="125" r="40" fill="none" stroke="#f59e0b" stroke-width="8" />
              <polygon points="250,75 260,115 300,125 260,135 250,175 240,135 200,125 240,115" fill="#f59e0b" />
            </g>`;

    svg += `<g class="group-l">
              <g class="${leftCls}" style="transform-origin: 180px 125px;">
                <rect x="130" y="75" width="100" height="100" rx="16" fill="#7c3aed" filter="${diff>0 ? 'url(#clash-glow)' : 'none'}"/>
                <text x="180" y="140" text-anchor="middle" fill="#fff" font-size="40" font-weight="900" font-family="Outfit">${leftVal}</text>
              </g>
            </g>`;

    svg += `<g class="group-r">
              <g class="${rightCls}" style="transform-origin: 320px 125px;">
                <rect x="270" y="75" width="100" height="100" rx="16" fill="#06b6d4" filter="${diff<0 ? 'url(#clash-glow)' : 'none'}"/>
                <text x="320" y="140" text-anchor="middle" fill="#fff" font-size="40" font-weight="900" font-family="Outfit">${rightVal}</text>
              </g>
            </g>`;

    if (showValue) {
        let sign = diff > 0 ? '>' : diff < 0 ? '<' : '=';
        svg += `<text x="250" y="145" text-anchor="middle" fill="#d97706" font-size="60" font-weight="900" class="clash-boom" style="transform-origin: 250px 125px;">${sign}</text>`;
    } else {
        svg += `<g class="clash-boom" style="transform-origin: 250px 125px;">
                  <circle cx="250" cy="125" r="30" fill="#f8fafc" stroke="#e2e8f0" stroke-width="4"/>
                  <text x="250" y="137" text-anchor="middle" fill="#94a3b8" font-size="30" font-weight="900">?</text>
                </g>`;
    }
    
    svg += `</svg>`;
    return svg;
  },

  stairs(values, isAscending) {
      let svg = `<svg viewBox="0 0 500 300" width="100%" height="250" style="background:rgba(0,0,0,0.02); border-radius:12px;">`;
      
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
          svg += `<text x="${xOffset + stepW/2}" y="${yOffset - 10}" text-anchor="middle" fill="#0f172a" font-size="22" font-weight="bold">${v}</text>`;
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
const shuffle = (array) => {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const Generators = {
  t1() { // History of Math
    return [
      {
        isLearning: true, 
        title: 'History of Math: Tally Marks',
        text: `Before finding digits (0, 1, 2, 3), people used <span class="highlight-text">Tally Marks</span>. For every item, they drew a line. After 4 lines, a diagonal line makes a group of 5!`,
        visual: SVG.tally(13)
      },
      {
        isLearning: true, 
        title: 'How to count quickly',
        text: `See how easy it is to count by 5s? Below we have two full groups of 5. That makes 10!`,
        visual: SVG.tally(10)
      },
      ...Array.from({length: 3}, () => {
        const n = Math.floor(Math.random() * 8) + 3; // 3 to 10
        return {
          q: 'Count the tally marks below:',
          visual: SVG.tally(n, false),
          ans: n,
          choices: shuffle(Array.from(new Set([n, n+1, n-2>0?n-2:n+3, n+5, n+2, n+4])).slice(0,4)),
          hint: "Count the vertical lines. A diagonal line crossing them makes a group of 5!"
        };
      }),
      {
        isLearning: true, 
        title: 'Building Larger Numbers',
        text: `We can keep adding groups of 5 to make even bigger numbers! If we have three groups of 5, that's 15. Plus 4 more is 19.`,
        visual: SVG.tally(19)
      },
      ...Array.from({length: 3}, () => {
        const n = Math.floor(Math.random() * 10) + 11; // 11 to 20
        return {
          q: 'Count the tally marks below:',
          visual: SVG.tally(n, false),
          ans: n,
          choices: shuffle(Array.from(new Set([n, n+2, n-2>0?n-2:n+3, n+5, n-1>0?n-1:n+4, n+1])).slice(0,4)),
          hint: "Count the vertical lines. A diagonal line crossing them makes a group of 5!"
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
      {
        isLearning: true, 
        title: 'Forward Jumping',
        text: `If we start at 3 and jump forward 4 steps, we land on 7! Watch the frog track the steps.`,
        visual: SVG.numberLine(0, 10, [3, 7], true)
      },
      ...Array.from({length: 3}, () => {
        const max = 10;
        const target = Math.floor(Math.random()*(max-1))+1;
        return {
          q: 'Which number is hidden by the frog?',
          visual: SVG.numberLine(0, max, [], false, target),
          ans: target,
          choices: shuffle(Array.from(new Set([target, target+1, target-1<=0?target+3:target-1, target+2, target+4])).slice(0,4)),
          hint: "Look at the numbers before and after the frog. What comes between them?"
        };
      }),
      {
        isLearning: true, 
        title: 'Longer Lines',
        text: `The number line can go on forever! Let's look at a line from 10 to 20. The frog is jumping from 12 to 18!`,
        visual: SVG.numberLine(10, 20, [12, 18], true)
      },
      ...Array.from({length: 3}, () => {
        const min = Math.floor(Math.random()*10)*10; // 0, 10, 20
        const max = min + 10;
        const target = Math.floor(Math.random()*(max-min-1))+min+1;
        return {
          q: 'Which number is hidden by the frog?',
          visual: SVG.numberLine(min, max, [], false, target),
          ans: target,
          choices: shuffle(Array.from(new Set([target, target+1, target-1<0?target+3:target-1, target+2, target+4])).slice(0,4)),
          hint: "Look at the numbers before and after the frog. What comes right between them?"
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
      {
        isLearning: true, 
        title: 'Breaking down a number',
        text: `The number 23 has a 2 in the Tens place, and a 3 in the Ones place. That means 2 stacks of Ten, and 3 little One blocks!`,
        visual: SVG.base10(2, 3)
      },
      ...Array.from({length: 3}, () => {
        const t = Math.floor(Math.random()*2)+1; // 1 to 2
        const o = Math.floor(Math.random()*9);
        const target = t*10+o;
        return {
          q: `Count the Tens and Ones. What is the total number?`,
          visual: SVG.base10(t, o, false),
          ans: target,
          choices: shuffle(Array.from(new Set([target, target+10, t+o, o*10+t, target+1, target-1<0?target+5:target-1])).slice(0,4)),
          hint: "Each purple stack is 10. Each tiny blue block is 1. Count by tens first, then add the ones!"
        };
      }),
      {
        isLearning: true, 
        title: 'Zero Ones!',
        text: `What happens if we have 4 Tens but ZERO Ones? The number is exactly 40. The zero holds the empty place!`,
        visual: SVG.base10(4, 0)
      },
      ...Array.from({length: 3}, () => {
        const t = Math.floor(Math.random()*6)+3; // 3 to 8
        const o = Math.floor(Math.random()*10);
        const target = t*10+o;
        return {
          q: `Count the Tens and Ones. What is the total number?`,
          visual: SVG.base10(t, o, false),
          ans: target,
          choices: shuffle(Array.from(new Set([target, target+10, t+o, o*10+t, target+1, target-1<0?target+5:target-1])).slice(0,4)),
          hint: "Each purple stack is 10. Each tiny blue block is 1. Count by tens first, then add the ones!"
        };
      })
    ];
  },
  t4() { // Missing Numbers
    const getBridgeSVG = (nums, rule) => {
        let svg = `<svg viewBox="0 0 500 150" width="100%" height="200" style="background:rgba(0,0,0,0.02)">
             <path d="M50 70 Q 150 20 250 70 T 450 70" fill="none" stroke="#06b6d4" stroke-width="4" stroke-dasharray="8 4"/>`;
        const xPos = [50, 150, 250, 350, 450];
        const yPos = [70, 45, 70, 45, 70];
        nums.forEach((n, i) => {
           let col = n === '?' ? '#f59e0b' : '#7c3aed';
           svg += `<circle cx="${xPos[i]}" cy="${yPos[i]}" r="20" fill="${col}"/><text x="${xPos[i]}" y="${yPos[i]+5}" text-anchor="middle" fill="#fff" font-weight="bold">${n}</text>`;
        });
        if(rule) svg += `<text x="250" y="130" text-anchor="middle" fill="#475569" font-size="16">${rule}</text>`;
        svg += `</svg>`;
        return svg;
    };
    return [
      {
        isLearning: true, 
        title: 'Finding the Pattern Bridge',
        text: `A <span class="highlight-text">number pattern</span> is a sequence of numbers that follow a specific rule (like skip counting by 2s or 5s). Follow the bridge to find the gap!`,
        visual: getBridgeSVG([5, 10, '?', 20, 25], "Rule: +5 every jump. The missing value is 15!")
      },
      {
        isLearning: true, 
        title: 'Finding the Rule',
        text: `To find the rule, look at two numbers touching each other. From 2 to 4 is a jump of +2. So the missing number after 6 must be 6 + 2 = 8!`,
        visual: getBridgeSVG([2, 4, 6, '?', 10], "Rule: +2 every jump. 6 + 2 = 8")
      },
      ...Array.from({length: 3}, () => {
        const step = [2,3,5][Math.floor(Math.random()*3)];
        const start = Math.floor(Math.random()*5)*step;
        const seq = [start, start+step, start+2*step, start+3*step, start+4*step];
        const missingIdx = 4; // end
        const ans = seq[missingIdx];
        
        let displaySeq = [...seq];
        displaySeq[missingIdx] = '?';

        return {
          q: `Identify the missing number in the sequence:`,
          visual: getBridgeSVG(displaySeq, ""),
          ans: ans,
          choices: shuffle(Array.from(new Set([ans, ans+step, ans-step<0?ans+step*3:ans-step, ans+step*2, ans+1])).slice(0,4)),
          hint: "Find two numbers next to each other to figure out the jumping rule (like +2 or +5)!"
        };
      }),
      {
        isLearning: true, 
        title: 'Gaps in the Middle',
        text: `Sometimes the missing bridge piece is in the middle. We can use the start of the bridge, or the end of the bridge to find the rule!`,
        visual: getBridgeSVG([10, 20, '?', 40, 50], "Rule: +10! 20 + 10 = 30.")
      },
      ...Array.from({length: 3}, () => {
        const step = [2,5,10][Math.floor(Math.random()*3)];
        const start = Math.floor(Math.random()*10)*step+5;
        const seq = [start, start+step, start+2*step, start+3*step, start+4*step];
        const missingIdx = Math.floor(Math.random()*3)+1; // 1, 2, or 3
        const ans = seq[missingIdx];
        
        let displaySeq = [...seq];
        displaySeq[missingIdx] = '?';

        return {
          q: `Identify the missing number in the sequence:`,
          visual: getBridgeSVG(displaySeq, ""),
          ans: ans,
          choices: shuffle(Array.from(new Set([ans, ans+step, ans-step<0?ans+step*3:ans-step, ans+step*2, ans+1])).slice(0,4)),
          hint: "Find two numbers next to each other to figure out the jumping rule (like +2 or +5)!"
        };
      })
    ];
  },
  t5() { // Comparing Numbers
    return [
      {
        isLearning: true, 
        title: 'Number Clash!',
        text: `Numbers can go Head-to-Head! The GREATER number uses its power to grow bigger, while the smaller number is squished! Watch the <span class="highlight-text">Number Clash</span> happen!`,
        visual: SVG.balance(45, 12, true)
      },
      {
        isLearning: true, 
        title: 'The Power Symbol',
        text: `When they clash, a Power Symbol appears! The wide open mouth always opens towards the winning, BIGGER number!<br><b>8 > 3</b> (8 defeats 3)`,
        visual: SVG.balance(8, 3, true)
      },
      ...Array.from({length: 3}, () => {
        const a = Math.floor(Math.random()*20)+1;
        let b = Math.floor(Math.random()*20)+1;
        if(a === b) b += 1;
        const ans = a > b ? '>' : '<';
        return {
          q: `Compare using the Number Clash below:`,
          visual: SVG.balance(a, b, false),
          ans: ans,
          choices: ['>', '<', '='],
          hint: "Look at the numbers! Which one is bigger? The open mouth always eats the winning BIGGER number!"
        };
      }),
      {
        isLearning: true, 
        title: 'Clashing Large Numbers',
        text: `When comparing large numbers like 82 and 45, look at the Tens place first! 8 Tens defeats 4 Tens, so 82 > 45!`,
        visual: SVG.balance(82, 45, true)
      },
      ...Array.from({length: 3}, () => {
        const a = Math.floor(Math.random()*70)+30;
        let b = Math.floor(Math.random()*70)+30;
        if(a === b) b += 5;
        const ans = a > b ? '>' : '<';
        return {
          q: `Compare using the Number Clash below:`,
          visual: SVG.balance(a, b, false),
          ans: ans,
          choices: ['>', '<', '='],
          hint: "Look at the numbers! Which one is bigger? The open mouth always eats the winning BIGGER number!"
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
      {
        isLearning: true, 
        title: 'Small to Large (Ascending)',
        text: `If we have 50, 10, and 30... The smallest is 10. Then 30. Then 50 is the largest! 10, 30, 50.`,
        visual: SVG.stairs([10, 30, 50], true)
      },
      ...Array.from({length: 3}, () => {
        let nums = [Math.floor(Math.random()*15), Math.floor(Math.random()*15)+15, Math.floor(Math.random()*15)+30];
        let shuffled = [...nums].sort(()=>Math.random()-0.5);
        let ansArr = [...nums].sort((a,b)=>a-b);
        let ansStr = ansArr.join(', ');
        
        let distract1 = shuffle(nums).join(', ');
        let distract2 = shuffle(nums).join(', ');
        
        return {
          q: `Sort blocks in <b>Ascending</b> order:`,
          visual: `<div style="font-size:2.5rem; letter-spacing:10px; font-weight:800; text-align:center;">${shuffled.join(' | ')}</div>`,
          ans: ansStr,
          choices: shuffle(Array.from(new Set([ansStr, ansArr.reverse().join(', '), distract1, distract2, shuffle(nums).join(', ')])).slice(0,3)),
          hint: "Ascending means stepping UP: Small to Large."
        };
      }),
      {
        isLearning: true, 
        title: 'Large to Small (Descending)',
        text: `Descending is stepping down from the top! If we have 25, 99, 44... The largest is 99, then 44, then 25 at the bottom.`,
        visual: SVG.stairs([99, 44, 25], false)
      },
      ...Array.from({length: 3}, () => {
        let nums = [Math.floor(Math.random()*20)+5, Math.floor(Math.random()*20)+30, Math.floor(Math.random()*30)+60, Math.floor(Math.random()*20)+100];
        let shuffled = [...nums].sort(()=>Math.random()-0.5);
        let ansArr = [...nums].sort((a,b)=>b-a);
        let ansStr = ansArr.join(', ');
        
        let distract1 = shuffle(nums).join(', ');
        let distract2 = shuffle(nums).join(', ');
        
        return {
          q: `Sort blocks in <b>Descending</b> order:`,
          visual: `<div style="font-size:2.5rem; letter-spacing:10px; font-weight:800; text-align:center;">${shuffled.join(' | ')}</div>`,
          ans: ansStr,
          choices: shuffle(Array.from(new Set([ansStr, ansArr.reverse().join(', '), distract1, distract2, shuffle(nums).join(', ')])).slice(0,3)),
          hint: "Descending means stepping DOWN: Large to Small."
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
  scoreMax: document.getElementById('lesson-score-max'),
  
  phaseLearning: document.getElementById('phase-learning'),
  lSubtitle: document.getElementById('learn-subtitle'),
  lVisual: document.getElementById('learn-visual'),
  lText: document.getElementById('learn-text'),
  btnUnderstood: document.getElementById('btn-understood'),
  
  phaseTask: document.getElementById('phase-task'),
  tQuestion: document.getElementById('task-question'),
  tVisual: document.getElementById('task-visual'),
  tAnswers: document.getElementById('task-answers'),
  hintContainer: document.getElementById('task-hint-container'),
  btnShowHint: document.getElementById('btn-show-hint'),
  hintText: document.getElementById('hint-text'),
  
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
  DOM.btnShowHint.onclick = () => {
    DOM.hintText.style.display = 'block';
    DOM.btnShowHint.style.display = 'none';
  };
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
  DOM.scoreMax.textContent = state.topicItems.filter(i => !i.isLearning).length;
  
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
    
    if (item.hint) {
      DOM.hintContainer.style.display = 'block';
      DOM.hintText.style.display = 'none';
      DOM.hintText.innerHTML = `<strong>Hint:</strong> ${item.hint}`;
      DOM.btnShowHint.style.display = 'block';
    } else {
      DOM.hintContainer.style.display = 'none';
    }
    
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
