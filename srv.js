const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const FLAGS = {
  easy: "CTF{filter_bypass_achieved}",
  medium: "CTF{xss_executed_successfully}",
  hard: "CTF{rce_simulated_correctly}",
  god: "CTF{rooted_through_mind_twist}",
  expert: "CTF{chained_bypass_mastermind}"
};

const htmlWrapper = (title, body) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
    <div class="max-w-xl w-full">
      <div class="bg-gray-800 p-6 rounded-2xl shadow-xl">
        <h1 class="text-3xl font-bold mb-4 text-center">${title}</h1>
        ${body}
      </div>
    </div>
  </body>
  </html>
`;

app.get('/', (req, res) => {
  res.send(htmlWrapper("Radzz CTF Web", `
    <p class="mb-4">Choose your difficulty:</p>
    <div class="flex flex-col gap-2">
      <a href="/easy" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-center">Easy</a>
      <a href="/medium" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-xl text-center">Medium</a>
      <a href="/hard" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-center">Hard</a>
      <a href="/god" class="bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-xl text-center">GOD MODE</a>
      <a href="/expert" class="bg-pink-700 hover:bg-pink-800 px-4 py-2 rounded-xl text-center">EXPERT</a>
    </div>
  `));
});

// EASY
app.get('/easy', (req, res) => {
  res.send(htmlWrapper("Easy Challenge", `
    <form method="POST" class="flex flex-col gap-2">
      <input name="username" placeholder="username" class="bg-gray-700 p-2 rounded" />
      <input name="password" placeholder="password" class="bg-gray-700 p-2 rounded" />
      <button type="submit" class="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded">Login</button>
      <p class="text-xs mt-2">Hint: SQLi logic trap + advanced filter. Easy? Not really.</p>
    </form>
  `));
});

app.post('/easy', (req, res) => {
  const { username, password } = req.body;
  const blocked = /(select|union|from|where|sleep|--|;|'|"|%27|%22|%3D|%3B|%20)/gi;
  if (username === 'admin' && /or\s+1=1/i.test(password) && !blocked.test(password)) {
    res.send(htmlWrapper("Flag", `Login bypassed! Flag: ${FLAGS.easy}`));
  } else {
    res.send(htmlWrapper("Fail", `Filtered or invalid input.`));
  }
});

// MEDIUM
app.get('/medium', (req, res) => {
  const q = req.query.q || '';
  const filtered = q.replace(/(script|onerror|onload|alert|img|svg|iframe|object|src|data|fetch|form|input)/gi, '');
  res.send(htmlWrapper("Medium Challenge", `
    <p>Can you break the DOM?</p>
    <form>
      <input name="q" placeholder="Enter your payload" class="bg-gray-700 p-2 rounded mb-2" />
      <button type="submit" class="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded">Submit</button>
    </form>
    <hr class="my-4" />
    <div id="output">You said: ${filtered}</div>
    <script>
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) {
        document.getElementById("output").innerHTML = q;
      }
    </script>
    <p class="text-xs mt-2">Hint: Encoded payloads & sneaky events FTW.</p>
  `));
});

// HARD
app.get('/hard', (req, res) => {
  res.send(htmlWrapper("Hard Challenge", `
    <p>Only a precise command will trigger the RCE simulation.</p>
    <form method="POST" class="flex flex-col gap-2">
      <input name="cmd" placeholder="command" class="bg-gray-700 p-2 rounded" />
      <button type="submit" class="bg-red-700 hover:bg-red-800 px-4 py-2 rounded">Execute</button>
    </form>
    <p class="text-xs mt-2">Hint: Command chaining helps. Try curl & logical shell tricks.</p>
  `));
});

app.post('/hard', (req, res) => {
  const { cmd } = req.body;
  const pattern = /(curl|wget)\s+['"]?http:\/\/.*\/rce['"]?.*(\||&&)/i;
  if (pattern.test(cmd)) {
    res.send(htmlWrapper("Flag", `Simulated RCE success! Flag: ${FLAGS.hard}`));
  } else {
    res.send(htmlWrapper("Fail", `No RCE detected.`));
  }
});

// GOD MODE
app.get('/god', (req, res) => {
  res.send(htmlWrapper("GOD MODE", `
    <p>This level is evil. Only the elite proceed.</p>
    <ol class="list-decimal ml-5">
      <li>Decode this string: <code>YWRtaW4gfCBiZXN0</code></li>
      <li>Login at: <a href="/god/login" class="underline text-purple-400">/god/login</a></li>
    </ol>
    <p class="text-xs mt-2">Hint: Think like a system, not like a human.</p>
  `));
});

app.get('/god/login', (req, res) => {
  res.send(htmlWrapper("GOD LOGIN", `
    <form method="POST" class="flex flex-col gap-2">
      <input name="user" placeholder="user" class="bg-gray-700 p-2 rounded" />
      <input name="pass" placeholder="pass" class="bg-gray-700 p-2 rounded" />
      <button type="submit" class="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded">Enter</button>
    </form>
  `));
});

app.post('/god/login', (req, res) => {
  const { user, pass } = req.body;
  if (user === 'admin' && pass === ' | best') {
    res.send(htmlWrapper("Final Step", `
      <p>Inject a payload to this parameter: <code>?godxss=</code></p>
      <p>Only crafted DOM-based payload will work.</p>
      <a href="/god/final?godxss=" class="underline text-purple-400">Try here</a>
    `));
  } else {
    res.send(htmlWrapper("Fail", `Wrong combo.`));
  }
});

app.get('/god/final', (req, res) => {
  const input = req.query.godxss || '';
  res.send(htmlWrapper("Final Test", `
    <div>Input received:</div>
    <div id="out">${input}</div>
    <script>
      const x = new URLSearchParams(window.location.search).get("godxss");
      if (x) document.getElementById("out").innerHTML = x;
    </script>
    <p class="text-xs mt-2">Hint: Encode smart, evade filters, pop the flag.</p>
  `));
});

// EXPERT
app.get('/expert', (req, res) => {
  res.send(htmlWrapper("EXPERT CTF MODE", `
    <p>Advanced attack vector detection.</p>
    <form method="POST" class="flex flex-col gap-2">
      <textarea name="payload" placeholder="Inject your payload here..." class="bg-gray-700 p-2 rounded h-32"></textarea>
      <button type="submit" class="bg-pink-700 hover:bg-pink-800 px-4 py-2 rounded">Inject</button>
    </form>
    <p class="text-xs mt-2">Hint: Stored + reflected + CSP simulation. Play like a blackhat, think like a dev.</p>
  `));
});

app.post('/expert', (req, res) => {
  const { payload } = req.body;
  const dangerous = /(script|onerror|onload|iframe|srcdoc|data:|fetch|<|>|"|')/gi;
  const safePayload = payload.replace(dangerous, '[x]');
  
  if (/<svg.*onload=/.test(payload) || /<img.*onerror=/.test(payload)) {
    res.send(htmlWrapper("Flag", `Multi-layered bypass detected! Flag: ${FLAGS.expert}`));
  } else {
    res.send(htmlWrapper("Stored Simulation", `
      <p>Stored content processed:</p>
      <div class="bg-gray-800 p-2 mt-2 rounded text-sm" id="sandbox">${safePayload}</div>
      <script>
        const data = ${JSON.stringify(payload)};
        const sink = document.getElementById("sandbox");
        setTimeout(() => {
          try {
            sink.innerHTML = data;
          } catch (e) {
            sink.innerText = "Execution blocked";
          }
        }, 500);
      </script>
      <p class="mt-4">Flag triggers only with right multi-layered attack.</p>
    `));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CTF backend running: http://0.0.0.0:${PORT}`);
});
