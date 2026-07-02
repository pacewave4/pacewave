// === DATA ===
const books = [
  {id:1,title:"Atomic Habits",author:"James Clear",cat:"Self-Help",rating:4.8,cover:"https://picsum.photos/seed/a1/300/400",content:"Habits are the compound interest of self-improvement. You do not rise to the level of your goals. You fall to the level of your systems. Clear and useful habits transform your behavior. Every habit starts with a cue, then a routine, then a reward. ".repeat(20)},
  {id:2,title:"Project Hail Mary",author:"Andy Weir",cat:"Science",rating:4.9,cover:"https://picsum.photos/seed/a2/300/400",content:"Space exploration meets survival in this thrilling adventure. A lone astronaut must rely on ingenuity and problem-solving to survive impossible odds. ".repeat(20)},
  {id:3,title:"The Silent Patient",author:"Alex Michaelides",cat:"Mystery",rating:4.6,cover:"https://picsum.photos/seed/a3/300/400",content:"A psychological thriller that keeps you guessing until the final page. A woman shoots her husband and then never speaks again. ".repeat(20)},
  {id:4,title:"Deep Work",author:"Cal Newport",cat:"Business",rating:4.7,cover:"https://picsum.photos/seed/a4/300/400",content:"Focus in a distracted world is a rare and valuable skill. Deep work produces the best results and the most satisfaction. ".repeat(20)},
  {id:5,title:"Sapiens",author:"Yuval Noah Harari",cat:"History",rating:4.9,cover:"https://picsum.photos/seed/a5/300/400",content:"A brief history of humankind from the age of hunter-gatherers to the present. ".repeat(20)},
  {id:6,title:"Educated",author:"Tara Westover",cat:"Education",rating:4.8,cover:"https://picsum.photos/seed/a6/300/400",content:"A memoir of learning and self-discovery against all odds. ".repeat(20)},
  {id:7,title:"The Love Hypothesis",author:"Ali Hazelwood",cat:"Romance",rating:4.5,cover:"https://picsum.photos/seed/a7/300/400",content:"Fake dating turns into something real in this charming romance. ".repeat(20)},
  {id:8,title:"Dune",author:"Frank Herbert",cat:"Fiction",rating:4.9,cover:"https://picsum.photos/seed/a8/300/400",content:"Desert planet politics and intrigue in this epic science fiction masterpiece. ".repeat(20)},
];

const categories = ["Fiction","Romance","Mystery","Science","Business","Self-Help","History","Education"];

// === STATE ===
let currentBook = null;
let currentChapter = 0;
let fontSize = 18;

// === NETLIFY DB HELPERS ===
const DB = {
  user: null,
  async get(key) {
    if (this.user) {
      try {
        const res = await fetch(`/.netlify/functions/get-data?key=${key}`, {headers: {Authorization: `Bearer ${this.user.token.access_token}`}});
        if(res.ok) return (await res.json()).value;
      } catch(e) {}
    }
    return JSON.parse(localStorage.getItem(key) || 'null');
  },
  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    if (this.user) {
      try {
        await fetch(`/.netlify/functions/set-data`, {
          method: 'POST',
          headers: {Authorization: `Bearer ${this.user.token.access_token}`, 'Content-Type':'application/json'},
          body: JSON.stringify({key, value})
        });
      } catch(e) {}
    }
  }
};

// === INIT ===
window.onload = () => {
  renderFeatured();
  renderNew();
  renderCats();
  createFloatingBooks();
  observeFade();
  loadTheme();
  loadFontPref();
  netlifyIdentity.on('login', user => { DB.user = user; document.getElementById('authBtn').innerText = 'Logout'; syncFromCloud(); });
  netlifyIdentity.on('logout', () => { DB.user = null; document.getElementById('authBtn').innerText = 'Login'; });
  if(netlifyIdentity.currentUser()) { DB.user = netlifyIdentity.currentUser(); document.getElementById('authBtn').innerText = 'Logout'; }
};

// === VIEWS ===
function showView(view){
  document.getElementById('homeView').style.display = view==='home' ? 'block' : 'none';
  document.getElementById('libraryView').style.display = view==='library' ? 'block' : 'none';
  document.getElementById('readerView').style.display = 'none';
  window.scrollTo(0,0);
}

function backToLibrary(){
  document.getElementById('readerView').style.display = 'none';
  document.getElementById('libraryView').style.display = 'block';
  currentBook = null;
  window.scrollTo(0,0);
}

// === LIBRARY RENDER ===
function bookCard(b){
  return `
  <div class="card fade">
    <img src="${b.cover}" loading="lazy" alt="${b.title}">
    <h3>${b.title}</h3>
    <p>${b.author}</p>
    <p class="rating">★ ${b.rating}</p>
    <button class="btn" style="width:100%;margin-top:8px" onclick='openReader(${b.id})'>Read</button>
  </div>`;
}

function renderFeatured(){
  const wrap = document.getElementById('featuredCarousel');
  wrap.innerHTML = books.slice(0,5).map(bookCard).join('');
}

function renderNew(){
  const wrap = document.getElementById('newCarousel');
  wrap.innerHTML = books.slice(3).map(bookCard).join('');
}

function renderCats(){
  const grid = document.getElementById('catGrid');
  grid.innerHTML = categories.map(cat=>`
    <div class="cat-card glass fade" onclick="openCategory('${cat}')">
      <h3>${cat}</h3>
    </div>
  `).join('');
}

