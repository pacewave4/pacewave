function createFloatingBooks(){
  const wrap = document.getElementById('floatBooks');
  const hero = document.getElementById('home'); // hero section bounds
  const tiles = [];
  const count = 10; // number of tiles
  const w = 60; // tile width
  const h = 80; // tile height

  // Wait for hero to have a height
  function init(){
    const bounds = hero.getBoundingClientRect();
    for(let i=0;i<count;i++){
      const div = document.createElement('div');
      div.className = 'book-float';
      const x = Math.random() * (bounds.width - w);
      const y = Math.random() * (bounds.height - h);
      div.style.left = x + 'px';
      div.style.top = y + 'px';
      div.style.opacity = 0.35 + Math.random() * 0.35; // 0.35 - 0.7 opacity so they show
      wrap.appendChild(div);
      tiles.push({
        el: div,
        x, y,
        vx: (Math.random() - 0.5) * 0.5, // random speed x
        vy: (Math.random() - 0.5) * 0.5  // random speed y
      });
    }
    animate();
  }

  function animate(){
    const bounds = hero.getBoundingClientRect();
    tiles.forEach(t => {
      t.x += t.vx;
      t.y += t.vy;

      // Bounce off hero edges, no rotation
      if(t.x < 0){ t.x = 0; t.vx *= -1; }
      if(t.x > bounds.width - w){ t.x = bounds.width - w; t.vx *= -1; }
      if(t.y < 0){ t.y = 0; t.vy *= -1; }
      if(t.y > bounds.height - h){ t.y = bounds.height - h; t.vy *= -1; }

      t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;
    });
    requestAnimationFrame(animate);
  }

  // Run after layout so hero has height
  if(hero.clientHeight > 0) init();
  else window.addEventListener('load', init);
      }
