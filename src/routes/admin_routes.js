var express = require('express');
var router = express.Router();
const admin = require('../controllers/admin');
const { check, validationResult } = require('express-validator');
const validator = require('../helper/validator');

// User login API routes
router.post('/login', [
    check('email').not().isEmpty().isEmail(),
    check('password').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.login(req, res);
    });

// User forget password API routes
router.post('/forgetPassword', [
    check('email').not().isEmpty().isEmail(),
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.forgetPassword(req, res);
    });    

// View admin details API routes
router.get('/VeiwVendor', [
    check('authorization').not().isEmpty(),
    check('vendor_id').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.VeiwVendor(req, res);
    });

// create vendor API routes
router.post('/addVendor', [
    check('authorization').not().isEmpty(),
    check('name').not().isEmpty(),
    check('email').not().isEmpty(),
    check('password').not().isEmpty(),
    check('contact_number').not().isEmpty(),
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.addVendor(req, res);
    });

// View vendor list API routes
router.get('/vendorList', [
    check('authorization').not().isEmpty(),
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.vendorList(req, res);
    });

// Edit vendor details API routes
router.put('/editVendor', [
    check('authorization').not().isEmpty(),
    check('vendor_id').not().isEmpty(),
    check('name').not().isEmpty(),
    check('contact_number').not().isEmpty(),
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.editVendor(req, res);
    });

// Delete vendor details API routes
router.put('/deleteVendor', [
    check('authorization').not().isEmpty(),
    check('vendor_id').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.deleteVendor(req, res);
    });



// View admin details API routes
router.get('/viewProduct', [
    check('authorization').not().isEmpty(),
    check('product_id').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.viewProduct(req, res);
    });

// create admin user API routes
router.post('/addProduct', [
    check('authorization').not().isEmpty(),
    check('product_name').not().isEmpty(),
    check('product_key').not().isEmpty(),
    check('product_description').not().isEmpty(),
    check('product_origin').not().isEmpty(),
    check('product_weight').not().isEmpty(),
    check('product_group').not().isEmpty(),
    check('product_measure').not().isEmpty(),
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.addProduct(req, res);
    });

// View admin list API routes
router.get('/productList', [
    check('authorization').not().isEmpty(),
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.productList(req, res);
    });

// Edit admin details API routes
router.put('/editProduct', [
    check('authorization').not().isEmpty(),
    check('product_id').not().isEmpty(),
    check('product_name').not().isEmpty(),
    check('product_key').not().isEmpty(),
    check('product_description').not().isEmpty(),
    check('product_origin').not().isEmpty(),
    check('product_weight').not().isEmpty(),
    check('product_group').not().isEmpty(),
    check('product_measure').not().isEmpty(),

],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.editProduct(req, res);
    });

// Delete admin details API routes
router.put('/deleteProduct', [
    check('authorization').not().isEmpty(),
    check('product_id').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.deleteProduct(req, res);
    });

// View admin details API routes
router.get('/veiwRestaurant', [
    check('authorization').not().isEmpty(),
    check('restaurant_id').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.VeiwRestaurant(req, res);
    });

  // View restaurant list API routes
router.get('/restaurantList', [
    check('authorization').not().isEmpty(),
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.restaurantList(req, res);
    });  

   // create restaurant API routes
router.post('/addRestaurant', [
    check('authorization').not().isEmpty(),
    check('name').not().isEmpty(),
    check('restaurant_name').not().isEmpty(),
    check('email').not().isEmpty(),
    check('password').not().isEmpty(),
    check('contact_number').not().isEmpty(),
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.addRestaurant(req, res);
    }); 

// Edit restaurant details API routes
router.put('/editRestaurant', [
    check('authorization').not().isEmpty(),
    check('restaurant_id').not().isEmpty(),
    check('name').not().isEmpty(),
    check('contact_number').not().isEmpty(),
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.editRestaurant(req, res);
    });

    // Delete restaurant details API routes
router.put('/deleteRestaurant', [
    check('authorization').not().isEmpty(),
    check('restaurant_id').not().isEmpty()
],
    (req, res, next) => {
        validator(req, res, next);
    },
    (req, res, next) => {
        admin.adminProfile.deleteRestaurant(req, res);
    });


module.exports = router;