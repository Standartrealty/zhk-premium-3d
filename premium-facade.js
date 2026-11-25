// Storeys are numbered as they appear on the finished building.
export const COMMERCIAL_LEVEL = 1;
export const podiumHeight = 7.5;
export const roofLevel = podiumHeight + 10 * 3.1;

const groundHeight = 4.15;
const residentialHeight = 3.1;
const streetLength = 112;
const streetBays = 18;
const entranceBays = [1, 4, 7, 10, 13, 16];
export const streetEntrances = entranceBays.map(bay => (bay + .5) * streetLength / streetBays - streetLength / 2);

// The footprint is the connected L used in the original interactive scene.
// The frontage, the two inside returns and the two short ends belong to one exterior.
const edges = [
    {from: [-56, -25], to: [56, -25], normal: [0, -1], bays: streetBays, use: 'street'},
    {from: [56, -25], to: [56, -9], normal: [1, 0], bays: 3, use: 'streetEnd'},
    {from: [56, -9], to: [-40, -9], normal: [0, 1], bays: 15, use: 'court'},
    {from: [-40, -9], to: [-40, 41], normal: [1, 0], bays: 8, use: 'court'},
    {from: [-40, 41], to: [-56, 41], normal: [0, 1], bays: 3, use: 'blindEnd'},
    {from: [-56, 41], to: [-56, -25], normal: [-1, 0], bays: 10, use: 'streetEnd'},
];