function openCategory(cat){
  showView('library');
  document.getElementById('booksTitle').innerText = cat;
  const filtered = books.filter(b=>b.cat===cat);
  document.getElementById('booksGrid').innerHTML = filtered.map(bookCard).join('');
}

function liveSearch(q){
  if(!q){document.getElementById('booksGrid').innerHTML = books.map(bookCard).join(''); document.getElementById('booksTitle').innerText='All Books'; return}
  showView('library');
  const res = books.filter(b=> 
    b.title.toLowerCase().includes(q.toLowerCase()) ||
    b.author.toLowerCase().includes(q.toLowerCase()) ||
    b.cat.toLowerCase().includes(q.toLowerCase())
  );
  document.getElementById('booksTitle').innerText = 'Search Results';
  document.getElementById('booksGrid').innerHTML = res.map(bookCard).join('');
}

// === READER ===
function openReader(bookId){
  currentBook = books.find(b => b.id === bookId);
  if(!currentBook) return;
  showView('reader');
  document.getElementById('readerView').style.display = 'block';
  document.getElementById('libraryView').style.display = 'none';
  setupChapterSelect();
  loadChapter(0);
  window.addEventListener('scroll', updateProgress);
}

function setupChapterSelect(){
  const select = document.getElementById('chapterSelect');
  select.innerHTML = '';
  for(let i = 0; i < 5; i++){
    const option = document.createElement('option');
    option.value = i;
    option.text = `Chapter ${i + 1}`;
    select.appendChild(option);
  }
  select.value = 0;
}

async function loadChapter(index){
  currentChapter = parseInt(index);
  document.getElementById('chapterTitle').innerText = currentBook.title;
  document.getElementById('chapterAuthor').innerText = `by ${currentBook.author} • Chapter ${currentChapter + 1}`;
  
  const chapterSize = currentBook.content.length / 5;
  const start = currentChapter * chapterSize;
  const end = (currentChapter + 1) * chapterSize;
  const chapterContent = currentBook.content.substring(start, end);
  
  document.getElementById('chapterText').innerHTML = `<p>${chapterContent}</p>`;
  
  const progress = await DB.get('reading') || {};
  progress[currentBook.id] = currentChapter;
  DB.set('reading', progress);
  
  window.scrollTo(0, 0);
  updateProgress();
}

function nextChapter(){ if(currentChapter < 4){ loadChapter(currentChapter + 1); document.getElementById('chapterSelect').value = currentChapter; }}
function prevChapter(){ if(currentChapter > 0){ loadChapter(currentChapter - 1); document.getElementById('chapterSelect').value = currentChapter; }}

function changeFont(){
  const font = document.getElementById('fontSelect').value;
  const family = font === 'Georgia' ? 'Georgia, serif' : font === 'Merriweather' ? 'Merriweather, serif' : 'Inter, system-ui';
  document.getElementById('chapterText').style.fontFamily = family;
}

function changeSize(size){
  fontSize = parseInt(size);
  document.getElementById('chapterText').style.fontSize = fontSize + 'px';
  document.getElementById('sizeDisplay').innerText = size + 'px';
  DB.set('fontSize', fontSize);
}

async function loadFontPref(){
  const saved = await DB.get('fontSize');
  if(saved){
    fontSize = saved;
    document.getElementById('sizeRange').value = fontSize;
    changeSize(fontSize);
  }
}

function searchText(query){
  const text = document.getElementById('chapterText');
  if(!query){ text.innerHTML = text.innerHTML.replace(/<mark>/g, '').replace(/<\/mark>/g, ''); return; }
  const regex = new RegExp(`(${query})`, 'gi');
  const cleaned = text.innerHTML.replace(/<mark>/g, '').replace(/<\/mark>/g, '');
  text.innerHTML = cleaned.replace(regex, '<mark>$1</mark>');
}

function updateProgress(){
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0;
  document.getElementById('progressBar').style.width = p + '%';
}

async function toggleBookmark(){
  if(!currentBook) return;
  let bm = await DB.get('bm') || [];
  if(!bm.includes(currentBook.id)) bm.push(currentBook.id);
  DB.set('bm', bm);
  alert('Progress saved to cloud ✓');
}

function toggleTheme(){
  document.documentElement.classList.toggle('light');
  DB.set('theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
}
async function loadTheme(){
  if((await DB.get('theme'))==='light') document.documentElement.classList.add('light');
}

function createFloatingBooks(){
  const wrap = document.getElementById('floatBooks');
  for(let i=0;i<8;i++){
    const div = document.createElement('div');
    div.className = 'book-float';
    div.style.left = Math.random()*90 + '%';
    div.style.top = Math.random()*90 + '%';
    div.style.animationDelay = i + 's';
    wrap.appendChild(div);
  }
}

function observeFade(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting) e.target.classList.add('show')})
  },{threshold:0.1});
  document.querySelectorAll('.fade').forEach(el=>obs.observe(el));
}

window.onscroll = () => {
  document.getElementById('backTop').style.display = window.scrollY > 400 ? 'block' : 'none';
}

async function syncFromCloud(){
  const theme = await DB.get('theme'); if(theme==='light') document.documentElement.classList.add('light');
  const fs = await DB.get('fontSize'); if(fs){fontSize=fs; document.getElementById('sizeRange').value=fs; changeSize(fs);}
    }
