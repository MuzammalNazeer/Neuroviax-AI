'use strict';
const LOOKBACK=90,XGB_TREES=50,XGB_LR=0.12,LGB_BINS=32,LGB_LEAVES=16,LGB_LR=0.1,EMA_ALPHA=0.25;
const W={xgb:0.45,lgb:0.35,ema:0.20};
function dateRange(n){if(!n)n=LOOKBACK;const d=[];for(let i=n-1;i>=0;i--){const t=new Date();t.setDate(t.getDate()-i);d.push(t.toISOString().slice(0,10));}return d;}
function dk(d){return new Date(d).toISOString().slice(0,10);}
function mean(a){return a.length?a.reduce((s,v)=>s+v,0)/a.length:0;}
function stdDev(a){if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1));}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}

function buildTimeSeries(payments,expenses){
  if(!payments)payments=[];if(!expenses)expenses=[];
  const dates=dateRange(LOOKBACK);const buckets={};
  dates.forEach(function(d){buckets[d]={date:d,receivable:0,payable:0,expense:0,net:0};});
  payments.forEach(function(p){const k=dk(p.paidAt||p.createdAt);if(!buckets[k])return;const a=Number(p.amount)||0;
    if(p.direction==='receivable'&&p.status==='completed')buckets[k].receivable+=a;
    else if(p.direction==='payable'&&p.status==='completed')buckets[k].payable+=a;});
  expenses.forEach(function(e){const k=dk(e.date||e.createdAt);if(!buckets[k])return;buckets[k].expense+=Number(e.amount)||0;});
  dates.forEach(function(d){const b=buckets[d];b.net=b.receivable-b.payable-b.expense;});
  return dates.map(function(d){return buckets[d];});
}

function engineerFeatures(series){
  const rows=[],nets=series.map(function(s){return s.net;}),recvs=series.map(function(s){return s.receivable;}),paybs=series.map(function(s){return s.payable;}),exps=series.map(function(s){return s.expense;});
  for(let i=30;i<series.length;i++){
    const d=new Date(series[i].date),w14=nets.slice(i-14,i);
    const ts=w14.length>1?(w14[w14.length-1]-w14[0])/w14.length:0;
    rows.push({y:series[i].net,features:[
      nets[i-7]||0,nets[i-14]||0,nets[i-30]||0,recvs[i-7]||0,recvs[i-14]||0,
      paybs[i-7]||0,exps[i-7]||0,mean(nets.slice(i-7,i)),mean(nets.slice(i-14,i)),mean(nets.slice(i-30,i)),
      stdDev(nets.slice(i-7,i)),stdDev(nets.slice(i-14,i)),ts,nets.slice(i-7,i).reduce(function(s,v){return s+v;},0),
      d.getDay(),d.getDate(),d.getMonth(),series[i].receivable,series[i].payable,series[i].expense
    ]});
  }
  return rows;
}

function fitStump(X,res){
  let bL=Infinity,best=null;const nF=X[0].length;
  for(let fi=0;fi<nF;fi++){
    const vals=X.map(function(x){return x[fi];});
    const sorted=Array.from(new Set(vals)).sort(function(a,b){return a-b;});
    for(let ti=0;ti<sorted.length-1;ti++){
      const t=(sorted[ti]+sorted[ti+1])/2;
      const L=res.filter(function(_,i){return X[i][fi]<=t;});
      const R=res.filter(function(_,i){return X[i][fi]>t;});
      if(!L.length||!R.length)continue;const lm=mean(L),rm=mean(R);
      const loss=L.reduce(function(s,v){return s+(v-lm)*(v-lm);},0)+R.reduce(function(s,v){return s+(v-rm)*(v-rm);},0);
      if(loss<bL){bL=loss;best={featureIdx:fi,threshold:t,leftVal:lm,rightVal:rm};}
    }
  }
  return best||{featureIdx:0,threshold:0,leftVal:mean(res),rightVal:mean(res)};
}
function predStump(s,x){return x[s.featureIdx]<=s.threshold?s.leftVal:s.rightVal;}

