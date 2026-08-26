const fs=require('fs'),crypto=require('crypto');
// Password is passed in, never committed:  node build.js octopus2026
const PASSWORD=process.argv[2]||process.env.BLUEPRINT_PASSWORD;
if(!PASSWORD){console.error('Usage: node build.js <password>');process.exit(1)}
const ITER=310000;
const head=fs.readFileSync('src/head.html','utf8');
const payload=fs.readFileSync('src/report.html','utf8');

const salt=crypto.randomBytes(16), iv=crypto.randomBytes(12);
const key=crypto.pbkdf2Sync(PASSWORD,salt,ITER,32,'sha256');
const c=crypto.createCipheriv('aes-256-gcm',key,iv);
const ct=Buffer.concat([c.update(payload,'utf8'),c.final()]);
const blob=Buffer.concat([ct,c.getAuthTag()]).toString('base64');
const b64=b=>b.toString('base64');

const html=head+`<body class="locked">
<div id="gate">
  <form class="gcard" id="gform" autocomplete="off">
    <div class="gmark"></div>
    <div class="gk">Confidential // Client Strategy</div>
    <h1>Octopus Deploy<br>LinkedIn Blueprint</h1>
    <p class="gd">Top of funnel campaign structure for the practitioner audience. Enter the access password to continue.</p>
    <label for="gpw">Access password</label>
    <input id="gpw" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="••••••••••">
    <button id="gbtn" type="submit">Open the blueprint</button>
    <div class="gerr" id="gerr" role="alert"></div>
    <div class="gfoot">PREPARED BY IMPACTABLE<br>DO NOT FORWARD WITHOUT PERMISSION</div>
  </form>
</div>
<div id="app"></div>
<script>
(function(){
  var S="${b64(salt)}", IV="${b64(iv)}", D="${blob}", ITER=${ITER};
  var VIEWS=['summary','constraint','audience','messaging','build'], DEFAULT='summary';
  var routed=false;
  function b2a(b){var s=atob(b),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}

  function showView(name){
    if(VIEWS.indexOf(name)===-1)name=DEFAULT;
    var t=document.getElementById('view-'+name);
    if(!t){name=DEFAULT;t=document.getElementById('view-'+DEFAULT)}
    if(!t)return;
    VIEWS.forEach(function(v){var el=document.getElementById('view-'+v);if(el)el.classList.toggle('on',v===name)});
    document.querySelectorAll('.tab').forEach(function(x){x.classList.toggle('active',x.getAttribute('data-view')===name)});
    window.scrollTo(0,0);
  }
  function initRouter(){
    if(routed)return; routed=true;
    document.querySelectorAll('.tab').forEach(function(t){
      t.addEventListener('click',function(e){e.preventDefault();var v=t.getAttribute('data-view');
        if(window.location.hash!=='#'+v){window.location.hash=v}else{showView(v)}})});
    document.querySelectorAll('[data-goto]').forEach(function(el){
      el.addEventListener('click',function(e){e.preventDefault();var v=el.getAttribute('data-goto');
        if(window.location.hash!=='#'+v){window.location.hash=v}else{showView(v)}})});
    var bm=document.querySelector('.brandmark');
    if(bm)bm.addEventListener('click',function(e){e.preventDefault();
      if(window.location.hash!=='#summary'){window.location.hash='summary'}else{showView('summary')}});
    window.addEventListener('hashchange',function(){showView((window.location.hash||'').replace('#',''))});
    showView((window.location.hash||'').replace('#',''));
  }

  function unlock(html){
    document.getElementById('app').innerHTML=html;
    document.getElementById('app').classList.add('ready');
    document.getElementById('gate').style.display='none';
    document.body.classList.remove('locked');
    initRouter();
  }

  function derive(pw){
    var enc=new TextEncoder();
    return crypto.subtle.importKey('raw',enc.encode(pw),{name:'PBKDF2'},false,['deriveKey'])
      .then(function(k){return crypto.subtle.deriveKey(
        {name:'PBKDF2',salt:b2a(S),iterations:ITER,hash:'SHA-256'},k,
        {name:'AES-GCM',length:256},false,['decrypt'])});
  }
  function attempt(pw){
    return derive(pw).then(function(key){
      return crypto.subtle.decrypt({name:'AES-GCM',iv:b2a(IV)},key,b2a(D))
    }).then(function(buf){return new TextDecoder().decode(buf)});
  }

  var f=document.getElementById('gform'),inp=document.getElementById('gpw'),
      btn=document.getElementById('gbtn'),err=document.getElementById('gerr');

  f.addEventListener('submit',function(e){
    e.preventDefault();
    var pw=inp.value.trim();
    if(!pw){err.textContent='Enter the password.';return}
    err.textContent='';btn.disabled=true;btn.textContent='Unlocking...';
    attempt(pw).then(function(html){
      try{sessionStorage.setItem('od_k',pw)}catch(_){}
      unlock(html);
    }).catch(function(){
      btn.disabled=false;btn.textContent='Open the blueprint';
      err.textContent='Incorrect password.';
      inp.value='';inp.focus();
    });
  });

  // auto-unlock within the same browser tab session
  var saved=null; try{saved=sessionStorage.getItem('od_k')}catch(_){}
  if(saved){ attempt(saved).then(unlock).catch(function(){try{sessionStorage.removeItem('od_k')}catch(_){}}); }
  inp.focus();
})();
<\/script>
</body></html>`;
fs.writeFileSync('index.html',html);
console.log('built index.html:',html.length,'bytes | payload encrypted:',payload.length,'->',blob.length,'b64');
