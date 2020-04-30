var express = require('express');
var router = express.Router();
const vendor = require('../controllers/vendor');
const { check, validationResult } = require('express-validator');
const validator = require('../helper/validator');

//View user details API route
router.get('/viewUser', [
    check('authorization').not().isEmpty(),
    check('vendor_user_id').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    }, (req, res, next) => {
        vendor.vendorProfile.viewUser(req, res);
    });

// View user list API route
router.get('/userList', [
    check('authorization').not().isEmpty(),
],
    (req, res, next) => {
        validator(req, res, next);
    }, (req, res, next) => {
        vendor.vendorProfile.userList(req, res);
    });

// create user API routes
router.post('/userAdd', [
    check('authorization').not().isEmpty(),
    check('name').not().isEmpty(),
    check('email').not().isEmpty(),
    check('password').not().isEmpty(),
    check('contact_number').not().isEmpty(),
    //check('profile_pic').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    }, (req, res, next) => {
        vendor.vendorProfile.addUser(req, res);
    });

// Delete user details API routes
router.put('/deleteUser', [
    check('authorization').not().isEmpty(),
    check('user_id').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        vendor.vendorProfile.userDelete(req, res);
    });

// Edit user details API route
router.put('/editUser', [
    check('authorization').not().isEmpty(),
    check('user_id').not().isEmpty(),
    check('name').not().isEmpty(),
    check('email').not().isEmpty(),
    check('password').not().isEmpty(),
    check('contact_number').not().isEmpty(),
    //check('profile_pic').not().isEmpty(),
    check('user_type').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        vendor.vendorProfile.editUser(req, res);
    });


module.exports = router;