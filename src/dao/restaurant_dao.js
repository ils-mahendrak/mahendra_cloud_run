let restaurant_lib = function () { }

restaurant_lib.prototype.viewUser = (sql_con, restaurant_user_id, callback) => {
    sql_con.query('Select RU.name ,RU.email, RU.contact_number, RU.profile_pic, RU.user_type, R.restaurant_name, \
                    RU.status from restaurant_user RU left join restaurant R on RU.restaurant_id = R.id where RU.id =?',
        [restaurant_user_id], (err, result) => {
            if (err) {
                return callback(err)
            } else {
                return callback(null, result)
            }
        })
}

restaurant_lib.prototype.userDetails = (sql_con, user_id, callback) => {
    sql_con.query('SELECT restaurant_id,user_type from restaurant_user where id =?', [user_id], (err, result) => {
        if (err) {
            return callback(err)
        } else {
            return callback(null, result)
        }
    })
}

restaurant_lib.prototype.viewUserList = (sql_con, restaurant_id, callback) => {
    sql_con.query('SELECT id ,name,email,user_type,profile_pic,contact_number from restaurant_user where status != "2" && restaurant_id = ?', [restaurant_id], (err, result) => {
        if (err) {
            return callback(err)
        } else {
            return callback(null, result)
        }
    })
}

restaurant_lib.prototype.userExistCheck = (sql_con, email, callback) => {
    sql_con.query('SELECT * from restaurant_user where email = ?', [email], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

restaurant_lib.prototype.userCreate = (sql_con, data, user_id,restaurant_id,callback) => {
    sql_con.query('INSERT INTO restaurant_user (name, email, restaurant_id, password, user_type, contact_number,profile_pic, created_by) VALUES \
    (?,?,?,?,?,?,?,?)',[data.name, data.email, restaurant_id, data.password, data.user_type, data.contact_number, data.profile_pic, user_id],(err, result) =>{
        if (err) {
            return callback(err);
        } else {
            return callback(null, result)
        }
    })
}

restaurant_lib.prototype.checkUserId = (sql_con, user_id, callback) => {
    sql_con.query('SELECT * from restaurant_user where id=? ', [user_id], function (err, result) {
        if (err) {
            return callback(err);
        } {
            return callback(null, result);
        }
    });
}

restaurant_lib.prototype.deleteUser = (sql_con, restaurant_user_id, user_id, callback) => {
    sql_con.query('Update restaurant_user set  status = "2", modified_by =? where id =?', [user_id, restaurant_user_id], (err, result) => {
        if (err) {
            return callback(err);
        } else {
            return callback(null, result);
        }
    })
}

restaurant_lib.prototype.userEdit = (sql_con, data, user_id, callback) => {
    sql_con.query(' Update restaurant_user set name = ?, contact_number =?,password =?, status =?,email =?,profile_pic =?,user_type=?, modified_by = ? where id = ?',
        [data.name, data.contact_number, data.password,data.status, data.email, data.profile_pic, data.user_type, user_id, data.user_id], (err, result) => {
            if (err) {
                return callback(err);
            } else {
                return callback(null, result);
            }
        })
}

restaurant_lib_obj = new restaurant_lib()
module.exports = { restaurant_lib_obj }