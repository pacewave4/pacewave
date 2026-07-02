const books = [
  {id:1,title:"Atomic Habits",author:"James Clear",cat:"Self-Help",rating:4.8,cover:"https://picsum.photos/seed/a1/300/400",content:"Habits are the compound interest of self-improvement. You do not rise to the level of your goals. You fall to the level of your systems. ".repeat(20)},
  {id:2,title:"Project Hail Mary",author:"Andy Weir",cat:"Science",rating:4.9,cover:"https://picsum.photos/seed/a2/300/400",content:"Space exploration meets survival in this thrilling adventure. ".repeat(20)},
  {id:3,title:"The Silent Patient",author:"Alex Michaelides",cat:"Mystery",rating:4.6,cover:"https://picsum.photos/seed/a3/300/400",content:"A psychological thriller that keeps you guessing until the final page. ".repeat(20)},
  {id:4,title:"Deep Work",author:"Cal Newport",cat:"Business",rating:4.7,cover:"https://picsum.photos/seed/a4/300/400",content:"Focus in a distracted world is a rare and valuable skill. ".repeat(20)},
  {id:5,title:"Sapiens",author:"Yuval Noah Harari",cat:"History",rating:4.9,cover:"https://picsum.photos/seed/a5/300/400",content:"A brief history of humankind from the age of hunter-gatherers to the present. ".repeat(20)},
  {id:6,title:"Educated",author:"Tara Westover",cat:"Education",rating:4.8,cover:"https://picsum.photos/seed/a6/300/400",content:"A memoir of learning and self-discovery against all odds. ".repeat(20)},
  {id:7,title:"The Love Hypothesis",author:"Ali Hazelwood",cat:"Romance",rating:4.5,cover:"https://picsum.photos/seed/a7/300/400",content:"Fake dating turns into something real in this charming romance. ".repeat(20)},
  {id:8,title:"Dune",author:"Frank Herbert",cat:"Fiction",rating:4.9,cover:"https://picsum.photos/seed/a8/300/400",content:"Desert planet politics and intrigue in this epic science fiction masterpiece. ".repeat(20)},
];

const categories = ["Fiction","Romance","Mystery","Science","Business","Self-Help","History","Education"];
let currentBook = null;
let currentChapter = 0;
let fontSize = 18;

window.onload = () => {
  renderFeatured();
  renderNew();
  renderCats();
  createFloatingBooks();
  observeFade();
  loadTheme();
  loadFontPref();
  document.addEventListener('click', e => {
    if(!e.target.closest('.search-wrap')) document.getElementById('searchResults').style.display = 'none';
  });
};

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
  autoScroll(wrap, 3000);
}
function renderNew(){ 
  const wrap = document.getElementById('newCarousel');
  wrap.innerHTML = books.slice(3).map(bookCard).join('');
  autoScroll(wrap, 3000);
}

function autoScroll(el, ms){
  let pos = 0;
  const step = 216;
  setInterval(()=>{
    const max = el.scrollWidth - el.clientWidth;
    pos += step;
    if(pos > max) pos = 0;
    el.scrollTo({left: pos, behavior: 'smooth'});
  }, ms);
}

function renderCats(){
  document.getElementById('catGrid').innerHTML = categories.map(cat=>`
    <div class="cat-card glass fade" onclick="openCategory('${cat}')">${cat}</div>
  `).join('');
}

function openCategory(cat){
  hideSearchDropdown();
  showView('library');
  document.getElementById('booksTitle').innerText = cat;
  document.getElementById('booksGrid').innerHTML = books.filter(b=>b.cat===cat).map(bookCard).join('');
}

function liveSearchDropdown(q){
  const wrap = document.getElementById('searchResults');
  if(!q.trim()){ wrap.style.display='none'; return; }
  const res = books.filter(b=> 
    b.title.toLowerCase().includes(q.toLowerCase()) || 
    b.author.toLowerCase().includes(q.toLowerCase()) || 
    b.cat.toLowerCase().includes(q.toLowerCase())
  ).slice(0,6);
  if(!res.length){
    wrap.innerHTML = `<div class="search-item"><p class="muted">No results for "${q}"</p></div>`;
  } else {
    wrap.innerHTML = res.map(b=>`
      <div class="search-item" onclick="selectSearchResult(${b.id})">
        <img src="${b.cover}" alt="">
        <div><h4>${b.title}</h4><p>${b.author} • ${b.cat}</p></div>
      </div>
    `).join('');
  }
  wrap.style.display='block';
}

function selectSearchResult(id){ hideSearchDropdown(); openReader(id); }

