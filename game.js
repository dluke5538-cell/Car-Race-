const ACCESS_CODE="DUKE01"; // Change this before publishing.

const gate=document.querySelector("#gate"), game=document.querySelector("#game");
const code=document.querySelector("#code"), gateMsg=document.querySelector("#gateMsg");
document.querySelector("#unlock").onclick=()=>{if(code.value===ACCESS_CODE){gate.classList.add("hidden");game.classList.remove("hidden");startRace()}else gateMsg.textContent="Wrong access code."};
code.addEventListener("keydown",e=>{if(e.key==="Enter")document.querySelector("#unlock").click()});

const canvas=document.querySelector("#canvas"),ctx=canvas.getContext("2d");
const speedEl=document.querySelector("#speed"),timeEl=document.querySelector("#time"),cpEl=document.querySelector("#cp");
const finish=document.querySelector("#finish"),finalTime=document.querySelector("#finalTime");
let W=900,H=520, car, keys={}, running=false, start=0,last=0,elapsed=0,raf=0;
let checkpoints=[], checkpointIndex=0;

function resize(){
  const r=canvas.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.floor(r.width*d);canvas.height=Math.floor((r.width*H/W)*d);
}
window.addEventListener("resize",resize); resize();

function resetCar(){car={x:450,y:430,angle:0,speed:0,max:9};}
function makeCheckpoints(){
  checkpoints=[
    {x:450,y:300,r:55},{x:650,y:205,r:55},{x:730,y:105,r:55},
    {x:300,y:105,r:55},{x:170,y:230,r:55}
  ];
}
function startRace(){
  cancelAnimationFrame(raf);finish.classList.add("hidden");
  resetCar();makeCheckpoints();checkpointIndex=0;elapsed=0;running=true;
  start=performance.now();last=start;draw();raf=requestAnimationFrame(loop);
}
function formatTime(t){let m=Math.floor(t/60),s=(t%60).toFixed(1).padStart(4,"0");return String(m).padStart(2,"0")+":"+s}
function loop(now){
  if(!running)return;
  const dt=Math.min(.035,(now-last)/1000);last=now;elapsed=(now-start)/1000;
  update(dt);draw();
  speedEl.textContent=Math.round(car.speed*18);
  timeEl.textContent=formatTime(elapsed);
  cpEl.textContent=checkpointIndex+"/5";
  raf=requestAnimationFrame(loop);
}
function update(dt){
  const gas=keys.gas,brake=keys.brake;
  if(gas)car.speed+=15*dt;else car.speed-=5*dt;
  if(brake)car.speed-=22*dt;
  car.speed=Math.max(0,Math.min(car.max,car.speed));
  const steer=(keys.left?-1:0)+(keys.right?1:0);
  car.angle+=steer*1.9*dt*(car.speed/car.max);
  car.x+=Math.sin(car.angle)*car.speed*60*dt;
  car.y-=Math.cos(car.angle)*car.speed*60*dt;
  // keep player on the map
  car.x=Math.max(90,Math.min(810,car.x));car.y=Math.max(55,Math.min(465,car.y));
  const c=checkpoints[checkpointIndex];
  if(Math.hypot(car.x-c.x,car.y-c.y)<c.r){checkpointIndex++;if(checkpointIndex>=5){finishRace()}}
}
function finishRace(){
  running=false;finalTime.textContent=formatTime(elapsed);finish.classList.remove("hidden");
}
function draw(){
  const sx=canvas.width/W,sy=canvas.height/H;ctx.setTransform(sx,0,0,sy,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#26352a";ctx.fillRect(0,0,W,H);
  // grass details
  ctx.fillStyle="#304434";for(let x=0;x<W;x+=35)for(let y=0;y<H;y+=35)ctx.fillRect(x+(y%70),y,2,9);
  // road circuit
  ctx.fillStyle="#20242a";ctx.beginPath();ctx.moveTo(125,430);ctx.quadraticCurveTo(60,300,145,130);ctx.quadraticCurveTo(260,35,470,70);ctx.quadraticCurveTo(700,45,780,145);ctx.quadraticCurveTo(850,260,745,380);ctx.quadraticCurveTo(620,495,400,450);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#d5d8dc";ctx.lineWidth=8;ctx.stroke();
  ctx.strokeStyle="#7f8790";ctx.lineWidth=2;ctx.setLineDash([18,18]);ctx.stroke();ctx.setLineDash([]);
  // start/finish
  ctx.fillStyle="#fff";for(let i=0;i<8;i++){ctx.fillRect(425+i*12,418,12,8);ctx.fillStyle=i%2?"#111":"#fff"}ctx.fillStyle="#fff";
  // checkpoint
  if(checkpointIndex<5){let c=checkpoints[checkpointIndex];ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,Math.PI*2);ctx.strokeStyle="#55e38c";ctx.lineWidth=3;ctx.setLineDash([8,8]);ctx.stroke();ctx.setLineDash([])}
  // car
  ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle);
  ctx.fillStyle="#55e38c";ctx.fillRect(-17,-28,34,56);ctx.fillStyle="#101820";ctx.fillRect(-11,-13,22,17);
  ctx.fillStyle="#080a0f";ctx.fillRect(-21,-20,5,14);ctx.fillRect(16,-20,5,14);ctx.fillRect(-21,10,5,14);ctx.fillRect(16,10,5,14);
  ctx.fillStyle="#fff";ctx.fillRect(-11,-24,22,4);ctx.restore();
}
function setKey(k,v){keys[k]=v}
document.querySelectorAll(".controls button").forEach(b=>{
  const k=b.dataset.key;if(!k)return;
  ["pointerdown"].forEach(e=>b.addEventListener(e,ev=>{ev.preventDefault();setKey(k,true)}));
  ["pointerup","pointercancel","pointerleave"].forEach(e=>b.addEventListener(e,ev=>{ev.preventDefault();setKey(k,false)}));
});
window.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=true;
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=true;
  if(e.key==="ArrowUp"||e.key.toLowerCase()==="w")keys.gas=true;
  if(e.key==="ArrowDown"||e.key.toLowerCase()==="s")keys.brake=true;
});
window.addEventListener("keyup",e=>{
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=false;
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=false;
  if(e.key==="ArrowUp"||e.key.toLowerCase()==="w")keys.gas=false;
  if(e.key==="ArrowDown"||e.key.toLowerCase()==="s")keys.brake=false;
});
document.querySelector("#restart").onclick=startRace;
document.querySelector("#again").onclick=startRace;
