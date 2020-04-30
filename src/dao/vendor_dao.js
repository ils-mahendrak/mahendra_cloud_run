let vendor_lib = function () { }

vendor_lib.prototype.viewUser = (sql_con, vendor_user_id, callback) => {
    sql_con.query('Select VU.name, VU.email, VU.contact_number, VU.profile_pic, VU.user_type, V.vendor_name, \
                    VU.status from vendor_user VU left join vendor V on VU.vendor_id = V.id where VU.id =?',
        [vendor_user_id], (err, result) => {
            if (err) {
                return callback(err)
            } else {
                return callback(null, result)
            }
        })
}

vendor_lib.prototype.userDetails = (sql_con, user_id, callback) => {
    sql_con.query('SELECT vendor_id, user_type from vendor_user where id =?', [user_id], (err, result) => {
        if (err) {
            return callback(err)
        } else {
            return callback(null, result)
        }
    })
}

vendor_lib.prototype.viewUserList = (sql_con, vendor_id, callback) => {
    sql_con.query('SELECT id, name, email, user_type, profile_pic, contact_number from vendor_user where status !=2 && vendor_id = ?', [vendor_id], (err, result) => {
        if (err) {
            return callback(err)
        } else {
            return callback(null, result)
        }
    })
}

vendor_lib.prototype.userExistCheck = (sql_con, email, callback) => {
    sql_con.query('SELECT * from vendor_user where email = ?', [email], function (err, result) {
        if (err) {
            return callback(err);
        } else
            return callback(null, result);
    });
}

vendor_lib.prototype.userCreate = (sql_con, data, user_id,vendor_id,callback) => {
    sql_con.query('INSERT INTO vendor_user (name, email, vendor_id, password, user_type, contact_number, profile_pic, created_by) VALUES \
    (?,?,?,?,?,?,?,?)',[data.name, data.email, vendor_id, data.password, data.user_type, data.contact_number, data.profile_pic, user_id],(err, result) =>{
        if (err) {
            return callback(err);
        } else {
            return callback(null, result)
        }
    })
}

vendor_lib.prototype.checkUserId = (sql_con, user_id, callback) => {
    sql_con.query('SELECT * from vendor_user where id=? ', [user_id], function (err, result) {
        if (err) {
            return callback(err);
        } {
            return callback(null, result);
        }
    });
}

vendor_lib.prototype.deleteUser = (sql_con, vendor_user_id, user_id, callback) => {
    sql_con.query('Update vendor_user set  status = "2", modified_by =? where id =?', [user_id, vendor_user_id], (err, result) => {
        if (err) {
            return callback(err);
        } else {
            return callback(null, result);
        }
    })
}

vendor_lib.prototype.userEdit = (sql_con, data, user_id, callback) => {
    sql_con.query(' Update vendor_user set name = ?, contact_number =?, password =?, email =?, profile_pic =?, user_type=?, modified_by = ? where id = ?',
        [data.name, data.contact_number, data.password, data.email, data.profile_pic, data.user_type, user_id, data.user_id], (err, result) => {
            if (err) {
                return callback(err);
            } else {
                return callback(null, result);
            }
        })
}

let vendor_lib_obj = new vendor_lib()
module.exports = { vendor_lib_obj }