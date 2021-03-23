const {execSync, spawn} = require("child_process");
const path = require("path");
const fs = require("fs");

const { chai} = require("../../helpers");

describe("Basic export test", function () {
    this.timeout(20000);

    before(function () {
        process.chdir(global.getCurrentWorkingDirectory('basic'));
    });

    it("should exclude the cors dependency", function() {
        const packageJSON = JSON.parse(fs.readFileSync("./.api/package.json", "utf-8"));
        chai.expect(packageJSON.dependencies["cors"]).to.be.undefined;
    })
});
