import * as T from 'three';

export const promenadeGrade = .104;
export const terraceGrade = .434;
const terraceFront = -33.55;
const stepDepth = .50;
const planterHalfWidth = 4.30;

function curve(points, y = 0, closed = false) {
    return new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,y,z)),closed);
}

function trace(path, points, x, z) {
    const outline=curve(points,0,true).getPoints(80);
    outline.forEach((point,i)=>{
        if(i===0)path.moveTo(x+point.x,-z-point.z);
        else path.lineTo(x+point.x,-z-point.z);
    });
    path.closePath();
    return path;
}

export function buildPromenade(entrances, {box, solid, ramp, tree, grasses, ball, cyl, rnd}, m) {
    const {pavement, stone, tactile, earth, timber, graphite, light, blooms, foliage} = m;
    const terraceLength=112;
    const facadeEdge=-25.46;
    const rise=(terraceGrade-promenadeGrade)/3;
    box(pavement,0,(terraceGrade+promenadeGrade)/2,(terraceFront+facadeEdge)/2,
        terraceLength,terraceGrade-promenadeGrade,facadeEdge-terraceFront);

    for(let index=1;index<entrances.length;index++){
        const left=entrances[index-1]+planterHalfWidth;
        const right=entrances[index]-planterHalfWidth;
        const center=(left+right)/2;
        for(let tier=1;tier<=3;tier++){
            const top=promenadeGrade+tier*rise;
            const front=terraceFront-(4-tier)*stepDepth;
            box(stone,center,(top+promenadeGrade)/2,front+stepDepth/2,
                right-left,top-promenadeGrade,stepDepth);
        }
        // Tactile warning strips sit flush with the paving at the top and bottom of each flight.
        for(const [z,y] of [[terraceFront+.19,terraceGrade],[terraceFront-3*stepDepth-.20,promenadeGrade]]){
            box(tactile,center,y+.003,z,right-left,.008,.28);
        }
    }

    for(const side of [-1,1]){
        // Both ends of the promenade connect to the terrace with gently sloped approaches.
        const x=side*53.65;
        ramp(pavement,x,1.90,-40.45,terraceFront,promenadeGrade,terraceGrade);
        for(const offset of [-.98,.98]){
            ramp(stone,x+offset,.067,-40.45,terraceFront,promenadeGrade+.045,terraceGrade+.045);
        }
    }

    for(const [index,x] of entrances.entries()){
        const z=-34.3;
        const outerPoints=[[-4.54,.03],[-4.15,-1.12],[-3.21,-1.9],[-1.60,-2.06],[-.02,-1.73],
            [1.20,-1.55],[2.44,-2.02],[3.48,-1.94],[4.35,-1.27],[4.42,-.40],
            [3.78,.66],[2.18,1.50],[.28,1.73],[-1.86,1.65],[-3.55,1.07]];
        const soilPoints=[[-3.96,.06],[-3.57,-.95],[-2.62,-1.47],[-1.43,-1.56],[-.18,-1.17],
            [1.20,-1.10],[2.33,-1.29],[3.40,-.91],[3.63,-.25],[3.15,.48],
            [1.91,1.02],[.02,1.23],[-1.90,1.19],[-3.30,.66]];
        const border=trace(new T.Shape(),outerPoints,x,z);
        border.holes.push(trace(new T.Path(),soilPoints,x,z));
        solid(stone,border,promenadeGrade,.445,.014);
        solid(earth,trace(new T.Shape(),soilPoints,x,z),.26,.234);

        const seat=curve([[.43,-1.59],[1.18,-1.61],[2.02,-1.84],[2.70,-1.98],
            [3.27,-1.85],[3.82,-1.50],[4.11,-1.14]].map(([u,v])=>[x+u,z+v]),.607);
        const boards=Math.round(seat.getLength()/.062);
        const length=seat.getLength()/boards;
        for(let i=0;i<boards;i++){
            const t=(i+.5)/boards;
            const point=seat.getPointAt(t);
            const tangent=seat.getTangentAt(t);
            box(timber,point.x,point.y,point.z,length-.004,.083,.43,-Math.atan2(tangent.z,tangent.x));
        }

        tree(x-1.75+.22*(index%3),z+.24,5.23+.23*(index%3),1.10+.05*(index%2),.487,foliage);
        for(const [u,v] of [[-3.3,-.49],[-2.75,-1.01],[-1.94,-1.16],[-1.13,-.90],[-.38,-.66],
            [.42,-.51],[1.16,-.41],[1.93,-.78],[2.71,-.57],[2.90,.01],[1.67,.58],[-.63,.71],[-2.48,.67]]){
            const h=.30+rnd()*.19;
            grasses(x+u,z+v,.27,h+.14,.491);
            ball(foliage[index%foliage.length],x+u,.526+h*.48,z+v,.263,h*.47,.237);
            for(let blossom=0;blossom<4;blossom++){
                const a=blossom*2.35;
                ball(blooms[(blossom+index)%blooms.length],x+u+Math.cos(a)*.16,.53+h+rnd()*.08,z+v+Math.sin(a)*.15,.067);
            }
        }
        cyl(graphite,x-3.55,.984,z+.04,.065,.976);
        cyl(light,x-3.55,1.491,z+.04,.069,.098);
    }
}
