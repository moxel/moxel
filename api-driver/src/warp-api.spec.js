import WarpAPI from "./warp-api";

const api = new WarpAPI('test_token');

test('Signup New User', function (done) {
    api.signup({
        username: "episodeyang",
        password_hash: "$%#@$%@$%^@$%@"
    }).then((data, err) => {
        expect(data).toBeDefined();
        expect(data.access_token).toBeDefined();
        done()
    })
});
