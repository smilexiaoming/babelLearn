// import '@babel/polyfill';

const fn = () => {
    console.log('13dd66664544')
}
const a = 3;
const promise = new Promise((rej,res) => {
    if(a > 2){
        res({result:0})
    }else{
        rej({result:-1})
    }
})

promise.then(res => {
    console.log('success')
},() => {})

const isHas = [1,2,3].includes(2);

Array.prototype.flat()

async function asyncfn(){
    const result = await promise
    console.log(result)
}

class Point {    constructor(x, y) {        this.x = x;        this.y = y;    };    getX() {        return this.x;    }}let cp = new ColorPoint(25, 8);