export function buildFacade(box, m) {
    const {brick, sand, pale, granite, graphite, frame, glass, shopGlass, windowMats, light, interior} = m;
    const roofThickness = .21;
    // Roofs and recessed opaque cores keep the skyline and true reveals continuous.
    for (const [x, z, width, depth] of [[0, -17, 112, 16], [-48, 16, 16, 50]]) {
        box(interior, x, roofLevel / 2, z, width - .90, roofLevel, depth - .90);
        box(graphite, x, roofLevel + roofThickness / 2, z, width, roofThickness, depth);
        for (let step = -width / 2 + 8; step < width / 2 - 4; step += 21) {
            box(pale, x + step, roofLevel + .75, z, 4.4, 1.08, 4.35);
            box(graphite, x + step, roofLevel + 1.33, z, 4.67, .13, 4.63);
        }
    }
    // Shared core where the two wings meet.
    box(interior, -48, roofLevel / 2, -9, 15.1, roofLevel, .98);

    for (const edge of edges) {
        const length = Math.hypot(edge.to[0] - edge.from[0], edge.to[1] - edge.from[1]);
        const ux = (edge.to[0] - edge.from[0]) / length;
        const uz = (edge.to[1] - edge.from[1]) / length;
        const [nx, nz] = edge.normal;
        const turn = -Math.atan2(uz, ux);
        function part(mat, u, y, offset, width, height, depth) {
            box(mat, edge.from[0] + ux * u + nx * offset, y,
                edge.from[1] + uz * u + nz * offset, width, height, depth, turn);
        }
        function facing(mat, left, right, bottom, top, face) {
            if (right - left <= .005 || top - bottom <= .005) return;
            if (left === 0 && edge.from[0] !== -40) left -= Math.max(0, face);
            const rear = -.51;
            part(mat, (left + right) / 2, (bottom + top) / 2, (face + rear) / 2,
                right - left, top - bottom, face - rear);
        }
        function facingAround(mat, left, right, sill, head, bottom, top, openings, face) {
            // Four real brick surfaces around each opening; no overlay onto a solid wall.
            facing(mat, left, right, bottom, sill, face);
            facing(mat, left, right, head, top, face);
            let previous = left;
            for (const {u, width} of openings) {
                facing(mat, previous, u - width / 2, sill, head, face);
                previous = u + width / 2;
            }
            facing(mat, previous, right, sill, head, face);
        }

        function housingWindow(u, width, sill, head, face, style, divisions = 2) {
            const glazing = face - (face > .6 ? .286 : .208);
            const pane = windowMats[style % windowMats.length];
            const h = head - sill;
            const y = (sill + head) / 2;
            part(interior, u, y, -.389, width - .018, h - .022, .065);
            part(pane, u, y, glazing - .025, width - .101, h - .115, .025);
            for (const side of [-1, 1]) {
                part(frame, u + side * (width / 2 - .042), y, glazing, .064, h - .025, .081);
                part(frame, u, y + side * (h / 2 - .035), glazing, width - .044, .062, .081);
            }
            for (let i = 1; i < divisions; i++) {
                part(frame, u - width / 2 + width * i / divisions, y, glazing + .009, .051, h - .085, .059);
            }
            part(frame, u, sill + h * .29, glazing + .01, width - .081, .052, .056);
            part(graphite, u, sill + .013, face - .072, width + .040, .056, .305);
        }

        function shopWindow(u, width, sill, head, face, lobby) {
            const y = (sill + head) / 2;
            const h = head - sill;
            const glazing = face - .16;
            part(interior, u, y, -.401, width, h, .06);
            part(lobby ? glass : shopGlass, u, y, glazing - .021, width - .10, h - .11, .028);
            for (const side of [-1, 1]) {
                part(frame, u + side * (width / 2 - .041), y, glazing, .075, h, .082);
                part(frame, u, y + side * (h / 2 - .036), glazing, width - .063, .071, .082);
            }
            for (let i = 1; i < 5; i++) {
                part(frame, u + width * (i / 5 - .5), y, glazing, .064, h - .125, .084);
            }
            part(frame, u, head - .49, glazing + .007, width - .10, .061, .08);
            if (lobby) {
                const doorHeight = h - .51;
                for (const side of [-1, 1]) {
                    part(frame, u + side * .72, sill + doorHeight / 2, glazing + .024, .084, doorHeight, .076);
                    part(graphite, u + side * .24, sill + 1.04, glazing + .091, .037, .42, .059);
                }
                part(frame, u, sill + doorHeight / 2, glazing + .025, .042, doorHeight, .076);
            }
        }

        function railing(u, left, right, y, face) {
            const width = right - left;
            for (const dy of [.11, 1.07]) part(graphite, u, y + dy, face, width, .048, .055);
            const bars = Math.ceil(width / .152);
            for (let i = 0; i <= bars; i++) {
                part(graphite, left + width * i / bars, y + .57, face, i % 6 ? .022 : .036, .99, .039);
            }
        }

        const bayWidth = length / edge.bays;
        for (let bay = 0; bay < edge.bays; bay++) {
            const start = bay * bayWidth;
            const end = start + bayWidth;
            const u = (start + end) / 2;
            const court = edge.use === 'court';
            const endWall = edge.use === 'blindEnd' && bay < edge.bays - 1;
            const lobby = edge.use === 'street' && entranceBays.includes(bay);
            const loggia = court && (bay % 3 === 1);
            const tower = !loggia && (bay % 4 < 2 || bay === edge.bays - 1);
            const face = tower ? (bay % 4 === 0 ? 1.33 : 1.10) : loggia ? .06 : .125;
            const width = (tower ? .336 : .302) * bayWidth;
            const pair = [
                {u: u - bayWidth * .235, width},
                {u: u + bayWidth * .235, width},
            ];

            for (let floor = 1; floor <= 12; floor++) {
                const bottom = floor === 1 ? 0 : floor === 2 ? groundHeight : podiumHeight + (floor - 3) * residentialHeight;
                const top = floor === 1 ? groundHeight : floor === 2 ? podiumHeight : bottom + residentialHeight;

                // One street-facing storefront level. Level two uses smaller residential openings and masonry.
                if (floor === COMMERCIAL_LEVEL) {
                    const street = edge.use === 'street' || edge.use === 'streetEnd';
                    const baseFace = .49;
                    if (street) {
                        const sill = lobby ? 1.016 : .43;
                        const head = 3.62;
                        const opening = {u, width: bayWidth * (lobby ? .82 : .86)};
                        facingAround(granite, start, end, sill, head, bottom, top, [opening], baseFace);
                        shopWindow(u, opening.width, sill, head, baseFace, lobby);
                    } else {
                        const sill = .56;
                        const head = 2.88;
                        if (endWall) facing(granite, start, end, bottom, top, baseFace);
                        else {
                            facingAround(granite, start, end, sill, head, bottom, top, pair, baseFace);
                            for (const p of pair) housingWindow(p.u, p.width, sill, head, baseFace, bay + 2);
                        }
                    }
                    part(graphite, u, groundHeight - .035, baseFace + .036, bayWidth, .09, .20);
                    continue;
                }
                if (floor === 2) {
                    const secondFace = .37;
                    const sill = bottom + .69;
                    const head = top - .36;
                    if (endWall) facing(granite, start, end, bottom, top, secondFace);
                    else {
                        facingAround(granite, start, end, sill, head, bottom, top, pair, secondFace);
                        for (const p of pair) housingWindow(p.u, p.width, sill, head, secondFace, bay + 3);
                    }
                    part(graphite, u, top - .088, .526, bayWidth + .002, .158, .625);
                    part(granite, u, top + .004, .544, bayWidth + .004, .061, .63);
                    continue;
                }

                const masonry = floor <= 6 ? brick : tower && floor >= 11 ? pale : sand;
                if (endWall) {
                    facing(masonry, start, end, bottom, top, face);
                } else if (loggia) {
                    const opening = {u, width: bayWidth * .74};
                    const deck = bottom + .13;
                    facingAround(masonry, start, end, deck, top - .16, bottom, top, [opening], .46);
                    // The slab ties into the neighbouring brick returns. A second plane carries the apartment glazing.
                    part(granite, u, bottom + .063, .56, opening.width + .014, .144, 1.56);
                    const w = opening.width * .55;
                    const rear = [{u: u - (opening.width - w) * .12, width: w},
                        {u: u + opening.width * .36, width: opening.width * .21}];
                    facingAround(masonry,u-opening.width/2,u+opening.width/2,
                        deck+.115,top-.31,deck,top-.16,rear,-.12);
                    rear.forEach((p,index) => housingWindow(p.u,p.width,deck+.115,top-.31,-.12,
                        bay+floor+index*2,index===0 ? 3 : 1));
                    railing(u, u - opening.width / 2 + .028, u + opening.width / 2 - .028, deck, 1.273);
                } else {
                    const sill = bottom + (floor >= 11 ? .83 : .38);
                    const head = top - (floor >= 11 ? .40 : .28);
                    facingAround(masonry, start, end, sill, head, bottom, top, pair, face);
                    for (const [i, p] of pair.entries()) {
                        housingWindow(p.u, p.width, sill, head, face, floor * 5 + bay + i, tower ? 3 : 2);
                    }
                }

                if (floor === 12) {
                    const parapet = tower ? 1.39 : .93;
                    facing(masonry, start, end, top, top + parapet, face);
                    part(graphite, u, top + parapet + .039, face - .116, bayWidth + .006, .081, .344);
                }
            }
        }
    }
}
