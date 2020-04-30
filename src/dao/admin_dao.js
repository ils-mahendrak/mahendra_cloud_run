let admin_lib = function () { };


admin_lib.prototype.userLogin = (sql_con, email, password, callback) => {
    sql_con.query('SELECT name, email, id from sa_user where email = ? and password = ?', [email, password], (err, result) => {
        if (err) {
            return callback(err);
        } else {
            if (result.length != 0) {
                result[0].type = 'Superadmin'
                return callback(null, result)
            } else {
                sql_con.query('SELECT id ,restaurant_id ,name,email,user_type from restaurant_user where email = ? and password =? and status = 0', [email, password], (err, result) => {    // Need to add role parameter once set.
                    if (err) {
                        return callback(err)
                    }
                    else {
                        if (result.length != 0) {
                            result[0].type = 'RestaurantUser'
                            return callback(null, result)
                        } else {
                            sql_con.query('SELECT VU.id ,VU.vendor_id, name, role_name, email, user_type, VU.status, edit_credit, edit_pricing, view_credit, \
                                            access_price from vendor_user VU join vendor_role vr on VU.vendor_id=vr.vendor_id where email = ? and password =? \
                                            and VU.status = 0', [email, password], (err, result) => {
                                if (err) {
                                    return callback(err)
                                } else {
                                    if (result.length != 0) {
                                        result[0].type = 'VendorUser'
                                        return callback(null, result)
                                    } else {
                                        return callback(null, [])
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}

admin_lib.prototype.updateToken = (sql_con, id, random_string, user_type, callback) => {
    sql_con.query('INSERT INTO user_login (user_id,token,user_type) VALUES (?,?,?)', [id, random_string, user_type], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.viewVendor = (sql_con, vendor_id, callback) => {
    sql_con.query('SELECT VD.id, vendor_name, VU.name, VU.email, VU.contact_number, VU.profile_pic, VD.status from vendor as VD left join vendor_user as VU on VD.id = VU.vendor_id \
                    where VD.id = ? and VU.user_type = "Superadmin"', [vendor_id], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.vendorExistCheck = (sql_con, email, callback) => {
    sql_con.query('SELECT * from vendor_user where email = ?', [email], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.vendorCreate = (sql_con, data, user_id, callback) => {
    sql_con.query('INSERT INTO vendor (vendor_name, contact_number, created_by) VALUES (?,?,?)',
        [data.name, data.contact_number, user_id], function (err, result) {
            if (err) {
                return callback(err);
            } else {
                var vendor_id = result.insertId;
                sql_con.query('INSERT INTO vendor_user (name, email, vendor_id, password, user_type, contact_number, created_by) VALUES \
                        (?,?,?,?,?,?,?)', [data.name, data.email, vendor_id, data.password, 'Superadmin', data.contact_number, user_id], function (err, rows) {
                    if (err) {
                        return callback(err);
                    } else {
                        sql_con.query('INSERT INTO vendor_role (vendor_id, role_name, access_price, edit_pricing, view_credit, edit_credit, created_by) VALUES \
                        (?,?,?,?,?,?,?)', [rows.insertId, 'Superadmin', '1', '1', '1', '1', user_id], function (err, rows) {
                            if (err) {
                                return callback(err);
                            } else {
                                return callback(null, result.insertId);
                            }
                        });
                    }
                });
            }
        });
}

admin_lib.prototype.viewVendoreList = (sql_con, callback) => {
    sql_con.query('Select V.id, vendor_name, VU.name, VU.email from vendor as V left join (select * from vendor_user where user_type = "Superadmin") as VU on V.id = VU.vendor_id', function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.checkVendorId = (sql_con, vendor_id, callback) => {
    sql_con.query('SELECT * from vendor where id=? ', [vendor_id], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.vendorEdit = (sql_con, data, user_id, callback) => {
    sql_con.query('Update vendor set vendor_name = ?, contact_number =?, modified_by = ? where id = ?',
        [data.name, data.contact_number, user_id, data.vendor_id], function (err, result) {
            if (err) {
                return callback(err);
            } else {
                sql_con.query('Update vendor_user set name = ?, contact_number =?, modified_by = ? where vendor_id = ? and user_type = "Superadmin"',
                    [data.name, data.contact_number, user_id, data.vendor_id], function (err, rows) {
                        if (err) {
                            return callback(err);
                        } else {
                            return callback(null, result);
                        }
                    });
            }
        });
}

admin_lib.prototype.deleteVendor = (sql_con, vendor_id, user_id, callback) => {
    sql_con.query('Update vendor set status = "2", modified_by = ? where id = ?', [user_id, vendor_id], function (err, result) {
        if (err) {
            return callback(err);
        } else {
            sql_con.query('Update vendor_user set status = "2", modified_by = ? where vendor_id = ? ',
                [user_id, vendor_id], function (err, rows) {
                    if (err) {
                        return callback(err);
                    } else {
                        return callback(null, result);
                    }
                });
        }
    });
}

admin_lib.prototype.viewProduct = (sql_con, product_id, callback) => {
    sql_con.query('Select * from product where id = ?', [product_id], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.productExistCheck = (sql_con, product_name, callback) => {
    sql_con.query('SELECT * from product where product_name = ?', [product_name], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.productCreate = (sql_con, data, user_id, callback) => {
    sql_con.query('INSERT INTO product (product_id, product_name, product_description, product_origin, product_group, product_weight, product_measure, created_by) VALUES \
                        (?,?,?,?,?,?,?,?)', [data.product_key, data.product_name, data.product_description, data.product_origin, data.product_group, data.product_weight,
    data.product_measure, user_id], function (err, rows) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, rows.insertId);
        }
    });
}

admin_lib.prototype.viewProductList = (sql_con, callback) => {
    sql_con.query('Select id, product_id, product_name, product_description, product_origin, product_group, product_weight, product_measure from product', function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.checkProductId = (sql_con, product_id, callback) => {
    sql_con.query('SELECT * from product where id = ?', [product_id], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.productEdit = (sql_con, data, user_id, callback) => {
    sql_con.query('Update product set product_id = ?, product_name = ?, product_description = ?, product_origin = ?, product_group = ?, \
                    product_weight = ?, product_measure = ?, modified_by = ? where id = ?', [data.product_key, data.product_name, data.product_description,
    data.product_origin, data.product_group, data.product_weight, data.product_measure, user_id, data.product_id], function (err, result) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, result);
        }
    });
}

admin_lib.prototype.deleteProduct = (sql_con, product_id, user_id, callback) => {
    sql_con.query('Update product set status = "2", modified_by = ? where id = ?', [user_id, product_id], function (err, result) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, result);
        }
    });
}

admin_lib.prototype.viewRestaurant = (sql_con, restaurant_id, callback) => {
    sql_con.query('SELECT R.id, restaurant_name, RU.name, RU.email, R.contact_number, RU.profile_pic, R.status from restaurant as R left join restaurant_user as RU on R.id = RU.restaurant_id \
                    where R.id = ? and RU.user_type = "Superadmin"', [restaurant_id], function (err, result) {
        if (err) {
            return callback(err);
        } else
            console.log(result)
        return callback(null, result);
    });
}
admin_lib.prototype.viewRestaurantList = (sql_con, callback) => {
    sql_con.query('Select R.id, restaurant_name, RU.name, RU.email from restaurant as R left join (select * from restaurant_user where user_type = "Superadmin") as RU on R.id = RU.restaurant_id', function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.restaurantExistCheck = (sql_con, email, callback) => {
    sql_con.query('SELECT * from restaurant_user where email = ?', [email], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.restaurantCreate = (sql_con, data, user_id, callback) => {
    sql_con.query('INSERT INTO restaurant (restaurant_name, contact_number, created_by) VALUES (?,?,?)',
        [data.restaurant_name, data.contact_number, user_id], function (err, result) {
            if (err) {
                return callback(err);
            } else {
                var restaurant_id = result.insertId;
                sql_con.query('INSERT INTO restaurant_user (name, email, restaurant_id, password, user_type, contact_number, created_by) VALUES \
                        (?,?,?,?,?,?,?)', [data.name, data.email, restaurant_id, data.password, 'Superadmin', data.contact_number, user_id], function (err, rows) {
                    if (err) {
                        return callback(err);
                    } else {
                        sql_con.query('INSERT INTO restaurant_role (restaurant_id, role_name, role_parameter1,role_parameter2, created_by) VALUES \
                        (?,?,?,?,?,?,?)', [rows.insertId, 'Superadmin', '1', '1', user_id], function (err, rows) {
                            if (err) {
                                return callback(err);
                            } else {
                                return callback(null, result.insertId);
                            }
                        });
                    }
                });
            }
        });
}

admin_lib.prototype.checkRestaurantId = (sql_con, restaurant_id, callback) => {
    sql_con.query('SELECT * from restaurant where id=? ', [restaurant_id], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

admin_lib.prototype.restaurantEdit = (sql_con, data, user_id, callback) => {
    sql_con.query('Update restaurant set restaurant_name = ?, contact_number =?, modified_by = ? where id = ?',
        [data.restaurant_name, data.contact_number, user_id, data.restaurant_id], function (err, result) {
            if (err) {
                return callback(err);
            } else {
                sql_con.query('Update restaurant_user set name = ?, contact_number =?, modified_by = ? where restaurant_id = ? and user_type = "Superadmin"',
                    [data.name, data.contact_number, user_id, data.restaurant_id], function (err, rows) {
                        if (err) {
                            return callback(err);
                        } else {
                            return callback(null, result);
                        }
                    });
            }
        });
}

admin_lib.prototype.deleteRestaurant = (sql_con, restaurant_id, user_id, callback) => {
    sql_con.query('Update restaurant set status = "2", modified_by = ? where id = ?', [user_id, restaurant_id], function (err, result) {
        if (err) {
            return callback(err);
        } else {
            sql_con.query('Update restaurant_user set status = "2", modified_by = ? where restaurant_id = ? ',
                [user_id, restaurant_id], function (err, rows) {
                    if (err) {
                        return callback(err);
                    } else {
                        return callback(null, result);
                    }
                });
        }
    });
}

admin_lib.prototype.checkUser = (sql_con, email, password, callback) => {
    sql_con.query('SELECT name, email, id from sa_user where email = ?', [email], (err, result) => {
        if (err) {
            return callback(err);
        } else {
            if (result.length != 0) {
                result[0].type = 'Superadmin'
                return callback(null, result)
            } else {
                sql_con.query('SELECT id, restaurant_id, name, email, user_type from restaurant_user where email = ? and status = 0', [email], (err, result) => {    // Need to add role parameter once set.
                    if (err) {
                        return callback(err)
                    }
                    else {
                        if (result.length != 0) {
                            result[0].type = 'RestaurantUser'
                            return callback(null, result)
                        } else {
                            sql_con.query('SELECT VU.id, VU.vendor_id, name, role_name, email, user_type, VU.status, edit_credit, edit_pricing, view_credit, \
                                            access_price from vendor_user VU join vendor_role vr on VU.vendor_id=vr.vendor_id where email = ? \
                                            and VU.status = 0', [email], (err, result) => {
                                if (err) {
                                    return callback(err)
                                } else {
                                    if (result.length != 0) {
                                        result[0].type = 'VendorUser'
                                        return callback(null, result)
                                    } else {
                                        return callback(null, [])
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}


let admin_lib_obj = new admin_lib();
module.exports = { admin_lib_obj };