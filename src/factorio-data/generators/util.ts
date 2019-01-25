import Delaunator from 'delaunator'
import range from 'ramda/es/range'

const hashPoint = (p: IPoint) => `${p.x},${p.y}`

const equalPoints = <T extends IPoint>(a: T) => (b: T) => a.x === b.x && a.y === b.y

/** Returns unique points from points array */
const uniqPoints = <T extends IPoint>(list: T[]): T[] =>
    list
        .sort((a, b) => a.x - b.x ? a.x - b.x : a.y - b.y)
        .filter((v, i, arr) => i === 0 || !(v.x === arr[i - 1].x && v.y === arr[i - 1].y))
    // About 10x slower:
    // uniqWith((a, b) => equalPoints(a)(b), list)

const arrayToPoint = (array: number[]): IPoint => ({ x: array[0], y: array[1] })

const pointToArray = (point: IPoint): number[] => [point.x, point.y]

const manhattenDistance = (p0: IPoint, p1: IPoint) =>
    Math.abs(p0.x - p1.x) + Math.abs(p0.y - p1.y)

const euclideanDistance = (p0: IPoint, p1: IPoint) =>
    Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2))

const pointInCircle = (point: IPoint, origin: IPoint, r: number) =>
    Math.pow(origin.x - point.x, 2) + Math.pow(origin.y - point.y, 2) <= r * r

export default {
    hashPoint,
    equalPoints,
    uniqPoints,
    arrayToPoint,
    pointToArray,
    manhattenDistance,
    euclideanDistance,
    pointInCircle,
    pointsToLines,
    range
}

/** Creates lines between points based on delaunay triangulation */
function pointsToLines<T extends IPoint>(nodes: T[]): T[][] {
    const filteredNodes = uniqPoints(nodes)

    if (filteredNodes.length === 1) return [[filteredNodes[0], filteredNodes[0]]]
    if (filteredNodes.length === 2) return [filteredNodes]

    // Check that nodes are not collinear
    let lastSlope = 0
    for (let i = 0; i < filteredNodes.length; i++) {
        if (i === filteredNodes.length - 1) {
            return filteredNodes.reduce((pV, _, i, arr) => {
                if (i === 0) return pV
                return pV.concat([[arr[i - 1], arr[i]]])
            }, [] as T[][])
        }
        const node = filteredNodes[i]
        const next = filteredNodes[i + 1]
        const dX = Math.abs(node.x - next.x)
        const dY = Math.abs(node.y - next.y)
        if (i === 0) lastSlope = dY / dX
        else if (lastSlope !== dY / dX) break
    }

    const delaunay = Delaunator.from(filteredNodes.map(pointToArray))

    return delaunay.triangles
        // Transform triangle indexes into lines
        .reduce((pV, _, i, arr) => {
            if (i <= delaunay.halfedges[i]) return pV
            const p = filteredNodes[arr[i]]
            const q = filteredNodes[arr[(i % 3 === 2) ? i - 2 : i + 1]]
            return pV.concat([[p, q]])
        }, [] as T[][])
}
