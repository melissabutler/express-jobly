const { sqlForPartialUpdate } = require('../helpers/sql')

describe(" sqlForPartialUpdate", function() {
    test("Returns 1 object correctly", function() {
        let result = sqlForPartialUpdate(
            { value1: "v1"},
            {value1: "val1", value2: "val2"});
        expect(result).toEqual({
            setCols: "\"val1\"=$1",
            values: ["v1"],
        })

        })
    test("Returns 2 objects correctly", function(){
        let result = sqlForPartialUpdate(
            {value1: "v1", value2: "v2"},
            {value2: "val2"})
        expect(result).toEqual({
            setCols: "\"value1\"=$1, \"val2\"=$2",
            values: ["v1", "v2"]
        })
    })
})