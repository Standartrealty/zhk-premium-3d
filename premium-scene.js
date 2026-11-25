import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {buildFacade, streetEntrances} from './premium-facade.js?v=facade-20261126';
const scene=new T.Scene();scene.background=new T.Color('#e9e9e0');scene.fog=new T.Fog('#e9e9e0',400,1000);
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;document.querySelector('#scene').appendChild(renderer.domElement);
const camera=new T.PerspectiveCamera(42,innerWidth/innerHeight,.1,1400);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.maxPolarAngle=1.555;controls.minDistance=2.5;controls.maxDistance=900;controls.target.set(0,12,-1);
const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.65;pm.dispose();
const sun=new T.DirectionalLight('#fff0d7',3.0);sun.position.set(-45,85,-55);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);Object.assign(sun.shadow.camera,{left:-105,right:105,top:100,bottom:-100,near:1,far:260});sun.shadow.bias=-.00025;sun.shadow.normalBias=.07;sun.target.position.set(0,0,0);scene.add(sun,sun.target);const sky=new T.HemisphereLight('#e5edff','#7d7763',1.5);scene.add(sky);const facadeFill=new T.DirectionalLight('#ecf3ff',.65);facadeFill.position.set(25,60,-85);scene.add(facadeFill);
let seed=14;function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}const mats={};
function material(name,color,roughness=.8,metalness=0){return mats[name]=new T.MeshStandardMaterial({color,roughness,metalness})}
function texture(kind,base,palette=[]){const c=document.createElement('canvas');c.width=c.height=512;const q=c.getContext('2d');q.fillStyle=base;q.fillRect(0,0,512,512);
 if(kind==='brick'){
    for(let row=0;row<32;row++){
        for(let column=-1;column<8;column++){
            const x=column*64+(row%2)*32, y=row*16;
            q.fillStyle=palette[Math.floor(rnd()*palette.length)];
            q.fillRect(x+1,y+1,62,14);
            q.fillStyle='#ffffff21';
            q.fillRect(x+1,y+1,62,1);
            q.fillStyle='#110a061f';
            q.fillRect(x+1,y+14,62,1);
        }
    }
    for(let i=0;i<10500;i++){
        q.fillStyle=rnd()<.53?'#2b201717':'#fff5dd19';
        q.fillRect(rnd()*512,rnd()*512,.65+rnd()*1.8,.55+rnd()*1.2);
    }
 }
 if(kind==='stone'){for(let i=0;i<25000;i++){q.fillStyle=rnd()<.5?'#ffffff18':'#00000015';q.fillRect(rnd()*512,rnd()*512,1+rnd()*3,1+rnd()*3)}q.strokeStyle='#ffffff15';q.lineWidth=2;for(let y=0;y<512;y+=128){q.strokeRect(0,y,256,128);q.strokeRect(256,y,256,128)}}
 if(kind==='paving'){q.fillStyle='#b8b6ab';q.fillRect(0,0,512,512);for(let r=0;r<16;r++)for(let col=-1;col<9;col++){let n=157+Math.floor(rnd()*40);q.fillStyle=`rgb(${n+7},${n+4},${n})`;q.fillRect(col*64+(r%2)*32+1,r*32+1,62,30)}}
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t}
function masonry(name, joint, colors, roughness=.89){
    const m=material(name,'#ffffff',roughness);
    m.map=texture('brick',joint,colors);
    return m;
}
const brick=masonry('FiredUmberBrick','#75645d',['#68493e','#785244','#895f4f','#5f463e','#986950','#6c4b40','#765446','#705147']);
const sand=masonry('SandBrick','#a88b68',['#b69564','#c5a374','#bea071','#cba773','#bf9d66','#cfad7c','#bb9b70']);
const pale=masonry('PaleCrownBrick','#a99b8a',['#c8bba7','#d2c5b3','#c3b29d','#d6c8b5','#d0bfaa','#c4b6a5']);
const darkBase=masonry('GraphiteBrick','#4c4e50',['#44494d','#515359','#3b4046','#4b5056','#444951','#53565a'],.83);
const granite=material('granite','#e1e1dd');granite.map=texture('stone','#727779');
const interior=material('RecessBacking','#282728',.94);
const graphite=material('graphite','#30383c',.58,.35);const frame=material('frame','#1b2429',.42,.55);const glass=new T.MeshPhysicalMaterial({color:'#647e8b',roughness:.18,metalness:.12,clearcoat:.65,clearcoatRoughness:.12});glass.envMapIntensity=.55;const warmGlass=material('litWindows','#a18d62',.36,.2);warmGlass.emissive=new T.Color('#ffd69a');warmGlass.emissiveIntensity=.02;const curtain=material('curtain','#b6b1a2');const timber=material('timber','#97704b',.72);const pavement=material('paving','#d2cbbf');pavement.map=texture('paving');const road=material('road','#62676b');road.map=texture('stone','#64696b');const white=material('white','#e6e1d5');const grass=material('grass','#667446');const earth=material('earth','#4b4734');const leafM=[material('leaf0','#486438'),material('leaf1','#617c3e'),material('leaf2','#79914a'),material('leaf3','#8c9b58')];const flower=material('flower','#e4e4bd');const blue=material('play','#728994');const light=material('light','#fff6d7',.3);light.emissive=new T.Color('#ffe1a0');light.emissiveIntensity=.4;const bark=material('bark','#62503c');
function worldTexture(mat,scale,vertical=false,bump=0){
 mat.onBeforeCompile=shader=>{
 shader.vertexShader='varying vec3 vTextureWorld;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
 vec4 texturePosition=vec4(transformed,1.0);
 #ifdef USE_INSTANCING
 texturePosition=instanceMatrix*texturePosition;
 #endif
 vTextureWorld=(modelMatrix*texturePosition).xyz;`);
 shader.fragmentShader='varying vec3 vTextureWorld;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
 vec3 worldN=abs(normalize(cross(dFdx(vTextureWorld),dFdy(vTextureWorld))));
 vec2 uvWorld=${vertical?'(worldN.z>worldN.x?vTextureWorld.xy:vTextureWorld.zy)':'vTextureWorld.xz'}*${scale};
 vec4 sampledDiffuseColor=texture2D(map,uvWorld);
 diffuseColor*=sampledDiffuseColor;
 #endif`);
 if(bump>0){
 shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 vec3 wn=abs(normalize(cross(dFdx(vTextureWorld),dFdy(vTextureWorld))));
 vec2 uvDetail=${vertical?'(wn.z>wn.x?vTextureWorld.xy:vTextureWorld.zy)':'vTextureWorld.xz'}*${scale};
 float relief=dot(texture2D(map,uvDetail).rgb,vec3(.333));
 vec3 px=dFdx(-vViewPosition),py=dFdy(-vViewPosition);
 vec3 ra=cross(py,normal),rb=cross(normal,px);
 float det=dot(px,ra);
 normal=normalize(normal-sign(det)*(dFdx(relief)*ra+dFdy(relief)*rb)*${bump.toFixed(4)});
 `);
 }
 };mat.customProgramCacheKey=()=>String(scale)+vertical+bump;
}
for(const m of [brick,sand,pale,darkBase]) worldTexture(m,.48,true,.055);
worldTexture(granite,.5,true,.035);
worldTexture(pavement,.30,false,.035);
worldTexture(road,.22);
const windowMats=[];
for(let variant=0;variant<8;variant++){
 const c=document.createElement('canvas');c.width=128;c.height=256;const q=c.getContext('2d');
 const bg=q.createLinearGradient(0,0,128,256);bg.addColorStop(0,variant%3?'#b6cbd3':'#c8c7ba');bg.addColorStop(.49,'#788e95');bg.addColorStop(1,'#455d63');q.fillStyle=bg;q.fillRect(0,0,128,256);
 q.fillStyle='#ded5c457';for(let i=0;i<9;i++)q.fillRect((variant%2?0:103)+i*2,0,1.2,256);
 q.fillStyle='#18292c33';q.fillRect(8,190,112,66);q.fillStyle='#f3dfb433';q.fillRect(20,165,40,60);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;
 windowMats.push(new T.MeshPhysicalMaterial({map:t,color:'#91a5ae',roughness:.18+variant*.012,metalness:.12,clearcoat:.65,clearcoatRoughness:.12,envMapIntensity:.55}));
}
const shopGlass=new T.MeshPhysicalMaterial({map:windowMats[0].map,color:'#8a8372',roughness:.23,metalness:.12,clearcoat:.47,envMapIntensity:.53});
const pools=new Map(),boxGeo=new T.BoxGeometry(1,1,1),cylGeo=new T.CylinderGeometry(1,1,1,12),sphereGeo=new T.SphereGeometry(1,16,10);const matrix=new T.Matrix4(),quat=new T.Quaternion();let objectCount=0;
const leafGeo=new T.BufferGeometry();
leafGeo.setAttribute('position',new T.Float32BufferAttribute([0,0,-1,-.42,.08,-.40,.42,.08,-.4,-.48,.13,.25,.48,.13,.25,0,0,1,0,.18,0],3));
leafGeo.setIndex([0,1,6,0,6,2,1,3,6,2,6,4,3,5,6,4,6,5]);leafGeo.computeVertexNormals();
for(const m of leafM){m.side=T.DoubleSide;m.roughness=.78;}
const grassGeo=new T.BufferGeometry();grassGeo.setAttribute('position',new T.Float32BufferAttribute([-.025,0,0,.025,0,0,.018,.45,.06,-.018,.45,.06,0,1,.22],3));grassGeo.setIndex([0,1,2,0,2,3,3,2,4]);grassGeo.computeVertexNormals();
function leafSpray(mat,x,y,z,rx,ry,rz,n=75){for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,v=rnd()*2-1,rr=Math.sqrt(1-v*v);instance(leafGeo,mat,x+Math.cos(a)*rr*rx,y+v*ry,z+Math.sin(a)*rr*rz,.16,.16,.19,rnd()*3.14,rnd()*6.28,rnd()*2);}}
function grasses(x,z,r=.45,h=.6,y=.2){for(let i=0;i<45;i++){let a=rnd()*6.28,rr=Math.sqrt(rnd())*r;instance(grassGeo,leafM[i%4],x+Math.cos(a)*rr,y,z+Math.sin(a)*rr,1,h*(.5+rnd()*.8),1,0,a,0);}}
function instance(geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const key=geo.uuid+mat.uuid;let p=pools.get(key);if(!p){p={geo,mat,items:[]};pools.set(key,p)}quat.setFromEuler(new T.Euler(rx,ry,rz));matrix.compose(new T.Vector3(x,y,z),quat,new T.Vector3(sx,sy,sz));p.items.push(matrix.clone());objectCount++}
function box(mat,x,y,z,w,h,d,ry=0){instance(boxGeo,mat,x,y,z,w,h,d,0,ry)}function cyl(mat,x,y,z,r,h){instance(cylGeo,mat,x,y,z,r,h,r)}function ball(mat,x,y,z,rx,ry=rx,rz=rx){
 if(leafM.includes(mat)&&rx>.20){leafSpray(mat,x,y,z,rx,ry,rz,90);return;}
 if(mat===flower&&rx>.06){for(let i=0;i<12;i++){let a=i*2.4;instance(sphereGeo,mat,x+Math.cos(a)*rx*.7,y+(rnd()-.5)*ry,z+Math.sin(a)*rz*.7,.035,.025,.035);}return;}
 instance(sphereGeo,mat,x,y,z,rx,ry,rz)}
function rod(mat,a,b,r){const av=new T.Vector3(...a),bv=new T.Vector3(...b),dir=bv.clone().sub(av);const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.clone().normalize());matrix.compose(av.add(bv).multiplyScalar(.5),q,new T.Vector3(r,dir.length(),r));let key=cylGeo.uuid+mat.uuid;let p=pools.get(key);if(!p){p={geo:cylGeo,mat,items:[]};pools.set(key,p)}p.items.push(matrix.clone())}
function polygon(mat,points,y,depth=.2){const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:32});geo.rotateX(-Math.PI/2);geo.translate(0,y,0);const m=new T.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;scene.add(m);return m}
function ellipse(mat,x,z,rx,rz,y=.12,depth=.1){const pts=[];for(let i=0;i<64;i++){const a=i*Math.PI/32;pts.push([x+rx*Math.cos(a),z+rz*Math.sin(a)])}return polygon(mat,pts,y,depth)}
// Site plinth and two connected residential wings, reconstructed from reference images.
box(white,0,-.8,0,139,1.6,135);box(grass,0,-.04,0,135,.12,131);box(pavement,0,.02,-31,120,.16,12);box(road,0,.02,-49,132,.13,15);box(road,0,.02,-62,132,.13,10);box(pavement,-62,.03,-3,9,.15,108);box(road,62,.02,5,8,.12,113);
box(pavement,3,.04,16,118,.12,84);
buildFacade(box,{brick,sand,pale,granite:darkBase,graphite,frame,glass,shopGlass,windowMats,interior});
// Entrances, podiums and ramps on the street side.
for(const x of streetEntrances){box(granite,x,.56,-27.73,5.66,1,6.25);for(let i=0;i<5;i++)box(granite,x,.10+i*.10,-32.6+i*.46,5.66,.20+i*.20,.48);
 box(graphite,x,3.79,-25.85,4.48,.18,1.62);
 for(let lx of [-1.7,0,1.7])ball(light,x+lx,3.72,-26.1,.10,.045,.10);
 // Lateral accessible approach.
 const ramp=new T.Mesh(boxGeo,granite);
 ramp.position.set(x+3.92,.517,-29.24);
 ramp.scale.set(2.12,.16,6.89);
 ramp.rotation.x=-.134;
 ramp.receiveShadow=true;
 scene.add(ramp);
 box(granite,x+3.92,.58,-25.62,2.12,.96,.86);
 for(const offset of [2.88,4.96]){
     const gx=x+offset;
     rod(graphite,[gx,1.10,-32.62],[gx,2.01,-25.82],.027);
     for(let post=0;post<=4;post++){
         rod(graphite,[gx,.16+post*.223,-32.62+post*1.70],[gx,1.10+post*.227,-32.62+post*1.70],.021);
     }
 }
}
// Curved white planters with integrated timber seating along the full external alley.
function planter(x,z,rx=4,rz=1.55){const pts=[];for(let i=0;i<96;i++){const a=i*Math.PI/48;const scallop=1+.11*Math.sin(3*a);pts.push([x+rx*Math.cos(a)*scallop,z+rz*Math.sin(a)])}polygon(white,pts,.12,.62);ellipse(earth,x,z,rx*.91,rz*.83,.76,.03);
 for(let i=0;i<23;i++){let a=Math.PI*.03+i/22*Math.PI*.85;let px=x+rx*.96*Math.cos(a),pz=z+rz*Math.sin(a);box(timber,px,.83,pz,.14,.12,.66,-a)}
 tree(x-.8,z,4.5,.85);for(let i=0;i<45;i++){let a=rnd()*Math.PI*2,r=Math.sqrt(rnd());const xx=x+Math.cos(a)*rx*.85*r,zz=z+Math.sin(a)*rz*.7*r;ball(leafM[i%4],xx,.97+rnd()*.18,zz,.32,.40,.30);if(i%3===0)for(let k=0;k<3;k++)ball(flower,xx+(rnd()-.5)*.4,1.22+rnd()*.12,zz+(rnd()-.5)*.3,.08)}}
function tree(x,z,h=6,s=1){cyl(bark,x,h*.35,z,.12*s,h*.70);for(let k=0;k<5;k++){const a=k*2.4;rod(bark,[x,h*.30,z],[x+Math.cos(a)*s,h*.75,z+Math.sin(a)*s],.065*s)}
 for(let i=0;i<36;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*1.65*s,cx=x+Math.cos(a)*r,cy=h*.70+rnd()*h*.25,cz=z+Math.sin(a)*r;
 if(i%3===0)rod(bark,[x,h*.57,z],[cx,cy,cz],.022*s);
 for(let j=0;j<68;j++)instance(leafGeo,leafM[(i+j)%4],cx+(rnd()-.5)*1.50*s,cy+(rnd()-.5)*1.30*s,cz+(rnd()-.5)*1.5*s,.11*s,.11*s,.16*s,rnd()*3.14,rnd()*6.28,rnd()*3.14);
 } }
for(const x of streetEntrances)planter(x,-35.2,4,1.6);
for(let x=-59;x<=59;x+=.75){grasses(x,-40.6,.36,.65,.1);if(Math.round(x)%3===0)ball(flower,x,.80,-40.6,.13);}
// Bollard lighting and alley trees away from entrance axes.
for(let x=-57;x<60;x+=9){cyl(graphite,x,.65,-38.4,.065,1.25);cyl(light,x,1.24,-38.4,.073,.16)}
for(let x=-58;x<60;x+=15)tree(x,-66,6,1.05);
// Parking bays, two-way roadway and detailed low-poly cars.
for(let x=-61;x<63;x+=3.05){box(white,x,.105,-61.8,.06,.015,5.6);box(white,x,.105,-56.9,2.8,.015,.06)}for(let x=-60;x<63;x+=7)box(white,x,.11,-49,3.0,.015,.07);
const carPaint=[material('carPearl','#e0dfd3',.27,.45),material('carCharcoal','#303c44',.25,.65),material('carBronze','#7b6d5c',.28,.5)];const tyre=material('tyre','#24292b');
function car(x,z,a=0,col=0){
 const g=new T.Group();g.position.set(x,.14,z);g.rotation.y=a;scene.add(g);
 const paint=new T.MeshPhysicalMaterial({color:carPaint[col].color,metalness:.55,roughness:.25,clearcoat:1,clearcoatRoughness:.1});
 const windowMat=new T.MeshPhysicalMaterial({color:'#34505c',metalness:.35,roughness:.10,clearcoat:1});
 function mesh(geo,mat,pos=[0,0,0],rot=[0,0,0]){const m=new T.Mesh(geo,mat);m.position.fromArray(pos);m.rotation.set(...rot);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
 function rounded(mat,px,py,pz,w,h,d,r=.04){return mesh(new RoundedBoxGeometry(w,h,d,3,r),mat,[px,py,pz]);}
 function loft(profiles,mat){const verts=[],indices=[];const seg=20;
  for(const [zz,width,bottom,top] of profiles)for(let i=0;i<seg;i++){let t=i*Math.PI*2/seg;verts.push(width*Math.sign(Math.cos(t))*Math.pow(Math.abs(Math.cos(t)),.36),(top+bottom)/2+(top-bottom)/2*Math.sign(Math.sin(t))*Math.pow(Math.abs(Math.sin(t)),.5),zz);}
  for(let j=0;j<profiles.length-1;j++)for(let i=0;i<seg;i++){const k=j*seg+i,l=j*seg+(i+1)%seg;indices.push(k,l,k+seg,l,l+seg,k+seg);}const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(verts,3));geom.setIndex(indices);geom.computeVertexNormals();mesh(geom,mat);
 }
 loft([[-2.12,.65,.37,.65],[-1.95,.84,.28,.78],[-1.35,.91,.25,.88],[-.6,.92,.25,.91],[.7,.91,.25,.83],[1.6,.86,.33,.73],[2.1,.69,.43,.63]],paint);
 loft([[-1.38,.70,.82,.90],[-.88,.75,.84,1.34],[-.60,.72,.86,1.46],[.45,.68,.84,1.43],[1.12,.73,.80,.85]],windowMat);
 rounded(paint,-.0,1.47,-.11,1.28,.065,1.18,.025);
 for(let side of [-1,1]){
  rounded(paint,side*.745,1.13,-.08,.045,.59,.065,.016);
  rounded(paint,side*.87,.73,-.05,.025,.18,2.4,.01);
  rounded(graphite,side*.82,.33,0,.09,.11,2.42,.022);
  rounded(paint,side*.96,.99,.82,.24,.11,.18,.04);
  rounded(graphite,side*.872,.87,-.52,.09,.025,.17,.01);
  rounded(light,side*.60,.66,2.05,.45,.12,.08,.025);
  rounded(new T.MeshStandardMaterial({color:'#9c2b20',roughness:.25}),side*.63,.71,-2.02,.42,.1,.07,.02);
  for(let zz of [-1.34,1.34]){
   mesh(new T.TorusGeometry(.27,.085,10,28),tyre,[side*.88,.36,zz],[0,Math.PI/2,0]);
   mesh(new T.CylinderGeometry(.23,.23,.12,32),granite,[side*.92,.36,zz],[0,0,Math.PI/2]);
   mesh(new T.CylinderGeometry(.08,.08,.13,20),graphite,[side*.95,.36,zz],[0,0,Math.PI/2]);
   for(let k=0;k<5;k++){const t=k*Math.PI*2/5;const spoke=rounded(granite,side*.99,.36+Math.sin(t)*.12,zz+Math.cos(t)*.12,.025,.04,.19,.008);spoke.rotation.x=-t;}
  }
 }
 rounded(graphite,0,.47,2.10,.84,.14,.035,.02);rounded(white,0,.57,2.12,.38,.09,.012,.005);
}
for(let i of [0,3,6,9,14,18,23,28,34,39])car(-59+i*3.05,-61.8,0,i%3);car(4,-47.2,Math.PI/2,1);car(41,-51.4,-Math.PI/2,0);
// Enclosed landscaped courtyard with curving paths, timber decks and blue play islands.
ellipse(grass,3,17,37,20,.14,.05);
function curvePath(points,width,mat,y=.2){const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,y,z)));const pts=curve.getPoints(160);const v=[],idx=[];for(let i=0;i<pts.length;i++){const tangent=curve.getTangent(i/(pts.length-1)),n=new T.Vector3(-tangent.z,0,tangent.x).normalize().multiplyScalar(width/2);for(let s of [-1,1])v.push(pts[i].x+n.x*s,y,pts[i].z+n.z*s);if(i<pts.length-1){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();const m=new T.Mesh(geo,mat);m.receiveShadow=true;scene.add(m)}
curvePath([[-36,0],[-20,2],[-2,9],[14,8],[34,13],[42,29]],3.8,pavement);curvePath([[-35,34],[-20,30],[-13,19],[-3,18],[13,27],[32,30],[42,37]],3,pavement);
function deck(x,z,rx,rz){ellipse(timber,x,z,rx,rz,.22,.12);for(let xx=x-rx;xx<x+rx;xx+=.22){const dd=rz*Math.sqrt(Math.max(0,1-((xx-x)/rx)**2));box(timber,xx,.37,z,.18,.06,dd*2)}}
for(const [x,z,rx,rz] of [[-20,14,9,7],[25,21,7,5],[1,33,8,4.5]]){deck(x,z,rx+1.3,rz+1.1);ellipse(blue,x,z,rx,rz,.41,.08)}
// Playground: timber climbing frame, rope ladder, swings and sand tray.
for(let x of [-23,-18])for(let z of [12,16]){box(timber,x,1.9,z,.16,3.0,.16);box(graphite,x,3.46,z,.22,.08,.22)}box(timber,-20.5,3.0,14,5.3,.16,4.3);for(let i=0;i<6;i++)rod(graphite,[-23,1.0+i*.36,12],[-23,1.0+i*.36,16],.035);
for(let z of [12,16])rod(graphite,[-23,3.4,z],[-18,3.4,z],.045);for(let x of [-21.7,-20,-18.3])for(let z of [12,16])rod(graphite,[x,3.4,z],[x,4.1,14],.035);
// Slide chute, oriented into the play island.
polygon(granite,[[-17.9,13],[-16.7,13],[-13.0,13],[-13,14.2],[-16.7,14.2],[-17.9,14.2]],.54,.09);
const slide=new T.Mesh(new T.BoxGeometry(5.1,.09,1.0),granite);slide.position.set(-15.8,1.72,14.6);slide.rotation.z=-.55;scene.add(slide);
for(let x of [-25,-21]){rod(timber,[x,.55,19],[x+1,3.45,18],.09);rod(timber,[x+2,.55,19],[x+1,3.45,18],.09)}rod(timber,[-24,3.45,18],[-20,3.45,18],.10);for(let x of [-23,-21.3]){for(let s of [-.38,.38])rod(graphite,[x+s,3.4,18],[x+s,1.0,18],.016);box(timber,x,1,18,.88,.09,.40)}
for(let [x,z] of [[25,21],[1,33]]){for(let i=0;i<4;i++){let a=i*Math.PI/2;box(timber,x+Math.cos(a)*2,.8,z+Math.sin(a)*2,.38,1.1,.38)}rod(graphite,[x-2,1.5,z],[x+2,1.5,z],.045);box(timber,x,.60,z,2.7,.12,.5)}
function bench(x,z,a=0){for(let i=0;i<5;i++)box(timber,x, .71,z+(i-2)*.10,2.4,.09,.085,a);for(let s of [-1,1]){box(graphite,x+s*.88,.40,z,.10,.60,.50,a)}for(let i=0;i<3;i++)box(timber,x,1.0+i*.12,z+.29,2.4,.09,.07,a)}
for(let [x,z] of [[-31,3],[-27,29],[-4,23],[13,16],[35,30],[27,3]]){deck(x,z,2.1,1.0);bench(x,z);cyl(graphite,x+2.5,.55,z,.16,1);cyl(light,x+2.5,1.07,z,.17,.1)}
// Curved timber screens, planting beds, flower grasses.
for(const [x,z,r,start,end] of [[-20,14,11,.2,1.7],[25,21,8.4,-1.4,.6],[1,33,9.2,1.0,2.8]]){for(let a=start;a<end;a+=.045){const h=1.1+.3*Math.sin(a*2);box(timber,x+r*Math.cos(a),.5+h/2,z+r*.72*Math.sin(a),.08,h,.10,-a)}}
for(let i=0;i<470;i++){const x=-35+rnd()*75,z=-3+rnd()*44;const nearPlay=[[-20,14,12],[25,21,9],[1,33,10]].some(([cx,cz,r])=>Math.hypot(x-cx,z-cz)<r);if(nearPlay)continue;const h=.22+rnd()*.40;grasses(x,z,.32,h,.20);if(i%3===0)for(let k=0;k<3;k++){rod(timber,[x,.2,z],[x+(rnd()-.5)*.3,.5+h,z+(rnd()-.5)*.3],.012);ball(flower,x,.55+h,z,.06,.13,.06)}}
for(const [x,z] of [[-33,-3],[-18,-3],[-4,-3],[12,-3],[31,-2],[-35,12],[-35,28],[-25,39],[-9,39],[17,39],[39,36],[42,22],[39,3],[10,20]])tree(x,z,5.5+rnd()*1.8,.95+rnd()*.3);
// Courtyard parking strip and fence to the landscaped island.
box(road,3,.16,47,106,.12,9);for(let x=-37;x<53;x+=3.1)box(white,x,.23,47,.045,.015,5);for(let i of [1,6,11,17,24])car(-36+i*3.1,47,0,i%3);
for(let x=-37;x<49;x+=.38)box(timber,x,1.0,42,.065,1.5,.08);for(let x=-37;x<48;x+=3)box(graphite,x,1.0,42,.08,1.7,.09);
// Garage portal and a low entry feature on the court edge.
box(granite,43,1.7,40,6.5,3.2,3);box(graphite,43,1.6,41.56,5.3,2.6,.07);for(let y=.45;y<2.9;y+=.34)box(granite,43,y,41.62,5.1,.025,.05);

// Ferns, flowering shrubs, rounded edging and construction details.
for(const xx of streetEntrances){
 for(let j=0;j<7;j++)grasses(xx-3+j,-35.0,.30,.55,.79);
 for(let a=0;a<Math.PI*2;a+=.10){const scallop=1+.11*Math.sin(3*a);const x=xx+4*Math.cos(a)*scallop,z=-35.2+1.55*Math.sin(a);ball(white,x,.72,z,.09,.055,.09);}
 for(let j=0;j<5;j++){const x=xx-2+j;for(let a=0;a<6.28;a+=.6)ball(flower,x+Math.cos(a)*.11,1.10+Math.sin(a)*.04,-35.5+Math.sin(a)*.12,.065);}
 for(let y=0;y<5;y++){box(graphite,xx,.2+y*.20,-32.83+y*.46,5.66,.012,.015);}
 // Recessed linear entrance canopy light and carefully sized handrails.
 box(light,xx,3.690,-26.3,3.9,.02,.035);
 for(let side of [-1,1]){rod(graphite,[xx+side*2.70,.85,-33.1],[xx+side*2.70,1.7,-30.8],.028);for(let k=0;k<3;k++)rod(graphite,[xx+side*2.70,.15+k*.4,-33.1+k],[xx+side*2.70,.85+k*.4,-33.1+k],.022);}
}
for(let x=-34;x<43;x+=1.7)if(x%5>1)grasses(x,39.8,.5,.75);
// Linear boardwalk connects lounge areas, with individual timber boards.
for(let x=-11;x<20;x+=.18)box(timber,x,.26,21,.165,.075,2.2);
for(const [x,z] of [[-4,21],[13,21]]){bench(x,z);cyl(graphite,x+2,.5,z,.12,.8);}
// Flush instance pools: repeated windows, plants and paving share geometry efficiently.
for(const {geo,mat,items} of pools.values()){const mesh=new T.InstancedMesh(geo,mat,items.length);items.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=mat!==glass&&mat!==warmGlass;mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh)}

// Fixed natural warm daylight. No visible controls or text overlays.
const envRT=new T.WebGLCubeRenderTarget(256,{type:T.HalfFloatType});const envCamera=new T.CubeCamera(.5,500,envRT);envCamera.position.set(7,19,-34);scene.add(envCamera);
// The building, site and lighting are static. Reuse the directional shadow map.
renderer.shadowMap.autoUpdate=false;
renderer.shadowMap.needsUpdate=true;
envCamera.update(renderer,scene);
for(const m of [glass,shopGlass]){m.envMap=envRT.texture;m.needsUpdate=true;}for(const m of windowMats){m.envMap=envRT.texture;m.needsUpdate=true;}
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const ao=new SSAOPass(scene,camera,innerWidth,innerHeight,12);ao.kernelRadius=5;ao.minDistance=.0005;ao.maxDistance=.035;composer.addPass(ao);composer.addPass(new OutputPass());
const target=new T.Vector3(0,13,-5);let walk=false,yaw=0,pitch=0,gesture=null,dirty=true;const canvas=renderer.domElement;
function overviewPos(){const fit=Math.max(141/camera.aspect,133)*.5/Math.tan(T.MathUtils.degToRad(21))*1.15;return target.clone().add(new T.Vector3(.72,.55,-1.17).normalize().multiplyScalar(fit));}
function overview(){walk=false;controls.enabled=true;camera.fov=42;camera.near=.1;camera.updateProjectionMatrix();camera.position.copy(overviewPos());controls.target.copy(target);controls.update();dirty=true;}
const raycaster=new T.Raycaster();
function enterAt(x,z){walk=true;controls.enabled=false;camera.position.set(x,1.75,z);camera.fov=65;camera.near=.05;camera.updateProjectionMatrix();yaw=z< -25?1.85:.25;pitch=.10;look();}
function look(){camera.quaternion.setFromEuler(new T.Euler(pitch,yaw,0,'YXZ'));dirty=true;}
// Double-click/tap unobstructed site surfaces to inspect at eye level. Escape returns.
canvas.addEventListener('dblclick',e=>{if(walk){overview();return;}const b=canvas.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),camera);const hit=raycaster.intersectObjects(scene.children,true).find(h=>h.object!==envCamera);if(hit&&hit.point.y<1.4)enterAt(hit.point.x,hit.point.z);});
canvas.addEventListener('pointerdown',e=>{if(walk){gesture={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointermove',e=>{if(!walk||!gesture)return;yaw-=(e.clientX-gesture.x)*.0035;pitch=T.MathUtils.clamp(pitch-(e.clientY-gesture.y)*.0035,-1.48,1.48);gesture={x:e.clientX,y:e.clientY};look();});for(const evt of ['pointerup','pointercancel'])canvas.addEventListener(evt,()=>gesture=null);
canvas.addEventListener('wheel',()=>{if(walk)overview();},{passive:true});
addEventListener('keydown',e=>{if(e.key==='Escape')overview();});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);if(!walk)overview();dirty=true;});
controls.addEventListener('change',()=>{dirty=true;});
overview();window.premiumReady=true;
let last=0;
function animate(time){
    requestAnimationFrame(animate);
    if(time-last<30)return;
    last=time;
    if(!walk)controls.update();
    if(dirty){
        composer.render();
        dirty=false;
    }
}
requestAnimationFrame(animate);
