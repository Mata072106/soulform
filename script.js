(function(){
  var CUR="$";                       // change to "฿" if you price in baht
  var TELEGRAM="https://t.me/toto0921";
  var SIZES=["XS","S","M","L","XL"];
  // stock: how many you have in each size (0 = sold out, customers can pre-order it).
  // img: put a photo link or file name here (like "tee.jpg") to show a real photo instead of the colour block.
  var PRODUCTS=[
    {sku:"SF-TEE-001",name:"Cherry Baby Tee",cat:"Tops",price:18,color:"#F6C5CB",img:"",stock:{XS:2,S:8,M:12,L:6,XL:0}},
    {sku:"SF-CAR-012",name:"Ribbon Knit Cardigan",cat:"Tops",price:38,color:"#DCCDF0",img:"",stock:{XS:0,S:4,M:7,L:5,XL:3}},
    {sku:"SF-BLS-014",name:"Puff Sleeve Blouse",cat:"Tops",price:32,color:"#E6D9F2",img:"",stock:{XS:1,S:5,M:9,L:9,XL:4}},
    {sku:"SF-SKT-031",name:"Pleated Mini Skirt",cat:"Bottoms",price:28,color:"#C9DDF0",img:"",stock:{XS:0,S:3,M:3,L:6,XL:2}},
    {sku:"SF-SHO-033",name:"Gingham Shorts",cat:"Bottoms",price:24,color:"#F4E3AE",img:"",stock:{XS:3,S:6,M:8,L:4,XL:1}},
    {sku:"SF-DRS-042",name:"Bow Slip Dress",cat:"Dresses",price:42,color:"#EBA5B4",img:"",stock:{XS:2,S:4,M:2,L:2,XL:0}},
    {sku:"SF-DRS-047",name:"Picnic Day Dress",cat:"Dresses",price:46,color:"#C6E4D4",img:"",stock:{XS:1,S:5,M:6,L:3,XL:2}},
    {sku:"SF-JKT-050",name:"Cropped Denim Jacket",cat:"Outer",price:54,color:"#F5CFBB",img:"",stock:{XS:0,S:1,M:4,L:4,XL:2}},
    {sku:"SFA-BOW-003",name:"Satin Hair Bow",cat:"Accessories",price:8,color:"#F6C5CB",img:"",stock:{XS:0,S:0,M:8,L:0,XL:0},one:true},
    {sku:"SFA-BAG-007",name:"Mini Cherry Bag",cat:"Accessories",price:26,color:"#D9434F",img:"",stock:{XS:0,S:0,M:0,L:0,XL:0},one:true}
  ];
  PRODUCTS.forEach(function(p,i){p.no=("0"+(i+1)).slice(-2)});
  var CATS=["All","Tops","Bottoms","Dresses","Outer","Accessories"];
  var state={cat:"All",pick:{},cart:[]};
  var TGNAME="@"+TELEGRAM.split("/").pop();
  function openBag(on){$("bag").classList.toggle("open",on);$("veil").hidden=!on;document.body.classList.toggle("noscroll",on)}
  var $=function(id){return document.getElementById(id)};
  var money=function(n){return CUR+(Math.round(n*100)%100?n.toFixed(2):String(Math.round(n)))};
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
  var tt;function toast(m){var t=$("toast");t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},1900)}
  function find(s){return PRODUCTS.filter(function(p){return p.sku===s})[0]}
  function sizesOf(p){return p.one?["One size"]:SIZES}
  function key(p,z){return p.one?"M":z}   // accessories keep their stock under M
  function isOut(p,z){return p.stock[key(p,z)]<=0}
  function totalStock(p){return sizesOf(p).reduce(function(a,z){return a+p.stock[key(p,z)]},0)}
  function inCart(s,z){return state.cart.filter(function(l){return l.sku===s&&l.size===z})[0]}
  function left(p,z){var l=inCart(p.sku,z);return p.stock[key(p,z)]-(l?l.qty:0)}

  function renderCats(){$("cats").innerHTML=CATS.map(function(c){return '<button type="button" data-cat="'+c+'" aria-pressed="'+(state.cat===c)+'">'+c+'</button>'}).join("")}
  function renderGrid(){
    var list=PRODUCTS.filter(function(p){return state.cat==="All"||p.cat===state.cat});
    $("grid").innerHTML=list.map(function(p){
      var sel=state.pick[p.sku],out=sel?isOut(p,sel):false,n=sel?left(p,sel):0;
      var info=!sel?'Choose a size':(out?'Sold out in this size. Tap Pre-order below to reserve it ♡':(n<=0?'That is all we have in your bag':(n<=2?'Only '+n+' left':'In stock')));
      var all=totalStock(p)===0;
      var pic=p.img?'<img src="'+esc(p.img)+'" alt="'+esc(p.name)+'" loading="lazy">':'';
      return '<article class="card" data-sku="'+p.sku+'">'+
        '<div class="pic" style="background:'+p.color+'">'+pic+'<span class="st'+(all?' out':'')+'">'+(all?'Sold out · pre-order':'In stock')+'</span><span>no. '+p.no+'</span></div>'+
        '<h3>'+esc(p.name)+'</h3>'+
        '<div class="pr"><span>'+p.cat+'</span><b>'+money(p.price)+'</b></div>'+
        '<div class="sizes" role="group" aria-label="Size for '+esc(p.name)+'">'+sizesOf(p).map(function(z){
          return '<button type="button" data-size="'+z+'" class="'+(isOut(p,z)?'out':'')+'" aria-pressed="'+(sel===z)+'" title="'+(isOut(p,z)?'Sold out, pre-order':'In stock')+'">'+z+'</button>'}).join("")+'</div>'+
        '<div class="left'+(sel&&!out&&n>0&&n<=2?' low':'')+'">'+info+'</div>'+
        '<button type="button" class="add'+(out?' pre-btn':'')+'"'+(!sel||(!out&&n<=0)?' disabled':'')+'>'+(out?'Pre-order':'Add to bag')+'</button></article>'}).join("");
  }

  function totals(){
    return {total:state.cart.reduce(function(a,l){return a+l.price*l.qty},0),
      count:state.cart.reduce(function(a,l){return a+l.qty},0),
      pre:state.cart.reduce(function(a,l){return a+(l.pre?l.qty:0)},0)};
  }
  function renderBag(){
    var t=totals(),b=$("bagbar");
    b.hidden=!state.cart.length;
    if(!b.hidden)b.innerHTML='<span>View my bag · '+t.count+' item'+(t.count===1?'':'s')+'</span><span>'+money(t.total)+'</span>';
    var lines=state.cart.length?'<ul class="lines">'+state.cart.map(function(l,i){
      return '<li><div><div class="nm">'+esc(l.name)+'</div><div class="sub">'+(l.size==="One size"?'one size':'size '+l.size)+(l.pre?'<span class="pre">PRE-ORDER</span>':'')+'</div>'+
        '<div class="qty"><button type="button" data-dec="'+i+'" aria-label="One less">−</button><span>'+l.qty+'</span><button type="button" data-inc="'+i+'" aria-label="One more">+</button></div></div>'+
        '<div class="amt">'+money(l.price*l.qty)+'</div></li>'}).join("")+'</ul>':'<p class="empty">Your bag is empty. Pick a size on anything you like and add it ♡</p>';
    var d=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    $("bag").innerHTML='<h3><span>My order</span><span class="hr"><small>'+t.count+' item'+(t.count===1?'':'s')+'</small><button type="button" class="closebag" id="closebag" aria-label="Close">✕</button></span></h3>'+
      '<div class="when">Soul Form. · '+d+'</div>'+lines+
      (t.pre?'<div class="row"><span>Pre-order items</span><span>'+t.pre+'</span></div>':'')+
      '<div class="row total"><span>Total</span><span>'+money(t.total)+'</span></div>'+
      (state.cart.length?'<div class="shot">📸 Take a screenshot of this bag and send it to us on Telegram. We\'ll confirm and tell you how to pay.</div>':'')+
      '<a class="btn" href="'+TELEGRAM+'" style="display:block">Open Telegram</a>'+
      '<p class="fine">Telegram did not open? Search <b>'+TGNAME+'</b> in Telegram, or <button type="button" class="linkbtn" id="copyuser">copy the username</button>.</p>'+
      '<div class="copied" id="copied"></div>';
  }
  function render(){renderGrid();renderBag()}

  document.addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b)return;
    if(b.id==="bagbar"){openBag(true);return}
    if(b.id==="closebag"){openBag(false);return}
    if(b.id==="copyuser"){var msg=function(m){$("copied").textContent=m};try{navigator.clipboard.writeText(TGNAME).then(function(){msg("Copied "+TGNAME+" ♡ Now search it in Telegram.")},function(){msg("Search "+TGNAME+" in Telegram.")})}catch(err){msg("Search "+TGNAME+" in Telegram.")}return}
    if(b.dataset.cat){state.cat=b.dataset.cat;renderCats();renderGrid();return}
    var card=b.closest(".card");
    if(card){
      var p=find(card.dataset.sku);
      if(b.dataset.size){state.pick[p.sku]=b.dataset.size;renderGrid();return}
      if(b.classList.contains("add")){
        var z=state.pick[p.sku];if(!z)return;
        var out=isOut(p,z);if(!out&&left(p,z)<=0)return;
        var l=inCart(p.sku,z);
        if(l)l.qty++;else state.cart.push({sku:p.sku,name:p.name,size:z,price:p.price,qty:1,pre:out});
        toast(out?"Added as a pre-order ♡":"Added to your bag ♡");render();return}
    }
    if(b.dataset.inc!==undefined){var l1=state.cart[+b.dataset.inc],p1=find(l1.sku);if(l1.pre||left(p1,l1.size)>0)l1.qty++;else toast("That's all we have in that size");render();return}
    if(b.dataset.dec!==undefined){var i=+b.dataset.dec;state.cart[i].qty--;if(state.cart[i].qty<=0)state.cart.splice(i,1);render();return}
  });
  $("veil").addEventListener("click",function(){openBag(false)});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")openBag(false)});
  renderCats();render();
})();