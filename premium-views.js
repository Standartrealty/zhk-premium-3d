import * as T from 'three';

const outline = [
    [-57.4,-26.4], [57.4,-26.4], [57.4,-7.6],
    [-38.6,-7.6], [-38.6,42.4], [-57.4,42.4],
];

const projectPoints = outline.flatMap(([x,z]) =>
    [0, 40.1].map(y=>new T.Vector3(x,y,z))
);

function setShift(camera, width, height, offsetX, offsetY) {
    camera.setViewOffset(width,height,offsetX,offsetY,width,height);
}

// With a horizontal optical axis, a shifted lens keeps the tall elevations vertical.
export function frameStreet(camera, target, width, height) {
    if (camera.aspect < .72) {
        // On portrait screens the corner fills the view. The complete site is available in «Сверху».
        camera.position.set(-79.3,2.65,-53.7);
        target.set(-53.4,2.65,-21.6);
        camera.fov=69;
        setShift(camera,width,height,0,-height*.425);
        camera.lookAt(target);
        return;
    }
    target.set(-19,2.2,2);
    const direction = new T.Vector3(-.86,0,-1).normalize();
    const shortScreen = camera.aspect < .88;
    const horizontalAngle = T.MathUtils.degToRad(shortScreen ? 53 : 57);
    camera.fov = T.MathUtils.radToDeg(2*Math.atan(Math.tan(horizontalAngle/2)/camera.aspect));
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    let distance = 128;
    let midX = 0;
    let midY = 0;
    const p = new T.Vector3();
    for (let i=0;i<11;i++) {
        camera.position.copy(target).addScaledVector(direction,distance);
        camera.lookAt(target);
        camera.updateMatrixWorld(true);
        let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
        for (const point of projectPoints) {
            p.copy(point).project(camera);
            minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);
            minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
        }
        midX=(minX+maxX)/2;
        midY=(minY+maxY)/2;
        const factor=Math.max((maxX-minX)/1.78,(maxY-minY)/(shortScreen ? 1.41 : 1.59));
        if (Math.abs(factor-1)<.006 || i===10) break;
        distance*=T.MathUtils.clamp(factor,.80,1.24);
    }
    setShift(camera,width,height,midX*width/2,-(midY-.03)*height/2);
}

export function frameEye(camera, target, view, entrance, width, height) {
    const narrow = camera.aspect < .74;
    if (view==='entry') {
        camera.position.set(entrance+10.8,1.72,-39.05);
        target.set(entrance-1.85,1.72,-30.45);
        camera.fov=narrow?66:49;
        setShift(camera,width,height,0,-height*.095);
    } else {
        camera.position.set(-3,1.73,18);
        target.set(-26,1.73,-5.2);
        camera.fov=narrow?74:58;
        setShift(camera,width,height,0,-height*.176);
    }
    camera.lookAt(target);
}

export function frameOverview(camera, target) {
    camera.clearViewOffset();
    camera.fov=42;
    const fit = Math.max(133/camera.aspect,133)*.5/Math.tan(T.MathUtils.degToRad(21))*1.1;
    target.set(0,13,-5);
    camera.position.copy(target).add(new T.Vector3(.72,.55,-1.17).normalize().multiplyScalar(fit));
    camera.lookAt(target);
    camera.updateProjectionMatrix();
}