function commitSearch(q){
  hideSearchDropdown();
  if(!q.trim()){ 
    showView('library');
    document.getElementById('booksGrid').innerHTML = books.map(bookCard).join(''); 
    document.getElementById('booksTitle').innerText='All Books'; 
    return;
  }
  showView('library');
  const res = books.filter(b=> b.title.toLowerCase().includes(q.toLowerCase()) || b.author.toLowerCase().includes(q.toLowerCase()) || b.cat.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('booksTitle').innerText = `Results for "${q}"`;
  document.getElementById('booksGrid').innerHTML = res.length ? res.map(bookCard).join('') : `<p class="muted">No books found.</p>`;
}

function hideSearchDropdown(){ document.getElementById('searchResults').style.display='none'; }

function createFloatingBooks(){
  const wrap = document.getElementById('floatBooks');
  const hero = document.querySelector('.hero');
  const tiles = [];
  const TILE_W = 60, TILE_H = 80, COUNT = 10;

  const bounds = hero.getBoundingClientRect();
  for(let i=0;i<COUNT;i++){
    const div = document.createElement('div');
    div.className = 'book-float';
    let x = Math.random() * Math.max(0, bounds.width - TILE_W);
    let y = Math.random() * Math.max(0, bounds.height - TILE_H);
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.opacity = 0.35 + Math.random() * 0.35;
    wrap.appendChild(div);
    tiles.push({ el: div, x, y, vx: (Math.random() - 0.5) * 0.7, vy: (Math.random() - 0.5) * 0.7, w: TILE_W, h: TILE_H });
  }

  function animate(){
    const bounds = hero.getBoundingClientRect();
    tiles.forEach(t => {
      t.x += t.vx; t.y += t.vy;
      if(t.x <= 0){ t.x = 0; t.vx *= -1; } 
      else if(t.x >= bounds.width - t.w){ t.x = bounds.width - t.w; t.vx *= -1; }
      if(t.y <= 0){ t.y = 0; t.vy *= -1; } 
      else if(t.y >= bounds.height - t.h){ t.y = bounds.height - t.h; t.vy *= -1; }
      t.el.style.transform = `translate(${t.x}px, ${t.y}px)`; // No rotate
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    const bounds = hero.getBoundingClientRect();
    tiles.forEach(t => {
      t.x = Math.min(t.x, bounds.width - t.w);
      t.y = Math.min(t.y, bounds.height - t.h);
    });
  });
}

function openReader(bookId){
  hideSearchDropdown();
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

function loadChapter(index){
  currentChapter = parseInt(index);
  document.getElementById('chapterTitle').innerText = currentBook.title;
  document.getElementById('chapterAuthor').innerText = `by ${currentBook.author} • Chapter ${currentChapter + 1}`;
  const chapterSize = currentBook.content.length / 5;
  const start = currentChapter * chapterSize;
  const end = (currentChapter + 1) * chapterSize;
  document.getElementById('chapterText').innerHTML = `<p>${currentBook.content.substring(start, end)}</p>`;
  const progress = JSON.parse(localStorage.getItem('reading') || '{}');
  progress[currentBook.id] = currentChapter;
  localStorage.setItem('reading', JSON.stringify(progress));
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
  localStorage.setItem('fontSize', fontSize);
}

function loadFontPref(){
  const saved = parseInt(localStorage.getItem('fontSize'));
  if(saved){ fontSize = saved; document.getElementById('sizeRange').value = fontSize; changeSize(fontSize); }
}

function searchText(query){
  const text = document.getElementById('chapterText');
  if(!query){ text.innerHTML = text.innerHTML.replace(/<mark>/g, '').replace(/<\/mark>/g, ''); return; }
  const cleaned = text.innerHTML.replace(/<mark>/g, '').replace(/<\/mark>/g, '');
  text.innerHTML = cleaned.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
}

function updateProgress(){
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0;
  document.getElementById('progressBar').style.width = p + '%';
}

function toggleBookmark(){
  if(!currentBook) return;
  let bm = JSON.parse(localStorage.getItem('bm') || '[]');
  if(!bm.includes(currentBook.id)) bm.push(currentBook.id);
  localStorage.setItem('bm', JSON.stringify(bm));
  alert('Bookmark saved locally ✓');
}

function toggleTheme(){
  document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
}
function loadTheme(){ if(localStorage.getItem('theme')==='light') document.documentElement.classList.add('light'); }

function observeFade(){
  const obs = new IntersectionObserver(entries=>{ entries.forEach(e=>{if(e.isIntersecting) e.target.classList.add('show')}) },{threshold:0.1});
  document.querySelectorAll('.fade').forEach(el=>obs.observe(el));
}

window.onscroll = () => { document.getElementById('backTop').style.display = window.scrollY > 400 ? 'block' : 'none'; }
