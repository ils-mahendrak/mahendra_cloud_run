const restaurant_dao = require('../dao/restaurant_dao').restaurant_lib_obj;
const { response, jwtVerify, token_verify } = require('../helper/utility').utility_obj;
const message = require('../helper/message');
const log = require('../helper/log');

let restaurantProfile = {

    /**
    * This function comment is parsed by doctrine
    * @route GET /restaurant/viewUser
    * @param {string} restaurant_user_id.query.required - restaurant_user_id
    * @group restaurant_user_crud - Operations about restaurant crud
    * @security JWT
    * @returns {object} 200 - and a message
    * @returns {Error}  default - Unexpected error
    */
    viewUser: (req, res) => {
        const sql_con = req.app.get('sql_con');
        var data = req.query;
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("veiwUser:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                let token_key = jwt_result.token_key;
                token_verify(sql_con, token_key, (err, token_result) => {
                    if (err) {
                        log.critical("veiwUser:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        restaurant_dao.userDetails(sql_con, token_result[0].user_id, (err, userdetail) => {
                            if (err) {
                                log.critical("userdetail:check_userdetail", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (userdetail[0].user_type == 'Superadmin') {
                                restaurant_dao.viewUser(sql_con, data.restaurant_user_id, (err, user_view) => {
                                    if (err) {
                                        log.critical("viewUser:viewUser", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else if (user_view.length != 0) {
                                        response(res, 200, message.view_user, user_view, null);
                                    } else {
                                        response(res, 401, message.data_not_present, null, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.invalid_user_type, null, null)
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                })
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        })
    },

    /**
        * This function comment is parsed by doctrine
        * @route GET /restaurant/userList
        * @group restaurant_user_crud - Operations about restaurant crud
        * @security JWT
        * @returns {object} 200 - and a message
        * @returns {Error}  default - Unexpected error
        */
    userList: (req, res) => {
        var data = req.query;
        const sql_con = req.app.get('sql_con');
        token = req.headers['authorization'];
        var count = data.count ? data.count : "";
        //var user_type = data.user_type ? data.user_type : ""
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("userList:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                let token_key = jwt_result.token_key;
                token_verify(sql_con, token_key, (err, token_result) => {
                    if (err) {
                        log.critical("userList:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        restaurant_dao.userDetails(sql_con, token_result[0].user_id, (err, userdetail) => {
                            if (err) {
                                log.critical("userdetail:check_userdetail", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (userdetail[0].user_type == 'Superadmin') {
                                restaurant_dao.viewUserList(sql_con, userdetail[0].restaurant_id, (err, user_List) => {
                                    if (err) {
                                        log.critical("userList:viewUserList", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else {
                                        response(res, 200, message.user_list, user_List, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.invalid_user_type, null, null)
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                })
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        })
    },

    /**
             * @typedef userCreate
             * @property {string} name.data.required - enter the first_name
             * @property {string} email.data.required - enter the email
             * @property {string} password.data.required - enter the password
             * @property {string} contact_number.data.required - enter the contact_number
             * @property {string} profile_pic.data.required 
             * @property {string} user_type.data.required - enter the type of user
             */

    /**
     * This function will return user for restaurant
     * @route POST /restaurant/userAdd
     * @group restaurant_user_crud 
     *  @security JWT
     * @param {userCreate.model} userCreate.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    addUser: (req, res) => {
        const md5 = req.app.get('md5');
        const sql_con = req.app.get('sql_con');
        token = req.headers['authorization'];
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("addUser:jwtVerify", "Database Query Error: " + err);
                response(res, 500, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("addUser:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        var data = req.body;
                        data.password = md5(data.password);
                        restaurant_dao.userDetails(sql_con, token_result[0].user_id, (err, userdetail) => {
                            if (err) {
                                log.critical("userdetail:check_userdetail", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (userdetail[0].user_type == 'Superadmin') {
                                restaurant_dao.userExistCheck(sql_con, data.email, (err, check_email) => {
                                    if (err) {
                                        log.critical("addUser:userExistCheck", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else if (check_email.length == 0) {
                                        restaurant_dao.userCreate(sql_con, data, token_result[0].user_id, userdetail[0].restaurant_id, (err, user_create) => {
                                            if (err) {
                                                log.critical("addUser:userCreate", "Database Query Error: " + err);
                                                response(res, 500, message.db_error, err, null);
                                            } else {
                                                response(res, 200, message.user_created, user_create, null);
                                            }
                                        })

                                    } else {
                                        response(res, 401, message.user_exists, null, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.invalid_user_type, null, null)
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                })
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        })
    },

    /**
   * @typedef userDelete
   * @property {string} user_id.data.required - enter the restaurant_id
   */

    /**
     * This function will return user for restaurant
     * @route put /restaurant/deleteUser
     * @group restaurant_user_crud 
     *  @security JWT
     * @param {userDelete.model} userDelete.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    userDelete: (req, res) => {
        const sql_con = req.app.get('sql_con');
        token = req.headers['authorization'];
        var data = req.body;
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("deleteUser:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("deleteUser:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        restaurant_dao.userDetails(sql_con, token_result[0].user_id, (err, userdetail) => {
                            if (err) {
                                log.critical("userdetail:check_userdetail", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (userdetail[0].user_type == 'Superadmin') {
                                restaurant_dao.checkUserId(sql_con, data.user_id, (err, check_id) => {
                                    if (err) {
                                        log.critical("deleteUser:checkUserId", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else if (check_id.length != 0) {
                                        restaurant_dao.deleteUser(sql_con, data.user_id, token_result[0].user_id, (err, result) => {
                                            if (err) {
                                                log.critical("deleteUser:deleteUser", "Database Query Error: " + err);
                                                response(res, 500, message.db_error, err, null);
                                            } else {
                                                response(res, 200, message.user_deleted, result, null);
                                            }
                                        })
                                    } else {
                                        response(res, 401, message.invalid_user, null, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.invalid_user_type, null, null)
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                })
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        })
    },


    /**
     * @typedef userEdit
     * @property {integer} user_id.data.required - enter the user_id
     * @property {string} name.data.required - enter the first_name
     * @property {string} email.data.required - enter the email
     * @property {string} password.data.required - enter the password
     * @property {string} contact_number.data.required - enter the contact_number
     * @property {string} profile_pic.data.required    
     * @property {string} user_type.data.required - enter the user_type
     * @property {integer} status.data.required - status of the user
     */

    /**
     * This function will return user for restaurant
     * @route PUT /restaurant/editUser
     * @group restaurant_user_crud 
     *  @security JWT
     * @param {userEdit.model} userEdit.body.required - the new point
     * @returns {Response} 200 - response object containing data, message and status code
     * @returns {Error}  default - Unexpected error
     */

    /**
     * @typedef Response
     * @property {integer} status
     * @property {string} message.required - response message
     * @property {data} response data payload
     */

    editUser: (req, res) => {
        const sql_con = req.app.get('sql_con');
        const md5 = req.app.get('md5');
        token = req.headers['authorization'];
        var data = req.body;
        jwtVerify(token, (err, jwt_result) => {
            if (err) {
                log.critical("editUser:jwtVerify", "Database Query Error: " + err);
                response(res, 403, message.jwt_error, err, null);
            } else if (jwt_result.length != 0 && jwt_result.name != 'JsonWebTokenError') {
                token_verify(sql_con, jwt_result.token_key, (err, token_result) => {
                    if (err) {
                        log.critical("editUser:token_verify", "Database Query Error: " + err);
                        response(res, 500, message.db_error, err, null);
                    } else if (token_result.length != 0) {
                        restaurant_dao.userDetails(sql_con, token_result[0].user_id, (err, userdetail) => {
                            if (err) {
                                log.critical("userdetail:check_userdetail", "Database Query Error: " + err);
                                response(res, 500, message.db_error, err, null);
                            } else if (userdetail[0].user_type == 'Superadmin') {
                                restaurant_dao.checkUserId(sql_con, data.user_id, (err, check_id) => {
                                    if (err) {
                                        log.critical("editUser:checkUserId", "Database Query Error: " + err);
                                        response(res, 500, message.db_error, err, null);
                                    } else if (check_id.length != 0) {
                                        data.password = md5(data.password)
                                        restaurant_dao.userEdit(sql_con, data, token_result[0].user_id, (err, user_edit) => {
                                            if (err) {
                                                log.critical("editUser:userEdit", "Database Query Error: " + err);
                                                response(res, 500, message.db_error, err, null);
                                            } else {
                                                response(res, 200, message.detail_updated, null, null);
                                            }
                                        })
                                    } else {
                                        response(res, 401, message.invalid_user, null, null);
                                    }
                                })
                            } else {
                                response(res, 401, message.invalid_user_type, null, null)
                            }
                        })
                    } else {
                        response(res, 403, message.invalid_token, err, null);
                    }
                })
            } else {
                response(res, 403, message.jwt_error, err, null);
            }
        })
    }



}
module.exports = { restaurantProfile }