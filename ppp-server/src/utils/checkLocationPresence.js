"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPointInQuadrilateral(point, quadrilateral) {
    // Ray casting algorithm
    var inside = false;
    var p1 = quadrilateral[0], p2 = quadrilateral[1], p3 = quadrilateral[2], p4 = quadrilateral[3];
    var vertices = [p1, p2, p3, p4];
    for (var i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        var vi = vertices[i];
        var vj = vertices[j];
        // Check if the ray crosses the edge
        if (((vi.y > point.y) !== (vj.y > point.y)) &&
            (point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x)) {
            inside = !inside;
        }
    }
    return inside;
}
var quadrilateral = [
    { x: 30.2183969, y: 75.6987946 },
    { x: 30.2177920, y: 75.6987651 },
    { x: 30.2177734, y: 75.6997468 },
    { x: 30.2183946, y: 75.6997146 }
];
var checkLocationPresence = function (point) {
    return isPointInQuadrilateral(point, quadrilateral);
};
exports.default = checkLocationPresence;
