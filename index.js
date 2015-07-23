
var mongoose = require('mongoose');

module.exports = function(schema) {

    // walk the schema
    Object.keys(schema.paths).forEach(function(key) {

        var path = schema.paths[key], name = path.path;

        // if the path isn't an ObjectId or is _id, bolt
        if (path.instance !== 'ObjectID' || name === '_id') return;

        // add a custom validator
        schema.path(name).validate(function(value, valid) {

            // if optional and no ref
            if (!value && !path.isRequired) return valid(true);

            // grab the model reference
            var model = mongoose.model(path.options.ref);

            // ensure the ref exists
            model.find({ _id : value }, function(err, response) {
                valid(!err && response.length > 0);
            });

        }, name + ' does not exist');

    })
}