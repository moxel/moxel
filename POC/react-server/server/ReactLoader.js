export default function ReactLoader(req, res, next) {
    console.log(req, res, next);
    res.send(200, "<html><header></header><body><h1>this is great!</h1></body></html>")
}