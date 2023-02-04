
class Wall extends Body{
    constructor(x1, y1, x2, y2){
        super();
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        this.comp = [new Line(x1, y1, x2, y2)];
        this.dir = this.end.subtr(this.start).unit();
        this.pos = new Vector((x1+x2)/2, (y1+y2)/2);
    }
}
class CapsRoad {
    constructor(walls, checkLines) {
        this.walls = walls
        this.checkLines = checkLines
    }
}

function getRoad(){
    return new CapsRoad(walls, roadCheckLines)
}

let walls = []
walls.push(new Wall(240,120,120,120))
walls.push(new Wall(120,120,120,360))
walls.push(new Wall(120,360,480,360))
walls.push(new Wall(480,360,480,120))
walls.push(new Wall(360,0,360,240))
walls.push(new Wall(360,240,240,240))
walls.push(new Wall(0,0,640,0))
walls.push(new Wall(640,0,640,480))
walls.push(new Wall(640,480,0,480))
walls.push(new Wall(0,480,0,0))
walls.push(new Wall(600,0,600,480))

let roadCheckLines = []
roadCheckLines.push(new Wall(10,360,110,360))
roadCheckLines.push(new Wall(10,240,110,240))
roadCheckLines.push(new Wall(10,120,110,120))
roadCheckLines.push(new Wall(120,10,120,110))
roadCheckLines.push(new Wall(240,10,240,110))
roadCheckLines.push(new Wall(250,120,350,120))
roadCheckLines.push(new Wall(240,130,240,230))
roadCheckLines.push(new Wall(130,240,230,240))
roadCheckLines.push(new Wall(240,250,240,350))
roadCheckLines.push(new Wall(360,250,360,350))
roadCheckLines.push(new Wall(370,240,470,240))
roadCheckLines.push(new Wall(370,120,470,120))
roadCheckLines.push(new Wall(480,10,480,110))
roadCheckLines.push(new Wall(490,120,590,120))
roadCheckLines.push(new Wall(490,240,590,240))
roadCheckLines.push(new Wall(490,360,590,360))
roadCheckLines.push(new Wall(480,370,480,470))
roadCheckLines.push(new Wall(360,370,360,470))
roadCheckLines.push(new Wall(240,370,240,470))
roadCheckLines.push(new Wall(120,370,120,470))
roadCheckLines.forEach(line => {
    line.layer = -2
    line.setColor("#ffaacc")
})