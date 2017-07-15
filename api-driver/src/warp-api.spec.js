import WarpAPI from "./warp-api";

const api = WarpAPI('test_token');

define('Warp Api', function(){
    it('get all models', function(done){
        api.listModels().then((data, err)=>{
            expect(data).toBeDefined();
            done()
        })
    })
});
