var assert = require('assert');
var async = require('async');
var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;
var mrf = require('./');
var user, car, role;

function models() {

    // user model
    user = new mongoose.Schema({ name: String });
    mongoose.model('user', user);
    user = mongoose.model('user', user);

    // car model
    car = new mongoose.Schema({
        name: String,
        driver: { type: ObjectId, ref: 'user' },
    });
    mrf(car);
    mongoose.model('car', car);
    car = mongoose.model('car', car);

    // role model
    role = new mongoose.Schema({
        name: String,
        staff: { type: ObjectId, ref: 'user', required: true },
    });
    mrf(role);
    mongoose.model('role', role);
    role = mongoose.model('role', role);
}

function test() {

    async.waterfall([
        function(cb) {

            var user1 = new user({ name : 'Michael Scott' });
            user1.save(function(err, doc) { cb(err, doc); });

        }, function(user1, cb) {

            // ensure car with valid driver does not error
            var car1 = new car({
                name : 'Chrysler Sebring',
                driver : user1._id
            });

            car1.save(function(err, doc) {
                assert.equal(err, null, 'error should not exist saving car1');
                cb();
            });

        }, function(cb) {

            // ensure car with invalid driver does error
            var car2 = new car({
                name : 'Datsun 280ZX',
                driver : mongoose.Types.ObjectId()
            });

            car2.save(function(err, doc) {
                assert.equal(err.message, 'car validation failed');
                assert.equal(typeof err.errors, 'object');
                assert.equal(typeof err.errors.driver, 'object');
                assert.equal(err.errors.driver.message, 'driver does not exist');
                cb();
            });

        }, function(cb) {

            // ensure car with no driver does not error
            var car3 = new car({ name : 'Saab 9-2x' });

            car3.save(function(err, doc) {
                assert.equal(err, null);
                cb();
            });

        }, function(cb) {

            var role1 = new role({ name: 'Assistant-to-the-Regional Manager' });
            role1.save(function(err, doc) {
                assert.equal(err.message, 'role validation failed');
                assert.equal(typeof err.errors, 'object');
                assert.equal(typeof err.errors.staff, 'object');
                assert.equal(err.errors.staff.message, 'Path `staff` is required.');
            });
        }
    ], function() {});

}

// connect and test
mongoose.connect('mongodb://localhost/mrv-test', function() {
    models();
    test();
});
