const admin_dao = require('../dao/admin_dao').admin_lib_obj;
const { jwt_key } = require('../config/config');
const jwt = require('jsonwebtoken');
const { response, jwtVerify, token_verify } = require('../helper/utility').utility_obj;
const message = require('../helper/message');
const log = require('../helper/log');


let adminProfile = {
    /**
     * @typedef adminLogin
     * @property {string} email.data.required - enter the email
     * @property {string} password.data.required - enter the password
     */

    /**
     * This function will return vendor for admin
     * @route POST /admin/login
     * @group vendor_crud 
     * @param {adminLogin.model} adminLogin.body.data.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    login: (req, res) => {
        const sql_con = req.app.get('sql_con');
        const md5 = req.app.get('md5');
        const randomstring = req.app.get('randomstring');
        var data = req.body;
        data.password = md5(data.password);
        let final_result = {};
        admin_dao.userLogin(sql_con, data.email, data.password, (err, result) => {
            if (err) {
                response(res, 500, message.db_error, err, null);
            } else if (result.length != 0) {
                let random_string = randomstring.generate(14);
                let user_type = result[0].user_type;
                let token_key = random_string + "|" + data.email + "|" + result[0].type;
                jwt.sign({ token_key: token_key }, jwt_key, (err, jwt_tokens) => {
                    if (err) {
                        log.critical("login: JWT Error", "Error: " + err);
                        response(res, 403, message.jwt_error, err, null);
                    } else {
                        admin_dao.updateToken(sql_con, result[0].id, random_string, result[0].type, (err, update_token) => {
                            if (err) {
                                log.critical("login:update_token", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else {
                                final_result.user_id = result[0].id;
                                final_result.user_type = result[0].user_type;
                                final_result.name = result[0].name;
                                response(res, 200, message.logged_in, final_result, jwt_tokens);
                            }
                        })
                    }
                });
            } else {
                response(res, 401, message.invalid_credentials, null, null);
            }
        })
    },

    /**
 * This function comment is parsed by doctrine
 * @route GET /admin/VeiwVendor
 * @param {string} vendor_id.query.required - encoded vendor_id
 * @group vendor_crud - Operations about admin crud
 * @security JWT
 * @returns {object} 200 - and a message
 * @returns {Error}  default - Unexpected error
 */

    VeiwVendor: (req, res) => {
        const sql_con = req.app.get('sql_con');
        var data = req.query;
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("VeiwVendor:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                let token_key = jwt_result.token_key;
                token_verify(sql_con, token_key, (err, token_result) => {
                    if (err) {
                        log.critical("VeiwVendor:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        admin_dao.viewVendor(sql_con, data.vendor_id, (err, vendor_view) => {
                            if (err) {
                                log.critical("VeiwVendor:view_vendor", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (vendor_view.length != 0) {
                                response(res, 200, message.view_vendor, vendor_view, null);
                            } else {
                                response(res, 401, message.data_not_present, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },


    /**
     * @typedef vendorCreate
     * @property {string} name.data.required - enter the first_name
     * @property {string} email.data.required - enter the email
     * @property {string} password.data.required - enter the password
     * @property {string} contact_number.data.required - enter the contact_number
     */

    /**
     * This function will return vendor for admin
     * @route POST /admin/addVendor
     * @group vendor_crud 
     *  @security JWT
     * @param {vendorCreate.model} vendorCreate.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    addVendor: (req, res) => {
        const md5 = req.app.get('md5');
        const sql_con = req.app.get('sql_con');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("addVendor:jwtVerify", "Database Query Error: " + err);
                response(res, 500, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("addVendor:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        data.password = md5(data.password);
                        admin_dao.vendorExistCheck(sql_con, data.email, (err, check_email) => {
                            if (err) {
                                log.critical("addVendor:vendorExistCheck", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (check_email.length == 0) {
                                admin_dao.vendorCreate(sql_con, data, token_result[0].user_id, (err, admin_create) => {
                                    if (err) {
                                        log.critical("addVendor:vendorCreate", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.vendor_created, admin_create, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.user_exists, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },


    /**
    * This function comment is parsed by doctrine
    * @route GET /admin/vendorList
    * @group vendor_crud - Operations about admin crud
    * @security JWT
    * @returns {object} 200 - and a message
    * @returns {Error}  default - Unexpected error
    */

    vendorList: (req, res) => {
        const sql_con = req.app.get('sql_con');
        var data = req.query;
        var count = data.count ? data.count : "";
        var user_type = data.user_type ? data.user_type : "";
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("vendorList:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                let token_key = jwt_result.token_key;
                token_verify(sql_con, token_key, (err, token_result) => {
                    if (err) {
                        log.critical("vendorList:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        admin_dao.viewVendoreList(sql_con, (err, user_List) => {
                            if (err) {
                                log.critical("vendorList:viewVendoreList", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else {
                                response(res, 200, message.vendor_list, user_List, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },

    /**
  * @typedef editVendor
  * @property {string} name.data.required - enter the name
  * @property {string} contact_number.data.required - enter the contact_number
  * @property {string} vendor_id.data.required - enter the vendor_id
  */

    /**
     * This function will return vendor for admin
     * @route put /admin/editVendor
     * @group vendor_crud 
     *  @security JWT
     * @param {editVendor.model} editVendor.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /*
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    editVendor: (req, res) => {
        const sql_con = req.app.get('sql_con');
        const md5 = req.app.get('md5');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("editVendor:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("editVendor:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        admin_dao.checkVendorId(sql_con, data.vendor_id, (err, check_id) => {
                            if (err) {
                                log.critical("editVendor:checkVendorId", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (check_id.length != 0) {
                                admin_dao.vendorEdit(sql_con, data, token_result[0].user_id, (err, admin_edit) => {
                                    if (err) {
                                        log.critical("editVendor:vendorEdit", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.detail_updated, null, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.user_not_exists, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },

    /**
    * @typedef vendorDelete
    * @property {string} vendor_id.data.required - enter the vendor_id
    */

    /**
     * This function will return vendor for admin
     * @route put /admin/deleteVendor
     * @group vendor_crud 
     *  @security JWT
     * @param {vendorDelete.model} vendorDelete.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    deleteVendor: (req, res) => {
        const sql_con = req.app.get('sql_con');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("deleteVendor:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("deleteVendor:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        admin_dao.checkVendorId(sql_con, data.vendor_id, (err, check_id) => {
                            if (err) {
                                log.critical("deleteVendor:checkVendorId", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (check_id.length != 0) {
                                admin_dao.deleteVendor(sql_con, data.vendor_id, token_result[0].user_id, (err, admin_edit) => {
                                    if (err) {
                                        log.critical("deleteVendor:deleteVendor", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.user_deleted, null, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.invalid_user, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },


    /**
    * This function comment is parsed by doctrine
    * @route GET /admin/viewProduct
    * @param {string} product_id.query.required - encoded product_id
    * @group product_crud - Operations about admin crud
    * @security JWT
    * @returns {object} 200 - and a message
    * @returns {Error}  default - Unexpected error
    */

    viewProduct: (req, res) => {
        const sql_con = req.app.get('sql_con');
        var data = req.query;
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("viewProduct:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                let token_key = jwt_result.token_key;
                token_verify(sql_con, token_key, (err, token_result) => {
                    if (err) {
                        log.critical("viewProduct:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        admin_dao.viewProduct(sql_con, data.product_id, (err, product_view) => {
                            if (err) {
                                log.critical("viewProduct:view_product", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (product_view.length != 0) {
                                response(res, 200, message.view_product, product_view, null);
                            } else {
                                response(res, 401, message.data_not_present, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },


    /**
     * @typedef productCreate
     * @property {string} product_name.data.required - enter the product_name
     * @property {string} product_key.data.required - enter the product_key'
     * @property {string} product_description.data.required - enter the product_description
     * @property {string} product_origin.data.required - enter the product_origin
     * @property {string} product_weight.data.required - enter the product_weight
     * @property {string} product_group.data.required - enter the product_group
     * @property {string} product_measure.data.required - enter the product_measure
     */

    /**
     * This function will return product for admin
     * @route POST /admin/addProduct
     * @group product_crud 
     *  @security JWT
     * @param {productCreate.model} productCreate.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    addProduct: (req, res) => {
        const sql_con = req.app.get('sql_con');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("addProduct:jwtVerify", "Database Query Error: " + err);
                response(res, 500, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("addProduct:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        admin_dao.productExistCheck(sql_con, data.product_name, (err, check_email) => {
                            if (err) {
                                log.critical("addProduct:productExistCheck", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (check_email.length == 0) {
                                admin_dao.productCreate(sql_con, data, token_result[0].user_id, (err, product_create) => {
                                    if (err) {
                                        log.critical("addProduct:productCreate", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.product_created, product_create, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.user_exists, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },


    /**
    * This function comment is parsed by doctrine
    * @route GET /admin/productList
    * @group product_crud - Operations about admin crud
    * @security JWT
    * @returns {object} 200 - and a message
    * @returns {Error}  default - Unexpected error
    */

    productList: (req, res) => {
        const sql_con = req.app.get('sql_con');
        var data = req.query;
        var count = data.count ? data.count : "";
        var user_type = data.user_type ? data.user_type : "";
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("productList:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                let token_key = jwt_result.token_key;
                token_verify(sql_con, token_key, (err, token_result) => {
                    if (err) {
                        log.critical("productList:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        admin_dao.viewProductList(sql_con, (err, user_List) => {
                            if (err) {
                                log.critical("productList:viewProductList", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else {
                                response(res, 200, message.product_list, user_List, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },

    /**
    * @typedef editProduct
    * @property {string} product_name.data.required - enter the product_name
    * @property {string} product_key'.data.required - enter the product_key'
    * @property {string} product_description.data.required - enter the product_description
    * @property {string} product_origin.data.required - enter the product_origin
    * @property {string} product_weight.data.required - enter the product_weight
    * @property {string} product_group.data.required - enter the product_group
    * @property {string} product_measure.data.required - enter the product_measure
    * @property {string} product_id.data.required - enter the product_id
    */

    /**
     * This function will return product for admin
     * @route put /admin/editProduct
     * @group product_crud 
     *  @security JWT
     * @param {editProduct.model} editProduct.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /*
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    editProduct: (req, res) => {
        const sql_con = req.app.get('sql_con');
        const md5 = req.app.get('md5');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("editProduct:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("editProduct:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        admin_dao.checkProductId(sql_con, data.product_id, (err, check_id) => {
                            if (err) {
                                log.critical("editProduct:checkProductId", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (check_id.length != 0) {
                                admin_dao.productEdit(sql_con, data, token_result[0].user_id, (err, admin_edit) => {
                                    if (err) {
                                        log.critical("editProduct:productEdit", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.detail_updated, null, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.user_not_exists, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },

    /**
    * @typedef productDelete
    * @property {string} product_id.data.required - enter the product_id
    */

    /**
     * This function will return product for admin
     * @route put /admin/deleteProduct
     * @group product_crud 
     *  @security JWT
     * @param {productDelete.model} productDelete.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    deleteProduct: (req, res) => {
        const sql_con = req.app.get('sql_con');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("deleteProduct:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("deleteProduct:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        admin_dao.checkProductId(sql_con, data.product_id, (err, check_id) => {
                            if (err) {
                                log.critical("deleteProduct:checkProductId", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (check_id.length != 0) {
                                admin_dao.deleteProduct(sql_con, data.product_id, token_result[0].user_id, (err, admin_edit) => {
                                    if (err) {
                                        log.critical("deleteProduct:deleteProduct", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.product_deleted, null, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.invalid_user, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },
    /**
   * This function comment is parsed by doctrine
   * @route GET /admin/veiwRestaurant
   * @param {string} restaurant_id.query.required - encoded restaurant_id
   * @group restaurant_crud - Operations about admin crud
   * @security JWT
   * @returns {object} 200 - and a message
   * @returns {Error}  default - Unexpected error
   */

    VeiwRestaurant: (req, res) => {
        const sql_con = req.app.get('sql_con');
        var data = req.query;
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("VeiwRestaurant:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                let token_key = jwt_result.token_key;
                token_verify(sql_con, token_key, (err, token_result) => {
                    if (err) {
                        log.critical("VeiwRestaurant:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        admin_dao.viewRestaurant(sql_con, data.restaurant_id, (err, restaurant_view) => {
                            if (err) {
                                log.critical("VeiwRestaurant:view_restaurant", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (restaurant_view.length != 0) {
                                response(res, 200, message.view_restaurant, restaurant_view, null);
                            } else {
                                response(res, 401, message.data_not_present, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },

    /**
        * This function comment is parsed by doctrine
        * @route GET /admin/restaurantList
        * @group restaurant_crud - Operations about admin crud
        * @security JWT
        * @returns {object} 200 - and a message
        * @returns {Error}  default - Unexpected error
        */

    restaurantList: (req, res) => {
        const sql_con = req.app.get('sql_con');
        var data = req.query;
        var count = data.count ? data.count : "";
        var user_type = data.user_type ? data.user_type : "";
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("restaurantList:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                let token_key = jwt_result.token_key;
                token_verify(sql_con, token_key, (err, token_result) => {
                    if (err) {
                        log.critical("restaurantList:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        admin_dao.viewRestaurantList(sql_con, (err, restaurant_List) => {
                            if (err) {
                                log.critical("restaurantList:viewRestaurantList", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else {
                                response(res, 200, message.restaurant_list, restaurant_List, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },

    /**
         * @typedef restaurantCreate
         * @property {string} name.data.required - enter the first_name
         * @property {string} restaurant_name.data.required - enter the restaurant_name
         * @property {string} email.data.required - enter the email
         * @property {string} password.data.required - enter the password
         * @property {string} contact_number.data.required - enter the contact_number
         */

    /**
     * This function will return restaurant for admin
     * @route POST /admin/addRestaurant
     * @group restaurant_crud 
     *  @security JWT
     * @param {restaurantCreate.model} restaurantCreate.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    addRestaurant: (req, res) => {
        const md5 = req.app.get('md5');
        const sql_con = req.app.get('sql_con');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("addRestaurant:jwtVerify", "Database Query Error: " + err);
                response(res, 500, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("addRestaurant:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        data.password = md5(data.password);
                        admin_dao.restaurantExistCheck(sql_con, data.email, (err, check_email) => {
                            if (err) {
                                log.critical("addRestaurant:restaurantExistCheck", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (check_email.length == 0) {
                                admin_dao.restaurantCreate(sql_con, data, token_result[0].user_id, (err, restaurant_create) => {
                                    if (err) {
                                        log.critical("addRestaurant:restaurantCreate", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.restaurant_created, restaurant_create, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.user_exists, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },

    /**
      * @typedef editRestaurant
      * @property {string} name.data.required - enter the name
      * @property {string} restaurant_name.data.required - enter the restaurant name
      * @property {string} contact_number.data.required - enter the contact_number
      * @property {string} restaurant_id.data.required - enter the restaurant_id
      */

    /**
     * This function will return restaurant for admin
     * @route put /admin/editRestaurant
     * @group restaurant_crud 
     *  @security JWT
     * @param {editRestaurant.model} editRestaurant.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /*
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    editRestaurant: (req, res) => {
        const sql_con = req.app.get('sql_con');
        const md5 = req.app.get('md5');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("editRestaurant:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("editRestaurant:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        admin_dao.checkRestaurantId(sql_con, data.restaurant_id, (err, check_id) => {
                            if (err) {
                                log.critical("editRestaurant:checkRestaurantId", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (check_id.length != 0) {
                                admin_dao.restaurantEdit(sql_con, data, token_result[0].user_id, (err, restaurant_edit) => {
                                    if (err) {
                                        log.critical("editRestaurant:restaurantEdit", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.detail_updated, restaurant_edit, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.user_not_exists, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },

    /**
    * @typedef restaurantDelete
    * @property {string} restaurant_id.data.required - enter the restaurant_id
    */

    /**
     * This function will return restaurant for admin
     * @route put /admin/deleteRestaurant
     * @group restaurant_crud 
     *  @security JWT
     * @param {restaurantDelete.model} restaurantDelete.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    deleteRestaurant: (req, res) => {
        const sql_con = req.app.get('sql_con');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("deleteRestaurant:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("deleteRestaurant:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        admin_dao.checkRestaurantId(sql_con, data.restaurant_id, (err, check_id) => {
                            if (err) {
                                log.critical("deleteRestaurant:checkRestaurantId", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (check_id.length != 0) {
                                admin_dao.deleteRestaurant(sql_con, data.restaurant_id, token_result[0].user_id, (err, admin_edit) => {
                                    if (err) {
                                        log.critical("deleteRestaurant:deleteRestaurant", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.user_deleted, null, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.invalid_user, null, null);
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                });
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        });
    },


    /**
    * @typedef userForget
    * @property {string} business_email.data.required - enter the business_email
    */

    /**
    * This function will return admin id of admin
    * @route POST /admin/forgetPassword
    * @group partner_crud 
    * @param {userForget.model} userForget.body.required - the new point
    * @returns {Response} 200 - response object containing data, message and status code
    * @returns {Error}  default - Unexpected error
    */

    /**
    * @typedef Response
    * @property {integer} status
    * @property {string} message.required - response message
    * @property {data} response data payload
    */

   forgetPassword: (req, res) => {
    const sql_con = req.app.get('sql_con');
    var data = req.body;
    admin_dao.checkUser(sql_con, data.email, (err, result) => {
        if (err) {
            log.critical("forgetPassword:checkUser", "Database Query Error: " + err);
            response(res, 500, message.db_error, err, null);
        } else if (result.length != 0) {
            //send email
            var resetLink = config.reset_link + email;
            var mailer = req.app.get('mailer');
            var MAILKEY = config.mail_headers_key;
            var MAILVALUE = config.mail_headers_value;
            var e_mail = {
                from: config.mail_support_value,
                to: data.email,
                subject: 'Madchef: Temporary Password',
                html: create_html_template(resetLink),
                headers: {}
            };
            e_mail['headers'][MAILKEY] = MAILVALUE;
            mailer.sendMail(e_mail, function (err, info) {
                if (err) {
                    log.critical("forgetPassword:sendMail", "Mailer Error: " + err);
                    response(res, 500, message.mail_error, err, null);
                } else {
                    response(res, 200, message.password_sent, null, null);
                }
            });
        } else {
            response(res, 401, message.invalid_email, null, null);
        }
    })
},


}

module.exports = { adminProfile };

