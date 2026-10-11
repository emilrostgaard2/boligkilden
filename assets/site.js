(function(){
"use strict";
var d=document,$=function(s,c){return(c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
var fmt=function(n){return Math.round(n).toLocaleString("da-DK")};
var store={get:function(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* nav */
var burger=$(".burger"),nav=$(".nav");
if(burger){burger.addEventListener("click",function(){var o=nav.classList.toggle("show");burger.setAttribute("aria-expanded",o);d.body.style.overflow=o?"hidden":""})}
$$(".nav li>button").forEach(function(b){b.addEventListener("click",function(e){var li=b.parentNode,o=!li.classList.contains("open");$$(".nav li.open").forEach(function(x){if(x!==li){x.classList.remove("open");$("button",x).setAttribute("aria-expanded","false")}});li.classList.toggle("open",o);b.setAttribute("aria-expanded",o);e.stopPropagation()})});
d.addEventListener("click",function(e){if(!e.target.closest(".nav"))$$(".nav li.open").forEach(function(x){x.classList.remove("open")})});
d.addEventListener("keydown",function(e){if(e.key==="Escape"){$$(".nav li.open").forEach(function(x){x.classList.remove("open")});var bb=$(".bubble");if(bb)bb.classList.remove("show")}});

/* progress + mobile cta + toc */
var prog=$(".progress"),mcta=$(".mcta"),art=$(".content"),tocLinks=$$(".side .toc a"),heads=tocLinks.map(function(a){return d.getElementById(a.getAttribute("href").slice(1))});
var ticking=false;
function onScroll(){ticking=false;var y=window.scrollY,h=d.documentElement.scrollHeight-window.innerHeight;
 if(prog&&art)prog.style.width=Math.min(100,y/h*100)+"%";
 if(mcta)mcta.classList.toggle("on",y>600&&y<h-500);
 if(heads.length){var cur=0;heads.forEach(function(el,i){if(el&&el.getBoundingClientRect().top<140)cur=i});tocLinks.forEach(function(a,i){a.classList.toggle("on",i===cur)})}}
window.addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});

/* calculators */
$$(".calc[data-calc]").forEach(function(box){
 var c=JSON.parse(box.getAttribute("data-calc")),sel=$("select",box),num=$("input[type=number]",box),rng=$("input[type=range]",box),out=$(".big",box),sub=$(".sub",box),diff=$(".diff",box),bar=$(".bar i",box),fr=$(".fradrag",box);
 function run(src){var q=parseFloat((src===rng?rng:num).value)||0;q=Math.max(c.min,Math.min(c.max,q));if(src===rng)num.value=q;else rng.value=q;
  var o=c.options[sel?sel.selectedIndex:0],lo=o.low*q+(c.fixed_low||0),hi=o.high*q+(c.fixed_high||0);
  out.textContent=fmt(lo)+" – "+fmt(hi)+" kr.";
  sub.textContent="Gennemsnit ca. "+fmt((lo+hi)/2)+" kr. inkl. moms";
  if(diff)diff.textContent=fmt(hi-lo)+" kr.";
  if(bar)bar.style.width=Math.max(8,Math.min(100,lo/hi*100))+"%";
  if(fr){if(c.labor_share>0){var l=Math.min(9000,(lo+hi)/2*c.labor_share);fr.textContent="Mulig skattebesparelse via grønt håndværkerfradrag: ca. "+fmt(l*0.26)+" kr. pr. person (op til "+fmt(Math.min(18000,(lo+hi)/2*c.labor_share)*0.26)+" kr. for et par)."}else fr.textContent=""}}
 if(sel)sel.addEventListener("change",function(){run(num)});
 num.addEventListener("input",function(){run(num)});rng.addEventListener("input",function(){run(rng)});run(num);
});

/* fradragsberegner */
$$(".fradrag-calc").forEach(function(box){var ins=$$("input,select",box),out=$(".big",box),sub=$(".sub",box);
 function run(){var lon=parseFloat($("[name=lon]",box).value)||0,service=parseFloat($("[name=service]",box).value)||0,p=parseInt($("[name=pers]",box).value,10)||1;
  var h=Math.min(lon,9000*p),s=Math.min(service,18300*p),val=(h+s)*0.26;
  out.textContent=fmt(val)+" kr.";sub.textContent="Fradrag i alt "+fmt(h+s)+" kr. (håndværk "+fmt(h)+" + service "+fmt(s)+") × skatteværdi ca. 26 %"}
 ins.forEach(function(i){i.addEventListener("input",run)});run()});

/* checklist */
$$(".check[data-key]").forEach(function(box){var k="bk-"+box.getAttribute("data-key"),st=store.get(k)||{},cbs=$$("input",box),bar=$(".prog b",box),txt=$(".prog span",box);
 function upd(){var n=cbs.filter(function(c){return c.checked}).length;bar.style.width=n/cbs.length*100+"%";txt.textContent=n+" af "+cbs.length+" klar"}
 cbs.forEach(function(c,i){c.checked=!!st[i];c.addEventListener("change",function(){st[i]=c.checked;store.set(k,st);upd()})});upd()});

/* helpful */
$$(".helpful").forEach(function(h){$$("button",h).forEach(function(b){b.addEventListener("click",function(){h.innerHTML="<span>Tak! Din feedback hjælper os med at prioritere, hvad vi opdaterer.</span>";store.set("bk-help-"+location.pathname,b.value)})})});

/* search */
var si=$("#q");
if(si){var list=$(".sugg"),idx=null,act=-1;
 function load(cb){if(idx)return cb();fetch("/assets/search.json").then(function(r){return r.json()}).then(function(j){idx=j;cb()}).catch(function(){})}
 function norm(s){return s.toLowerCase().replace(/æ/g,"ae").replace(/ø/g,"oe").replace(/å/g,"aa")}
 function show(){var q=norm(si.value.trim());if(q.length<2){list.classList.remove("show");return}
  var words=q.split(/\s+/),res=idx.filter(function(p){var t=norm(p.t+" "+p.k);return words.every(function(w){return t.indexOf(w)>-1})}).slice(0,7);
  act=-1;list.innerHTML=res.length?res.map(function(p){return'<li><a href="'+p.u+'"><span>'+p.t+'</span><small>'+(p.p||p.h)+'</small></a></li>'}).join(""):'<li><a href="/sitemap/"><span>Ingen match – se alle guides</span></a></li>';list.classList.add("show")}
 si.addEventListener("focus",function(){load(function(){})});
 si.addEventListener("input",function(){load(show)});
 si.addEventListener("keydown",function(e){var a=$$("a",list);if(!a.length)return;if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();act=(act+(e.key==="ArrowDown"?1:-1)+a.length)%a.length;a.forEach(function(x,i){x.classList.toggle("act",i===act)})}else if(e.key==="Enter"){e.preventDefault();location.href=(a[act]||a[0]).href}});
 d.addEventListener("click",function(e){if(!e.target.closest(".search"))list.classList.remove("show")});
}

/* price filter */
var pf=$(".price-filter");
if(pf){pf.addEventListener("input",function(){var q=pf.value.toLowerCase();$$("#prisoversigt tbody tr").forEach(function(r){r.style.display=r.textContent.toLowerCase().indexOf(q)>-1?"":"none"})})}

/* quiz */
$$(".quiz").forEach(function(qz){var qs=$$(".q",qz),score={},i=0;
 qz.addEventListener("click",function(e){var b=e.target.closest(".opts button");if(b){score[b.value]=(score[b.value]||0)+1;qs[i].classList.remove("on");i++;if(i<qs.length)qs[i].classList.add("on");else{var best=Object.keys(score).sort(function(a,c){return score[c]-score[a]})[0];var r=$('.res[data-r="'+best+'"]',qz);if(r)r.classList.add("on")}}
  if(e.target.closest(".again")){score={};i=0;$$(".res",qz).forEach(function(r){r.classList.remove("on")});qs[0].classList.add("on")}})});

/* mascot */
var bo=$(".bo-btn"),bub=$(".bubble");
if(bo&&bub){var tips=[];try{tips=JSON.parse($("#bo-tips").textContent)}catch(e){}
 var ti=Math.floor(Math.random()*Math.max(1,tips.length));
 function say(){if(!tips.length)return;var t=tips[ti%tips.length];ti++;$(".msg",bub).innerHTML="<b>"+t.h+"</b>"+t.t;bub.classList.add("show")}
 bo.addEventListener("click",say);
 $(".x",bub).addEventListener("click",function(){bub.classList.remove("show");store.set("bk-bo-closed",Date.now())});
 var closed=store.get("bk-bo-closed");
 if(!closed||Date.now()-closed>864e5){setTimeout(function(){if(window.scrollY>300||d.querySelector(".hero")){say()}},9000)}
}
onScroll();
})();
