(function(){
'use strict';

var C={
  appt:{l:'Appointment',i:'\uD83D\uDCC5',c:'#e74c8b',b:'#fdf2f8'},
  event:{l:'Event',i:'\uD83C\uDF89',c:'#7c3aed',b:'#f3eaff'},
  task:{l:'Task',i:'\u2705',c:'#059669',b:'#ecfdf5'},
  trip:{l:'Trip',i:'\u2708\uFE0F',c:'#b45992',b:'#fce7f3'}
};
var CK=Object.keys(C);
var MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var TB=[
  {k:'dash',l:'\uD83C\uDF38 Home'},
  {k:'appt',l:'\uD83D\uDCC5 Appts'},
  {k:'event',l:'\uD83C\uDF89 Events'},
  {k:'task',l:'\u2705 Tasks'},
  {k:'trip',l:'\u2708\uFE0F Trips'},
  {k:'budget',l:'\uD83D\uDCCA Budget'},
  {k:'cal',l:'\uD83D\uDCC6 Calendar'}
];
var BC=[
  {k:'giving',l:'Giving',i:'\u2764\uFE0F',c:'#e74c8b',h:'Tithes, donations'},
  {k:'saving',l:'Saving',i:'\uD83C\uDF31',c:'#059669',h:'Emergency fund, retirement'},
  {k:'housing',l:'Housing',i:'\uD83C\uDFE0',c:'#7c3aed',h:'Rent/mortgage, repairs'},
  {k:'utilities',l:'Utilities',i:'\uD83D\uDCA1',c:'#0891b2',h:'Electric, water, phone'},
  {k:'food',l:'Food',i:'\uD83C\uDF55',c:'#ea580c',h:'Groceries, restaurants'},
  {k:'transport',l:'Transport',i:'\uD83D\uDE97',c:'#b45992',h:'Gas, car, maintenance'},
  {k:'insurance',l:'Insurance',i:'\uD83D\uDEE1\uFE0F',c:'#4f46e5',h:'Health, life, disability'},
  {k:'health',l:'Health',i:'\uD83E\uDE7A',c:'#e11d48',h:'Doctor, dentist, Rx'},
  {k:'debt',l:'Debt',i:'\u26D3\uFE0F',c:'#dc2626',h:'Credit cards, loans',hasBal:true},
  {k:'personal',l:'Personal',i:'\uD83D\uDC5C',c:'#d97706',h:'Clothing, subscriptions'},
  {k:'lifestyle',l:'Lifestyle',i:'\uD83C\uDF89',c:'#8b5cf6',h:'Entertainment, hobbies'},
  {k:'misc',l:'Misc',i:'\uD83D\uDCC2',c:'#64748b',h:'Buffer for surprises'}
];

var now=new Date(),TD=dfm(now),curCat='appt',curId='',toastTm,col={};
var E=ld('bloom'),B=ld('bloom-b');
window.Q={pg:'dash',s:'',o:'da',cm:now.getMonth(),cy:now.getFullYear(),ed:null,bm:now.getMonth(),by:now.getFullYear()};
window.cfA=null;

function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}
function p2(n){return n<10?'0'+n:''+n}
function dfm(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function dim(y,m){return new Date(y,m+1,0).getDate()}
function es(s){var el=document.createElement('div');el.textContent=s||'';return el.innerHTML}
function ld(k){try{return JSON.parse(localStorage.getItem(k))||[]}catch(x){return[]}}
function sv(){localStorage.setItem('bloom',JSON.stringify(E));localStorage.setItem('bloom-b',JSON.stringify(B))}
function tt(m,t){var el=document.getElementById('tst');el.textContent=m;el.className='tst sh '+(t==='error'?'er':'ok');clearTimeout(toastTm);toastTm=setTimeout(function(){el.className='tst'},2500)}

function tripTotal(e){
  return (parseFloat(e.cFlight)||0)+(parseFloat(e.cHotel)||0)+(parseFloat(e.cCar)||0);
}

/* NAV */
function rN(){
  var h='';
  for(var i=0;i<TB.length;i++) h+='<button class="ntb'+(Q.pg===TB[i].k?' on':'')+'" onclick="go(\''+TB[i].k+'\')">'+TB[i].l+'</button>';
  document.getElementById('tabs').innerHTML=h;
}
window.go=function(k){
  Q.pg=k;
  for(var i=0;i<TB.length;i++){var el=document.getElementById('pg-'+TB[i].k);if(el)el.className=TB[i].k===k?'pg on':'pg'}
  rN();D();
};
window.ts=function(k){col[k]=!col[k];D()};

/* CARD */
function mkCard(e){
  var c=C[e.cat]||C.appt;
  var h='<div class="cd'+(e.dn?' dn':'')+'" style="border-left-color:'+c.c+'">';
  h+='<button class="ck" style="border-color:'+(e.dn?c.c:'#e2c0d4')+';background:'+(e.dn?c.c:'#fff')+'" onclick="tg(\''+e.id+'\')">'+(e.dn?'\u2713':'')+'</button>';
  h+='<div class="cbo"><div>';
  h+='<span class="tg" style="background:'+c.b+';color:'+c.c+'">'+c.i+' '+c.l+'</span>';
  h+='<span class="dt">'+es(e.d)+(e.ti?' \u00B7 '+es(e.ti):'')+'</span>';
  h+='</div>';
  h+='<h3 class="ctt">'+es(e.t)+'</h3>';
  if(e.lo) h+='<p class="loc">\uD83D\uDCCD '+es(e.lo)+'</p>';
  if(e.n) h+='<p class="nts">'+es(e.n)+'</p>';
  // Trip cost breakdown
  if(e.cat==='trip'){
    var tf=parseFloat(e.cFlight)||0,th=parseFloat(e.cHotel)||0,tc=parseFloat(e.cCar)||0,tt2=tf+th+tc;
    if(tt2>0){
      h+='<div style="margin-top:4px;padding:6px 8px;background:#fdf2f8;border-radius:6px;font-size:10px">';
      if(tf) h+='<div style="display:flex;justify-content:space-between"><span>\u2708\uFE0F Flight</span><strong style="color:#b45992">$'+tf.toFixed(2)+'</strong></div>';
      if(th) h+='<div style="display:flex;justify-content:space-between"><span>\uD83C\uDFE8 Hotel</span><strong style="color:#b45992">$'+th.toFixed(2)+'</strong></div>';
      if(tc) h+='<div style="display:flex;justify-content:space-between"><span>\uD83D\uDE97 Car Rental</span><strong style="color:#b45992">$'+tc.toFixed(2)+'</strong></div>';
      h+='<div style="display:flex;justify-content:space-between;border-top:1px solid #f5d0e6;margin-top:3px;padding-top:3px;font-weight:700"><span>Total</span><strong style="color:#4a2040">$'+tt2.toFixed(2)+'</strong></div>';
      h+='</div>';
    }
  } else if(e.co){
    h+='<span class="cst">$'+parseFloat(e.co).toFixed(2)+'</span>';
  }
  if(e.d2) h+='<p class="edt">\u2192 '+es(e.d2)+(e.ti2?' \u00B7 '+es(e.ti2):'')+'</p>';
  h+='</div>';
  h+='<div class="acn"><button class="abt" onclick="openM(\''+e.id+'\')">\u270F\uFE0F</button><button class="abt dl" onclick="aD(\''+e.id+'\')">\uD83D\uDDD1\uFE0F</button></div>';
  h+='</div>';
  return h;
}

function mkSec(key,title,color,items){
  if(!items.length) return '';
  var ic=col[key];
  var cost=items.reduce(function(s,e){
    if(e.cat==='trip') return s+tripTotal(e);
    return s+(parseFloat(e.co)||0);
  },0);
  var h='<div class="sec"><div class="shd" onclick="ts(\''+key+'\')">';
  h+='<h2 style="color:'+color+'">'+title;
  if(cost) h+=' <span style="font-size:10px;color:#d97706">$'+cost.toFixed(0)+'</span>';
  h+='</h2><div style="display:flex;align-items:center;gap:4px">';
  h+='<span class="cn">'+items.length+'</span>';
  h+='<span class="arr'+(ic?'':' u')+'">\u25BC</span>';
  h+='</div></div>';
  h+='<div class="sbd'+(ic?' hd':'')+'">';
  for(var i=0;i<items.length;i++) h+=mkCard(items[i]);
  h+='</div></div>';
  return h;
}

/* FILTER */
function gf(cat){
  var r=E.slice();
  if(cat) r=r.filter(function(e){return e.cat===cat});
  if(Q.s){var q=Q.s.toLowerCase();r=r.filter(function(e){return(e.t||'').toLowerCase().indexOf(q)>=0||(e.n||'').toLowerCase().indexOf(q)>=0||(e.lo||'').toLowerCase().indexOf(q)>=0})}
  r.sort(function(a,b){
    if(Q.o==='da') return a.d.localeCompare(b.d)||(a.ti||'').localeCompare(b.ti||'');
    if(Q.o==='dd') return b.d.localeCompare(a.d);
    if(Q.o==='cd'){
      var ac=a.cat==='trip'?tripTotal(a):(parseFloat(a.co)||0);
      var bc2=b.cat==='trip'?tripTotal(b):(parseFloat(b.co)||0);
      return bc2-ac;
    }
    if(Q.o==='nm') return(a.t||'').localeCompare(b.t||'');
    return 0;
  });
  return r;
}

function mkToolbar(){
  return '<div class="tb"><input class="si" placeholder="\uD83D\uDD0D Search..." value="'+es(Q.s)+'" oninput="Q.s=this.value;D()"><select class="so" onchange="Q.o=this.value;D()"><option value="da"'+(Q.o==='da'?' selected':'')+'>Date \u2191</option><option value="dd"'+(Q.o==='dd'?' selected':'')+'>Date \u2193</option><option value="cd"'+(Q.o==='cd'?' selected':'')+'>Cost \u2193</option><option value="nm"'+(Q.o==='nm'?' selected':'')+'>Name</option></select></div>';
}

/* RENDER */
window.D=function(){
  var p=Q.pg;
  if(p==='dash') rDash();
  else if(p==='budget') rBud();
  else if(p==='cal') rCal();
  else rCat(p);
  sv();
};

/* DASHBOARD */
function rDash(){
  var el=document.getElementById('pg-dash');
  var te=E.filter(function(e){return e.d===TD}).length;
  var up=E.filter(function(e){return e.d>TD&&!e.dn}).length;
  var ov=E.filter(function(e){return e.d<TD&&!e.dn}).length;
  var dn=E.filter(function(e){return e.dn}).length;
  var tot=E.reduce(function(s,e){if(e.cat==='trip')return s+tripTotal(e);return s+(parseFloat(e.co)||0)},0);
  var st=[['\uD83C\uDF37',te,'Today'],['\uD83C\uDF31',up,'Upcoming'],['\u26A0\uFE0F',ov,'Overdue'],['\u2705',dn,'Done'],['\uD83D\uDCB0','$'+tot.toFixed(0),'Total Cost'],['\uD83D\uDCCB',E.length,'Entries']];
  var h='<div class="sr">';
  for(var i=0;i<st.length;i++) h+='<div class="sc"><em>'+st[i][0]+'</em><strong>'+st[i][1]+'</strong><span>'+st[i][2]+'</span></div>';
  h+='</div>';
  var rec=E.slice().sort(function(a,b){return b.d.localeCompare(a.d)}).slice(0,8);
  if(rec.length) h+=mkSec('d-r','\uD83D\uDD52 Recent','#6b2158',rec);
  else h+='<div class="emp"><div style="font-size:48px">\uD83C\uDF3A</div><h2>Welcome!</h2><p>Tap + New to get started.</p></div>';
  el.innerHTML=h;
}

/* CATEGORY PAGE */
function rCat(cat){
  var el=document.getElementById('pg-'+cat);
  if(!el) return;
  var f=gf(cat),ov=[],td=[],up=[],dn=[];
  for(var i=0;i<f.length;i++){
    if(f[i].dn) dn.push(f[i]);
    else if(f[i].d<TD) ov.push(f[i]);
    else if(f[i].d===TD) td.push(f[i]);
    else up.push(f[i]);
  }
  var c=C[cat];
  var h=mkToolbar();
  if(!f.length&&!E.filter(function(e){return e.cat===cat}).length){
    h+='<div class="emp"><div style="font-size:40px">'+c.i+'</div><h2>No '+c.l+'s yet</h2><p>Tap + New to add one!</p></div>';
  } else {
    h+=mkSec(cat+'-ov','\u26A0\uFE0F Overdue','#e11d48',ov);
    h+=mkSec(cat+'-td','\uD83C\uDF37 Today','#b45992',td);
    h+=mkSec(cat+'-up','\uD83C\uDF31 Upcoming','#7c3aed',up);
    h+=mkSec(cat+'-dn','\u2705 Completed','#059669',dn);
    if(!f.length) h+='<div style="text-align:center;padding:24px;color:#b89aac">No matches.</div>';
  }
  el.innerHTML=h;
}

/* BUDGET */
function bKey(){return 'b-'+Q.by+'-'+p2(Q.bm+1)}
function m2b(cat){return{trip:'transport',appt:'health',event:'lifestyle',task:'misc'}[cat]||'misc'}
function gsBCat(bk2,ents){return ents.filter(function(e){return m2b(e.cat)===bk2}).reduce(function(s,e){
  if(e.cat==='trip') return s+tripTotal(e);
  return s+(parseFloat(e.co)||0);
},0)}

function rBud(){
  var el=document.getElementById('pg-budget');
  var mk=bKey();
  var inc=B.filter(function(b){return b.mo===mk&&b.tp==='i'});
  var exp=B.filter(function(b){return b.mo===mk&&b.tp==='e'});
  var tInc=inc.reduce(function(s,b){return s+(parseFloat(b.a)||0)},0);
  var tPlan=exp.reduce(function(s,b){return s+(parseFloat(b.a)||0)},0);
  var tLineSpent=exp.reduce(function(s,b){return s+(parseFloat(b.sp)||0)},0);
  var ms=Q.by+'-'+p2(Q.bm+1);
  var me=E.filter(function(e){return e.d.indexOf(ms)===0&&(e.co||e.cat==='trip')});
  var tEntrySpent=me.reduce(function(s,e){if(e.cat==='trip')return s+tripTotal(e);return s+(parseFloat(e.co)||0)},0);
  var tSpent=tLineSpent+tEntrySpent;
  var left=tInc-tPlan;
  var lSpend=tPlan-tSpent;
  var h='';

  // Month nav
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">';
  h+='<h2 style="font-size:18px;font-family:Georgia,serif;color:#6b2158">\uD83D\uDCCA Zero-Based Budget</h2>';
  h+='<div style="display:flex;gap:4px;align-items:center">';
  h+='<button onclick="bP()" style="background:#fdf2f8;border:2px solid #fce7f3;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:14px;color:#b45992;font-weight:700">\u2039</button>';
  h+='<span style="font-size:14px;font-weight:700;color:#6b2158;min-width:120px;text-align:center">'+MN[Q.bm]+' '+Q.by+'</span>';
  h+='<button onclick="bN()" style="background:#fdf2f8;border:2px solid #fce7f3;border-radius:8px;padding:5px 10px;cursor:pointer;font-size:14px;color:#b45992;font-weight:700">\u203A</button>';
  h+='</div></div>';

  // Zero banner
  var zc=Math.abs(left)<0.01?'#bbf7d0':left>0?'#fde68a':'#fecaca';
  var zm=Math.abs(left)<0.01?'\u2705 Every dollar has a job!':left>0?'$'+left.toFixed(0)+' left to assign':'\u26A0\uFE0F $'+Math.abs(left).toFixed(0)+' over';
  h+='<div class="zbb"><div style="font-size:11px;opacity:.7;margin-bottom:2px">INCOME \u2212 PLANNED = ZERO</div>';
  h+='<div style="font-size:26px;font-weight:800">$'+tInc.toFixed(0)+' \u2212 $'+tPlan.toFixed(0)+' = <span style="color:'+zc+'">$'+left.toFixed(0)+'</span></div>';
  h+='<div style="margin-top:4px;font-size:12px;font-weight:700">'+zm+'</div></div>';

  // Summary
  h+='<div class="sr">';
  h+='<div class="sc"><em>\uD83D\uDCB0</em><strong>$'+tInc.toFixed(0)+'</strong><span>Income</span></div>';
  h+='<div class="sc"><em>\uD83D\uDCCB</em><strong>$'+tPlan.toFixed(0)+'</strong><span>Planned</span></div>';
  h+='<div class="sc"><em>\uD83D\uDED2</em><strong>$'+tSpent.toFixed(0)+'</strong><span>Spent</span></div>';
  h+='<div class="sc"><em>'+(lSpend>=0?'\u2705':'\u26A0\uFE0F')+'</em><strong style="color:'+(lSpend>=0?'#059669':'#e11d48')+'">$'+Math.abs(lSpend).toFixed(0)+'</strong><span>'+(lSpend>=0?'Under':'Over')+'</span></div>';
  h+='</div>';

  // Debt overview
  var debtLines=exp.filter(function(b){return b.bc==='debt'});
  if(debtLines.length){
    var totalDebt=debtLines.reduce(function(s,b){return s+(parseFloat(b.bal)||0)},0);
    var totalDebtPaid=debtLines.reduce(function(s,b){return s+(parseFloat(b.sp)||0)},0);
    h+='<div style="background:linear-gradient(135deg,#fef2f2,#fff);border:2px solid #fecaca;border-radius:14px;padding:16px;margin-bottom:14px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:12px;text-align:center">';
    h+='<div><div style="font-size:10px;color:#dc2626;font-weight:700">\u26D3\uFE0F TOTAL DEBT</div><div style="font-size:24px;font-weight:800;color:#dc2626">$'+totalDebt.toFixed(2)+'</div></div>';
    h+='<div><div style="font-size:10px;color:#059669;font-weight:700">\uD83D\uDCB0 PAID THIS MONTH</div><div style="font-size:24px;font-weight:800;color:#059669">$'+totalDebtPaid.toFixed(2)+'</div></div>';
    h+='</div>';
  }

  // Income
  h+='<div class="binp"><h3>\uD83D\uDCB0 Income</h3>';
  for(var ii=0;ii<inc.length;ii++){
    var ic2=inc[ii];
    h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #fce7f3">';
    h+='<span style="font-size:12px">'+es(ic2.l)+'</span>';
    h+='<span style="display:flex;gap:6px;align-items:center">';
    h+='<span style="font-size:9px;color:#059669">$</span>';
    h+='<input type="number" value="'+(ic2.a||'')+'" onchange="uF(\''+ic2.id+'\',\'a\',this.value)" style="width:80px;padding:3px 5px;border-radius:4px;border:1px solid #bbf7d0;font-size:11px;outline:none;color:#059669;text-align:right;font-weight:700">';
    h+='<button class="abt dl" style="font-size:9px;padding:1px 4px" onclick="dB(\''+ic2.id+'\')">\u2715</button>';
    h+='</span></div>';
  }
  h+='<div class="brow" style="margin-top:8px"><div><label>SOURCE</label><input id="biL" placeholder="Paycheck..."></div>';
  h+='<div><label>AMOUNT</label><input type="number" id="biA" placeholder="3500"></div>';
  h+='<button onclick="aI()">+ Add</button></div></div>';

  // Lines header
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin:14px 0 8px">';
  h+='<h3 style="font-size:14px;font-family:Georgia,serif;color:#6b2158">\uD83C\uDF38 Budget Lines</h3>';
  h+='<button onclick="cpL()" style="padding:5px 10px;border-radius:7px;border:1px solid #f5d0e6;background:#fff;color:#b45992;font-size:10px;font-weight:700;cursor:pointer">\uD83D\uDCCB Copy Last Month</button></div>';

  // Categories
  for(var j=0;j<BC.length;j++){
    var bc=BC[j];
    var catLines=exp.filter(function(b){return b.bc===bc.k});
    var catPlan=catLines.reduce(function(s,b){return s+(parseFloat(b.a)||0)},0);
    var catLineSpent=catLines.reduce(function(s,b){return s+(parseFloat(b.sp)||0)},0);
    var catEntrySpent=gsBCat(bc.k,me);
    var catSpent=catLineSpent+catEntrySpent;
    var catPct=catPlan>0?Math.min(catSpent/catPlan*100,100):0;
    var catRem=catPlan-catSpent;
    var isCol=col['bc-'+bc.k];

    h+='<div class="bsec" style="border-left:3px solid '+bc.c+'">';
    h+='<div class="bshd" onclick="ts(\'bc-'+bc.k+'\')">';
    h+='<h3 style="color:'+bc.c+'">'+bc.i+' '+bc.l;
    if(catPlan) h+=' <span style="font-size:10px;color:#b89aac">$'+catSpent.toFixed(0)+'/$'+catPlan.toFixed(0)+'</span>';
    h+='</h3><div style="display:flex;align-items:center;gap:4px">';
    if(catRem<0&&catPlan>0) h+='<span style="font-size:9px;color:#e11d48;font-weight:700">$'+Math.abs(catRem).toFixed(0)+' over</span>';
    else if(catPlan>0) h+='<span style="font-size:9px;color:#059669;font-weight:700">$'+catRem.toFixed(0)+' left</span>';
    h+='<span class="arr'+(isCol?'':' u')+'">\u25BC</span></div></div>';

    if(catPlan>0){
      var pc=catPct>100?'#e11d48':catPct>80?'#d97706':bc.c;
      h+='<div class="bpbar"><div class="bpfill" style="width:'+catPct+'%;background:'+pc+'"></div></div>';
    }

    h+='<div class="bsbd'+(isCol?' hd':'')+'">';
    h+='<div style="font-size:9px;color:#b89aac;font-style:italic;padding:0 4px 6px">'+bc.h+'</div>';

    for(var ci=0;ci<catLines.length;ci++){
      var ln=catLines[ci],isPd=ln.pd;
      h+='<div style="display:flex;align-items:center;padding:5px 4px;border-bottom:1px solid #fce7f3;gap:5px;opacity:'+(isPd?'.55':'1')+';flex-wrap:wrap">';
      // Paid toggle
      h+='<button onclick="tPd(\''+ln.id+'\')" style="width:16px;height:16px;border-radius:4px;border:2px solid '+(isPd?bc.c:'#e2c0d4')+';background:'+(isPd?bc.c:'#fff')+';cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:8px;padding:0">'+(isPd?'\u2713':'')+'</button>';
      // Label
      h+='<span style="font-size:11px;flex:1;min-width:50px;'+(isPd?'text-decoration:line-through':'')+'">'+es(ln.l)+'</span>';
      // Editable plan (show as subtle if zero for debt)
      var planVal=parseFloat(ln.a)||0;
      if(bc.hasBal&&planVal===0){
        h+='<span style="font-size:9px;color:#b89aac">plan:</span>';
        h+='<input type="number" value="'+(ln.a||'')+'" onchange="uF(\''+ln.id+'\',\'a\',this.value)" placeholder="0" style="width:45px;padding:2px 4px;border-radius:4px;border:1px dashed #e2c0d4;font-size:10px;outline:none;color:#b89aac;text-align:right">';
      } else {
        h+='<span style="font-size:9px;color:#b89aac">plan:</span>';
        h+='<input type="number" value="'+(ln.a||'')+'" onchange="uF(\''+ln.id+'\',\'a\',this.value)" style="width:55px;padding:2px 4px;border-radius:4px;border:1px solid #d4c0f5;font-size:10px;outline:none;color:#6b2158;text-align:right;font-weight:700">';
      }
      // Editable spent (hide if no plan for debt-only tracking)
      if(!bc.hasBal||planVal>0){
        h+='<span style="font-size:9px;color:#b89aac;margin-left:3px">spent:</span>';
        h+='<input type="number" value="'+(ln.sp||'')+'" onchange="uF(\''+ln.id+'\',\'sp\',this.value)" style="width:55px;padding:2px 4px;border-radius:4px;border:1px solid #f5d0e6;font-size:10px;outline:none;color:#4a2040;text-align:right">';
      } else {
        // For debt with $0 plan, still allow spent but make it optional looking
        h+='<span style="font-size:9px;color:#b89aac;margin-left:3px">paid:</span>';
        h+='<input type="number" value="'+(ln.sp||'')+'" onchange="uF(\''+ln.id+'\',\'sp\',this.value)" placeholder="0" style="width:55px;padding:2px 4px;border-radius:4px;border:1px dashed #bbf7d0;font-size:10px;outline:none;color:#059669;text-align:right">';
      }
      // Balance for debt
      if(bc.hasBal){
        h+='<span style="font-size:9px;color:#dc2626;margin-left:3px">bal:</span>';
        h+='<input type="number" value="'+(ln.bal||'')+'" onchange="uF(\''+ln.id+'\',\'bal\',this.value)" style="width:65px;padding:2px 4px;border-radius:4px;border:1px solid #fecaca;font-size:10px;outline:none;color:#dc2626;text-align:right;font-weight:700">';
      }
      h+='<button class="abt dl" style="font-size:9px;padding:1px 4px" onclick="dB(\''+ln.id+'\')">\u2715</button>';
      h+='</div>';
    }

    // Debt subtotal
    if(bc.hasBal&&catLines.length){
      var dBal=catLines.reduce(function(s,b2){return s+(parseFloat(b2.bal)||0)},0);
      var dPd=catLines.reduce(function(s,b2){return s+(parseFloat(b2.sp)||0)},0);
      h+='<div style="margin:8px 4px 4px;padding:8px 10px;background:linear-gradient(135deg,#fef2f2,#fff5f5);border-radius:8px;border:1px solid #fecaca;display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">';
      h+='<div><span style="font-size:9px;color:#dc2626;font-weight:700">Total Balance</span><strong style="display:block;font-size:16px;color:#dc2626">$'+dBal.toFixed(2)+'</strong></div>';
      h+='<div style="text-align:right"><span style="font-size:9px;color:#059669;font-weight:700">Paid This Month</span><strong style="display:block;font-size:16px;color:#059669">$'+dPd.toFixed(2)+'</strong></div></div>';
    }

    // Add form
    h+='<div style="display:flex;gap:4px;margin-top:6px;padding:0 4px;flex-wrap:wrap">';
    h+='<input class="fin" style="font-size:10px;padding:6px;flex:2;min-width:80px" id="bl_'+bc.k+'" placeholder="Line item...">';
    h+='<input class="fin" type="number" style="font-size:10px;padding:6px;max-width:70px" id="ba_'+bc.k+'" placeholder="Plan $">';
    if(bc.hasBal) h+='<input class="fin" type="number" style="font-size:10px;padding:6px;max-width:80px;border-color:#fecaca" id="bb_'+bc.k+'" placeholder="Bal $">';
    h+='<button onclick="aBL(\''+bc.k+'\')" style="padding:6px 10px;border-radius:6px;border:none;background:'+bc.c+';color:#fff;font-weight:700;font-size:10px;cursor:pointer;white-space:nowrap">+</button>';
    h+='</div></div></div>';
  }

  // Planner costs table
  var meWithCost=me.filter(function(e){return(e.cat==='trip'?tripTotal(e):(parseFloat(e.co)||0))>0});
  if(meWithCost.length){
    h+='<h3 style="font-size:14px;font-family:Georgia,serif;color:#6b2158;margin:14px 0 8px">\uD83D\uDED2 Planner Costs This Month</h3>';
    h+='<div class="btbl"><table><tr><th>Date</th><th>Cat</th><th>Entry</th><th>$</th></tr>';
    var sm=meWithCost.slice().sort(function(a,b2){return b2.d.localeCompare(a.d)});
    for(var si=0;si<sm.length;si++){
      var re=sm[si],rc=C[re.cat]||C.appt;
      var amt=re.cat==='trip'?tripTotal(re):(parseFloat(re.co)||0);
      h+='<tr><td>'+es(re.d)+'</td><td><span class="tg" style="background:'+rc.b+';color:'+rc.c+'">'+rc.i+'</span></td><td>'+es(re.t)+'</td><td class="ta">$'+amt.toFixed(0)+'</td></tr>';
    }
    h+='<tr class="ttl"><td colspan="3">TOTAL</td><td>$'+tEntrySpent.toFixed(0)+'</td></tr></table></div>';
  }
  el.innerHTML=h;
}

/* BUDGET ACTIONS */
// Universal field updater
window.uF=function(id,field,val){
  for(var i=0;i<B.length;i++){if(B[i].id===id){B[i][field]=val;sv();D();return}}
};
window.aI=function(){
  var l=document.getElementById('biL').value||'Income',a=document.getElementById('biA').value;
  if(!a||parseFloat(a)<=0) return;
  B.push({id:uid(),mo:bKey(),tp:'i',l:l,a:a});D();tt('\uD83D\uDCB0 Income added!');
};
window.aBL=function(bc2){
  var l=document.getElementById('bl_'+bc2).value;
  var a=document.getElementById('ba_'+bc2).value;
  var balEl=document.getElementById('bb_'+bc2);
  var bal=balEl?balEl.value:'';
  // For debt, allow adding with just a balance (no plan required)
  var hasBal2=false;
  for(var i=0;i<BC.length;i++){if(BC[i].k===bc2&&BC[i].hasBal){hasBal2=true;break}}
  if(hasBal2){
    if((!a||parseFloat(a)<=0)&&(!bal||parseFloat(bal)<=0)) return;
  } else {
    if(!a||parseFloat(a)<=0) return;
  }
  var found=null;for(var i2=0;i2<BC.length;i2++){if(BC[i2].k===bc2){found=BC[i2];break}}
  var item={id:uid(),mo:bKey(),tp:'e',bc:bc2,l:l||(found?found.l:''),a:a||'0'};
  if(bal) item.bal=bal;
  B.push(item);D();tt('\uD83C\uDF38 Line added!');
};
window.dB=function(id){B=B.filter(function(b){return b.id!==id});D();tt('\u2715 Removed','error')};
window.tPd=function(id){
  for(var i=0;i<B.length;i++){if(B[i].id===id){B[i].pd=!B[i].pd;if(B[i].pd&&!B[i].sp)B[i].sp=B[i].a;D();tt(B[i].pd?'\u2705 Paid':'\u21A9\uFE0F Unmarked');return}}
};
window.cpL=function(){
  var ck=bKey(),pm=Q.bm===0?11:Q.bm-1,py=Q.bm===0?Q.by-1:Q.by;
  var pk='b-'+py+'-'+p2(pm+1);
  var prev=B.filter(function(b){return b.mo===pk});
  if(!prev.length){tt('No last month data','error');return}
  if(B.filter(function(b){return b.mo===ck}).length){tt('Already has lines','error');return}
  for(var i=0;i<prev.length;i++){
    var cp={};for(var k in prev[i])cp[k]=prev[i][k];
    cp.id=uid();cp.mo=ck;cp.sp='';cp.pd=false;
    B.push(cp);
  }
  D();tt('\uD83D\uDCCB Copied!');
};
window.bP=function(){if(Q.bm===0){Q.bm=11;Q.by--}else Q.bm--;D()};
window.bN=function(){if(Q.bm===11){Q.bm=0;Q.by++}else Q.bm++;D()};

/* CALENDAR */
function rCal(){
  var el=document.getElementById('pg-cal'),dn2=dim(Q.cy,Q.cm),fd=new Date(Q.cy,Q.cm,1).getDay();
  var h='<div class="bx"><div class="cvh"><button onclick="cP()">\u2039</button><h2>\uD83C\uDF37 '+MN[Q.cm]+' '+Q.cy+'</h2><button onclick="cN()">\u203A</button></div><div class="cgr">';
  for(var i=0;i<DW.length;i++) h+='<div class="dwc">'+DW[i]+'</div>';
  for(var j=0;j<fd;j++) h+='<div></div>';
  for(var d=1;d<=dn2;d++){
    var ds=Q.cy+'-'+p2(Q.cm+1)+'-'+p2(d),de=dE(ds);
    h+='<div class="dyc'+(ds===TD?' td':'')+(Q.ed===ds?' ex':'')+'" onclick="tD(\''+ds+'\')">';
    h+='<div class="nmc"><span>'+d+'</span>';
    if(de.length) h+='<span class="ccnt">'+de.length+'</span>';
    h+='</div>';
    for(var n=0;n<Math.min(de.length,2);n++){
      var c2=C[de[n].cat]||C.appt;
      var dayLabel=es(de[n].t);
      if(de[n].d2){
        if(ds===de[n].d) dayLabel='\u25B6 '+dayLabel;
        else if(ds===de[n].d2) dayLabel=dayLabel+' \u25C0';
        else dayLabel='\u2500 '+dayLabel;
      }
      h+='<div class="mic" style="background:'+c2.b+';color:'+c2.c+'">'+dayLabel+'</div>';
    }
    if(de.length>2) h+='<div style="font-size:7px;color:#b89aac">+'+(de.length-2)+'</div>';
    h+='</div>';
  }
  h+='</div>';
  if(Q.ed){
    var de2=dE(Q.ed),nm=new Date(Q.ed+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
    h+='<div class="cdet"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h+='<h3 style="font-size:13px;font-family:Georgia,serif;color:#6b2158">\uD83D\uDCC5 '+nm+'</h3>';
    h+='<button onclick="oMD(\''+Q.ed+'\')" style="background:linear-gradient(135deg,#e74c8b,#b45992);color:#fff;border:none;border-radius:7px;padding:4px 10px;cursor:pointer;font-weight:700;font-size:10px">+ Add</button></div>';
    if(!de2.length) h+='<p style="color:#b89aac;font-size:11px;font-style:italic">No entries.</p>';
    else for(var px=0;px<de2.length;px++) h+=mkCard(de2[px]);
    h+='</div>';
  }
  h+='</div>';el.innerHTML=h;
}
function dE(ds){
  return E.filter(function(e){
    if(e.d===ds) return true;
    // Show on all days between start and end date
    if(e.d2 && ds>e.d && ds<=e.d2) return true;
    return false;
  });
}
window.cP=function(){if(Q.cm===0){Q.cm=11;Q.cy--}else Q.cm--;Q.ed=null;D()};
window.cN=function(){if(Q.cm===11){Q.cm=0;Q.cy++}else Q.cm++;Q.ed=null;D()};
window.tD=function(ds){Q.ed=Q.ed===ds?null:ds;D()};
window.tg=function(id){for(var i=0;i<E.length;i++){if(E[i].id===id){E[i].dn=!E[i].dn;D();tt(E[i].dn?'\u2705 Done!':'\u21A9\uFE0F Unmarked');return}}};

/* ENTRY MODAL */
window.openM=function(id){
  var e=null;if(id)for(var i=0;i<E.length;i++){if(E[i].id===id){e=E[i];break}}
  var dc='appt';if(Q.pg&&C[Q.pg])dc=Q.pg;
  var f=e||{cat:dc,t:'',d:TD,d2:'',co:'',n:'',ti:'',ti2:'',lo:'',cFlight:'',cHotel:'',cCar:''};
  curCat=f.cat;curId=e?e.id:'';
  var ie=!!e;
  var h='<div class="mhd"><h2>'+(ie?'\u270F\uFE0F Edit':'\uD83C\uDF38 New')+'</h2><button class="mxb" onclick="clM()">\u2715</button></div>';
  h+='<label class="flb">CATEGORY</label><div class="pls">';
  for(var j=0;j<CK.length;j++){
    var k=CK[j],c=C[k],on=f.cat===k;
    h+='<button class="plb'+(on?' on':'')+'" id="cp_'+k+'" style="'+(on?'border-color:'+c.c+';background:'+c.b+';color:'+c.c:'')+'" onclick="sC(\''+k+'\')">'+c.i+' '+c.l+'</button>';
  }
  h+='</div>';
  h+='<div class="fgr"><label class="flb">TITLE *</label><input class="fin" id="mT" value="'+es(f.t)+'" placeholder="Title..."></div>';
  h+='<div class="frd"><div class="fgr"><label class="flb">START DATE</label><input class="fin" type="date" id="mD" value="'+f.d+'"></div>';
  h+='<div class="fgr"><label class="flb">START TIME</label><input class="fin" type="time" id="mTi" value="'+es(f.ti||'')+'"></div></div>';
  h+='<div class="frd"><div class="fgr"><label class="flb">END DATE</label><input class="fin" type="date" id="mD2" value="'+(f.d2||'')+'"></div>';
  h+='<div class="fgr"><label class="flb">END TIME</label><input class="fin" type="time" id="mTi2" value="'+es(f.ti2||'')+'"></div></div>';
  h+='<div class="fgr"><label class="flb">LOCATION</label><input class="fin" id="mL" value="'+es(f.lo||'')+'" placeholder="Location..."></div>';

  // Trip-specific cost fields
  h+='<div id="tripCosts" style="display:'+(f.cat==='trip'?'block':'none')+'">';
  h+='<div style="font-size:11px;font-weight:700;color:#b45992;margin-bottom:6px">\u2708\uFE0F TRIP COSTS</div>';
  h+='<div class="frd"><div class="fgr"><label class="flb">\u2708\uFE0F Flight ($)</label><input class="fin" type="number" step="0.01" id="mCF" value="'+(f.cFlight||'')+'" placeholder="0.00"></div>';
  h+='<div class="fgr"><label class="flb">\uD83C\uDFE8 Hotel ($)</label><input class="fin" type="number" step="0.01" id="mCH" value="'+(f.cHotel||'')+'" placeholder="0.00"></div></div>';
  h+='<div class="fgr"><label class="flb">\uD83D\uDE97 Car Rental ($)</label><input class="fin" type="number" step="0.01" id="mCC" value="'+(f.cCar||'')+'" placeholder="0.00"></div>';
  h+='</div>';

  // Generic cost for non-trips
  h+='<div id="genCost" style="display:'+(f.cat==='trip'?'none':'block')+'">';
  h+='<div class="fgr"><label class="flb">COST ($)</label><input class="fin" type="number" step="0.01" id="mC" value="'+(f.co||'')+'" placeholder="0.00"></div>';
  h+='</div>';

  h+='<div class="fgr"><label class="flb">NOTES</label><textarea class="fin" rows="3" id="mN" style="resize:vertical" placeholder="Notes...">'+es(f.n)+'</textarea></div>';
  h+='<div class="mab">';
  if(ie) h+='<button class="mdb" onclick="aD(\''+e.id+'\');clM()">\uD83D\uDDD1\uFE0F</button>';
  h+='<div style="flex:1"></div><button class="mcb" onclick="clM()">Cancel</button><button class="msb" onclick="sE()">'+(ie?'Save':'Add')+'</button></div>';
  document.getElementById('eml').innerHTML=h;
  document.getElementById('eov').classList.add('op');
};
window.oMD=function(ds){openM();setTimeout(function(){document.getElementById('mD').value=ds},30)};
window.clM=function(){document.getElementById('eov').classList.remove('op')};
window.sC=function(k){
  curCat=k;
  for(var i=0;i<CK.length;i++){
    var el=document.getElementById('cp_'+CK[i]),c=C[CK[i]];
    if(CK[i]===k){el.className='plb on';el.style.borderColor=c.c;el.style.background=c.b;el.style.color=c.c}
    else{el.className='plb';el.style.borderColor='#f5d0e6';el.style.background='#fff';el.style.color='#a0758f'}
  }
  // Toggle trip vs generic cost fields
  var tc=document.getElementById('tripCosts');
  var gc=document.getElementById('genCost');
  if(tc) tc.style.display=k==='trip'?'block':'none';
  if(gc) gc.style.display=k==='trip'?'none':'block';
};
window.sE=function(){
  var t=(document.getElementById('mT').value||'').trim();if(!t) return;
  var o={id:curId||uid(),cat:curCat,t:t,
    d:document.getElementById('mD').value||TD,
    d2:document.getElementById('mD2').value||'',
    ti:document.getElementById('mTi').value||'',
    ti2:document.getElementById('mTi2').value||'',
    lo:document.getElementById('mL').value||'',
    n:document.getElementById('mN').value||'',
    dn:false
  };
  if(curCat==='trip'){
    o.cFlight=document.getElementById('mCF').value||'';
    o.cHotel=document.getElementById('mCH').value||'';
    o.cCar=document.getElementById('mCC').value||'';
    o.co='';
  } else {
    o.co=document.getElementById('mC').value||'';
    o.cFlight='';o.cHotel='';o.cCar='';
  }
  var found=false;
  if(curId){for(var i=0;i<E.length;i++){if(E[i].id===curId){o.dn=E[i].dn;E[i]=o;found=true;break}}}
  if(!found) E.push(o);
  clM();D();tt(curId?'\uD83C\uDF38 Updated!':'\uD83C\uDF37 Added!');
};
window.aD=function(id){
  cfA=function(){E=E.filter(function(e){return e.id!==id});clC();D();tt('\uD83D\uDDD1\uFE0F Deleted','error')};
  document.getElementById('cml').innerHTML='<div style="font-size:32px">\uD83C\uDF39</div><p>Delete this entry?</p><div class="cfbs"><button class="cfb1" onclick="clC()">Cancel</button><button class="cfb2" onclick="cfA()">Delete</button></div>';
  document.getElementById('cov').classList.add('op');
};
window.clC=function(){document.getElementById('cov').classList.remove('op')};

/* INIT */
rN();D();
})();
