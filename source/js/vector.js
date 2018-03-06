class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    get sqrMagnitude(){
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }

    get magnitude(){
        return Math.sqrt( this.sqrMagnitude );
    }
    
    static add(vectorA, vectorB){
        return new Vector(vectorA.x + vectorB.x, vectorA.y + vectorB.y);
    }

    // Subtract in this way: VectorA - VectorB
    static subtract(vectorA, vectorB){
        return new Vector(vectorA.x - vectorB.x, vectorA.y - vectorB.y);
    }

    equal(otherVector){
        return (this.x == otherVector.x && this.y == otherVector.y);
    }

    static get left(){ return new Vector(-1, 0); }
    static get right(){ return new Vector(1, 0); }
    static get up(){ return new Vector(0, 1); }
    static get down(){ return new Vector(0, -1); }
}