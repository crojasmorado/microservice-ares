var assert = require("chai").assert;
var login = require("../app/controllers/login.js");
var mongoService = require("../app/service/mongo.js");

let params = {
	"actionName": "userLogIn",
	"data": {
		"user": "crojas",
		"password": "26394"
	}
};

describe("Check action userLogIn: ", function () {
	let mongoFlagg = false;
	describe("Verify connectivity in Mongo DB: ", function () {
		it("Verify connectivity in Mongo DB", async function () {
			let mongo = await mongoService.getClient();
			assert.typeOf(mongo, "object", "The returned value is a valid object");
		});
		it("Execute a successful request and wait for the status in 0.", async function () {
			let result = await login.loginAction(params);
			assert.equal(result.status, "0", "The request was satisfactory");
		});
		it("Verify that the returned value is an object.", async function () {
			let result = await login.loginAction(params);
			assert.typeOf(result, "object", "The returned value is a valid object");
		});
	});


});