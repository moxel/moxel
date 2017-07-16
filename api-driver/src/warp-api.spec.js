import WarpAPI from "./warp-api";

const api = new WarpAPI('test_token');

test('get all models', function (done) {
    api.listModels().then((data, err) => {
        expect(data).toBeDefined();
        done()
    })
});
