/* Worlds Unbound V1.16 — character renderer based on the supplied sketch. */
(function(){
  const states=new WeakMap();
  function st(p){let s=states.get(p);if(!s){s={t:Math.random()*10,px:p.x,py:p.y,hp:p.hp,hit:0,phase:0};states.set(p,s)}return s}
  window.drawPlayer=function(p,team){
    const s=st(p),now=performance.now()/1000,dt=.016,dx=p.x-s.px,dy=p.y-s.py,moving=Math.hypot(dx,dy)>.08;s.px=p.x;s.py=p.y;
    if(moving)s.phase+=dt*9; else s.phase*=.92;
    if(typeof s.hp==='number'&&typeof p.hp==='number'&&p.hp<s.hp-.1)s.hit=.38;s.hp=p.hp;s.hit=Math.max(0,s.hit-dt);
    const down=!!p.downed,attack=!down&&p.attackTimer>0,main=team?'#61d9ff':'#d9f26b',outline='#11151b';
    const walk=Math.sin(s.phase),bob=down?0:(moving?Math.abs(walk)*2.3:Math.sin(now*2.3)*.7),hit=s.hit>0,recoil=hit?Math.sin(now*65)*2.5:0,leg=down?0:walk*7;
    ctx.save();ctx.translate(p.x+recoil,p.y+bob);if(down){ctx.rotate(-1.13+Math.sin(now*8)*.05);ctx.scale(1.18,.74)}else if(hit)ctx.rotate(Math.sin(now*55)*.07);else if(attack)ctx.rotate(.05);
    ctx.save();ctx.globalAlpha=.28;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,21,24,7,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.lineCap='round';ctx.strokeStyle=outline;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-8,9);ctx.lineTo(-8+leg*.34,32);ctx.moveTo(8,9);ctx.lineTo(8-leg*.34,32);ctx.stroke();ctx.strokeStyle=main;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-8,9);ctx.lineTo(-8+leg*.34,32);ctx.moveTo(8,9);ctx.lineTo(8-leg*.34,32);ctx.stroke();
    ctx.fillStyle=outline;ctx.beginPath();ctx.moveTo(-26,-13);ctx.quadraticCurveTo(-31,-2,-25,11);ctx.quadraticCurveTo(-17,22,0,22);ctx.quadraticCurveTo(20,22,28,8);ctx.quadraticCurveTo(31,-3,23,-15);ctx.closePath();ctx.fill();ctx.fillStyle=main;ctx.beginPath();ctx.moveTo(-22,-10);ctx.quadraticCurveTo(-27,-1,-21,9);ctx.quadraticCurveTo(-14,18,0,18);ctx.quadraticCurveTo(18,18,23,7);ctx.quadraticCurveTo(26,-2,20,-11);ctx.closePath();ctx.fill();
    ctx.fillStyle=outline;ctx.beginPath();ctx.moveTo(-32,-14);ctx.quadraticCurveTo(-23,-20,-18,-31);ctx.quadraticCurveTo(-12,-45,-4,-31);ctx.quadraticCurveTo(5,-22,15,-28);ctx.quadraticCurveTo(21,-35,25,-48);ctx.quadraticCurveTo(28,-55,35,-48);ctx.lineTo(40,-42);ctx.quadraticCurveTo(37,-23,25,-15);ctx.quadraticCurveTo(3,-8,-32,-14);ctx.closePath();ctx.fill();ctx.fillStyle=main;ctx.beginPath();ctx.moveTo(-27,-16);ctx.quadraticCurveTo(-19,-22,-14,-32);ctx.quadraticCurveTo(-11,-39,-6,-30);ctx.quadraticCurveTo(5,-19,16,-27);ctx.quadraticCurveTo(22,-33,27,-44);ctx.quadraticCurveTo(29,-49,34,-44);ctx.quadraticCurveTo(32,-28,23,-18);ctx.quadraticCurveTo(0,-11,-27,-16);ctx.closePath();ctx.fill();
    ctx.fillStyle='#15171d';ctx.beginPath();ctx.arc(-6,-1,4.2,0,Math.PI*2);ctx.arc(9,-2,4.2,0,Math.PI*2);ctx.fill();
    if(attack){ctx.save();ctx.globalAlpha=.7;ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(21,-2,27,-.95,.5);ctx.stroke();ctx.restore()}
    if(hit){ctx.fillStyle='rgba(255,55,70,.5)';ctx.beginPath();ctx.arc(0,-3,32,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff6872';for(let i=0;i<5;i++){const a=now*5+i*1.25;ctx.beginPath();ctx.arc(Math.cos(a)*29,Math.sin(a)*24-3,2.5,0,Math.PI*2);ctx.fill()}}
    if(down){ctx.fillStyle='#ff6570';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('DOWNED',0,-31);ctx.strokeStyle='#ff6570';ctx.lineWidth=2;ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(0,0,35+Math.sin(now*5)*3,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
    ctx.restore();if(p.carriedBy){ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,31,0,Math.PI*2);ctx.stroke()}if(p.name){ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(p.name,p.x,p.y-(down?35:58));ctx.textAlign='left'}
  };
})();