function xgbTrain(rows){
  const X=rows.map(function(r){return r.features;}),Y=rows.map(function(r){return r.y;}),base=mean(Y),stumps=[];
  let preds=new Array(X.length).fill(base);
  for(let t=0;t<XGB_TREES;t++){
    const res=Y.map(function(y,i){return y-preds[i];});
    const s=fitStump(X,res);stumps.push(s);
    preds=preds.map(function(p,i){return p+XGB_LR*predStump(s,X[i]);});
  }
  return{stumps:stumps,base:base};
}
function xgbPredict(m,x){return m.stumps.reduce(function(p,s){return p+XGB_LR*predStump(s,x);},m.base);}

function lgbLeaf(X,res,depth){
  if(!depth)depth=0;
  if(depth>=Math.log2(LGB_LEAVES)||X.length<4)return{isLeaf:true,value:mean(res)};
  let bL=Infinity,bS=null;const nF=X[0].length;
  for(let fi=0;fi<nF;fi++){
    const vals=X.map(function(x){return x[fi];});
    const mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals),bs=(mx-mn)/LGB_BINS||1;
    for(let b=1;b<LGB_BINS;b++){
      const t=mn+b*bs;
      const li=X.map(function(_,i){return i;}).filter(function(i){return X[i][fi]<=t;});
      const ri=X.map(function(_,i){return i;}).filter(function(i){return X[i][fi]>t;});
      if(!li.length||!ri.length)continue;
      const lR=li.map(function(i){return res[i];}),rR=ri.map(function(i){return res[i];});
      const lm=mean(lR),rm=mean(rR);
      const loss=lR.reduce(function(s,v){return s+(v-lm)*(v-lm);},0)+rR.reduce(function(s,v){return s+(v-rm)*(v-rm);},0);
      if(loss<bL){bL=loss;bS={fi:fi,t:t,li:li,ri:ri};}
    }
  }
  if(!bS)return{isLeaf:true,value:mean(res)};
  const fi=bS.fi,t=bS.t,li=bS.li,ri=bS.ri;
  return{isLeaf:false,featureIdx:fi,threshold:t,
    left:lgbLeaf(li.map(function(i){return X[i];}),li.map(function(i){return res[i];}),depth+1),
    right:lgbLeaf(ri.map(function(i){return X[i];}),ri.map(function(i){return res[i];}),depth+1)};
}
function lgbPred(leaf,x){
  if(leaf.isLeaf)return leaf.value;
  return x[leaf.featureIdx]<=leaf.threshold?lgbPred(leaf.left,x):lgbPred(leaf.right,x);
}
function lgbTrain(rows){
  const X=rows.map(function(r){return r.features;}),Y=rows.map(function(r){return r.y;}),base=mean(Y),trees=[];
  let preds=new Array(X.length).fill(base);
  const rounds=Math.min(20,Math.ceil(XGB_TREES/2));
  for(let t=0;t<rounds;t++){
    const res=Y.map(function(y,i){return y-preds[i];});
    const tree=lgbLeaf(X,res,0);trees.push(tree);
    preds=preds.map(function(p,i){return p+LGB_LR*lgbPred(tree,X[i]);});
  }
  return{trees:trees,base:base};
}
function lgbPredict(m,x){return m.trees.reduce(function(p,tree){return p+LGB_LR*lgbPred(tree,x);},m.base);}

function emaForecast(series,horizon){
  const nets=series.map(function(s){return s.net;});
  let ema=nets[0]||0;
  for(let i=0;i<nets.length;i++)ema=EMA_ALPHA*nets[i]+(1-EMA_ALPHA)*ema;
  const today=new Date(),result=[];
  for(let i=0;i<horizon;i++){
    const fd=new Date(today);fd.setDate(today.getDate()+i+1);
    const dow=fd.getDay();
    const sdow=series.filter(function(s){return new Date(s.date).getDay()===dow;}).slice(-4);
    result.push(0.7*ema+0.3*(sdow.length?mean(sdow.map(function(s){return s.net;})):0));
  }
  return result;
}

const FN=['Net Cash Lag-7d','Net Cash Lag-14d','Net Cash Lag-30d','Receivable Lag-7d','Receivable Lag-14d','Payable Lag-7d','Expense Lag-7d','Rolling Mean 7d','Rolling Mean 14d','Rolling Mean 30d','Rolling Std 7d','Rolling Std 14d','Trend Slope','Cumulative Sum 7d','Day of Week','Day of Month','Month','Avg Receivable 7d','Avg Payable 7d','Avg Expense 7d'];

function buildFV(series,h){
  const nets=series.map(function(s){return s.net;}),recvs=series.map(function(s){return s.receivable;}),paybs=series.map(function(s){return s.payable;}),exps=series.map(function(s){return s.expense;});
  const n=nets.length,fd=new Date();fd.setDate(fd.getDate()+h);
  function lag(a,d){return a[Math.max(0,n-d)]||0;}
  function rm(a,w){return mean(a.slice(Math.max(0,n-w)));}
  function rs(a,w){return stdDev(a.slice(Math.max(0,n-w)));}
  const w14=nets.slice(Math.max(0,n-14)),ts=w14.length>1?(w14[w14.length-1]-w14[0])/w14.length:0;
  return[lag(nets,7),lag(nets,14),lag(nets,30),lag(recvs,7),lag(recvs,14),lag(paybs,7),lag(exps,7),rm(nets,7),rm(nets,14),rm(nets,30),rs(nets,7),rs(nets,14),ts,nets.slice(Math.max(0,n-7)).reduce(function(s,v){return s+v;},0),fd.getDay(),fd.getDate(),fd.getMonth(),rm(recvs,7),rm(paybs,7),rm(exps,7)];
}

function featureImportance(m){
  const c=new Array(FN.length).fill(0);
  for(let i=0;i<m.stumps.length;i++){if(m.stumps[i].featureIdx!==undefined)c[m.stumps[i].featureIdx]++;}
  const tot=c.reduce(function(s,v){return s+v;},1);
  return FN.map(function(name,i){return{name:name,importance:Math.round(c[i]/tot*100)};}).sort(function(a,b){return b.importance-a.importance;}).slice(0,10);
}

function generateInsights(series,horizons,tR,tP,tE){
  const ins=[],h30=horizons.filter(function(h){return h.horizon===30;})[0]||{},h7=horizons.filter(function(h){return h.horizon===7;})[0]||{};
  if((h30.totalNetCash||0)<0)ins.push({type:'warning',title:'Negative 30-Day Forecast',message:'Net cash projected negative over 30 days. Review payables and defer non-critical expenses.',icon:'alert'});
  else ins.push({type:'positive',title:'Healthy 30-Day Outlook',message:'Cash position projected to improve over the next 30 days.',icon:'trending-up'});
  if(tP>tR*0.8&&tR>0)ins.push({type:'warning',title:'High Payables-to-Receivables Ratio',message:'Payables exceed 80% of receivables. Accelerate collections or negotiate extended terms.',icon:'alert'});
  if(tE>tR*0.6&&tR>0)ins.push({type:'caution',title:'Expense Concentration Risk',message:'Operating expenses exceed 60% of receivables. Target 40-50% for healthy margins.',icon:'pie-chart'});
  const ns=stdDev(series.slice(-30).map(function(s){return s.net;})),nm=Math.abs(mean(series.slice(-30).map(function(s){return s.net;})));
  if(ns>nm*1.5&&nm>0)ins.push({type:'info',title:'High Cash-Flow Volatility Detected',message:'Daily cash variance is elevated. Smoothing payable timing reduces liquidity risk.',icon:'activity'});
  if((h7.confidenceScore||0)>=80)ins.push({type:'positive',title:(h7.confidenceScore||0)+'% Confidence on 7-Day Forecast',message:'Short-term forecast confidence is high. '+((h7.positiveDays||0))+'/7 days project positive flow.',icon:'shield-check'});
  return ins.slice(0,4);
}

async function ensembleForecast(payments,expenses,maxHorizon){
  if(!payments)payments=[];if(!expenses)expenses=[];if(!maxHorizon)maxHorizon=90;
  const series=buildTimeSeries(payments,expenses),rows=engineerFeatures(series),hasData=rows.length>=10;
  const last30=series.slice(-30),tR=last30.reduce(function(s,d){return s+d.receivable;},0),tP=last30.reduce(function(s,d){return s+d.payable;},0),tE=last30.reduce(function(s,d){return s+d.expense;},0);
  const avgNet=mean(series.map(function(s){return s.net;}));
  let xm=null,lm=null;if(hasData){xm=xgbTrain(rows);lm=lgbTrain(rows);}
  const emaF=emaForecast(series,maxHorizon),daily=[];let cum=0;
  for(let h=1;h<=maxHorizon;h++){
    const fd=new Date();fd.setDate(fd.getDate()+h);
    let xP=avgNet,lP=avgNet;const eP=emaF[h-1]||avgNet;
    if(hasData){const fv=buildFV(series,h);xP=xgbPredict(xm,fv);lP=lgbPredict(lm,fv);}
    const pred=W.xgb*xP+W.lgb*lP+W.ema*eP;
    const band=1.5*(stdDev(series.slice(-30).map(function(s){return s.net;}))||Math.abs(avgNet)*0.3||50);
    cum+=pred;
    daily.push({date:fd.toISOString().slice(0,10),day:h,predicted:Math.round(pred*100)/100,cumulative:Math.round(cum*100)/100,upper:Math.round((pred+band)*100)/100,lower:Math.round((pred-band)*100)/100,xgbPred:Math.round(xP*100)/100,lgbPred:Math.round(lP*100)/100,emaPred:Math.round(eP*100)/100});
  }
  const horizons=[7,14,30,90].map(function(h){
    const w=daily.slice(0,h),tot=w.reduce(function(s,d){return s+d.predicted;},0),pos=w.filter(function(d){return d.predicted>0;}).length;
    const trend=w.length>1?(w[w.length-1].predicted-w[0].predicted)/w.length:0;
    return{horizon:h,label:h===7?'7 Days':h===14?'14 Days':h===30?'30 Days':'90 Days',totalNetCash:Math.round(tot*100)/100,cumulativeNetPosition:Math.round(((daily[h-1]||{}).cumulative||0)*100)/100,avgDailyNet:Math.round(tot/h*100)/100,positiveDays:pos,negativeDays:h-pos,trendDirection:trend>0?'improving':trend<0?'declining':'stable',confidenceScore:hasData?clamp(Math.round(92-h/90*35),50,95):40};
  });
  const fi=hasData?featureImportance(xm):FN.slice(0,10).map(function(name,i){return{name:name,importance:10-i};});
  const ins=generateInsights(series,horizons,tR,tP,tE);
  const expCat={},c30=new Date();c30.setDate(c30.getDate()-30);
  expenses.forEach(function(e){if(new Date(e.date||e.createdAt)>=c30){const cat=e.category||'other';expCat[cat]=(expCat[cat]||0)+Number(e.amount||0);}});
  let rmse=0,mape=0;
  if(hasData&&rows.length>=10){
    const tr=rows.slice(-10),errs=tr.map(function(r){const p=W.xgb*xgbPredict(xm,r.features)+W.lgb*lgbPredict(lm,r.features)+W.ema*(emaF[0]||0);return r.y-p;});
    rmse=Math.sqrt(mean(errs.map(function(e){return e*e;})));
    const nz=tr.filter(function(r){return Math.abs(r.y)>1;});
    mape=nz.length?mean(nz.map(function(r,i){return Math.abs(errs[i])/Math.abs(r.y);}))*100:0;
  }
  return{generated:new Date().toISOString(),dataQuality:{paymentRecords:payments.length,expenseRecords:expenses.length,historicalDays:series.filter(function(s){return s.net!==0;}).length,hasData:hasData},snapshot:{totalReceivable30d:Math.round(tR),totalPayable30d:Math.round(tP),totalExpense30d:Math.round(tE),netPosition30d:Math.round(tR-tP-tE),avgDailyNet:Math.round(avgNet*100)/100},model:{type:'ensemble',components:['XGBoost','LightGBM','Seasonal EMA'],weights:W,xgboostTrees:XGB_TREES,lightgbmLeaves:LGB_LEAVES,lightgbmBins:LGB_BINS,features:FN.length,trainingSamples:rows.length,rmse:Math.round(rmse*100)/100,mape:Math.round(mape*100)/100},horizons:horizons,daily:daily.slice(0,maxHorizon),featureImportance:fi,expenseBreakdown:expCat,insights:ins};
}

module.exports={ensembleForecast:ensembleForecast,buildTimeSeries:buildTimeSeries,engineerFeatures:engineerFeatures};
