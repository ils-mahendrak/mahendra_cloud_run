const dotenv = require('dotenv');

dotenv.config();

var vcap_services = process.env.VCAP_SERVICES;
var customize_string=process.env;

if (vcap_services) {
var dataParse= JSON.parse(vcap_services);
console.log(dataParse["user-provided"]);
customize_string=dataParse["user-provided"][0].credentials;
}
//console.log(customize_string);

if (vcap_services) {
    var dataParse= JSON.parse(vcap_services);
    console.log(dataParse["user-provided"]);
    customize_string=dataParse["user-provided"][0].credentials;
}
module.exports = {
    baseURL: customize_string.BASE_URL,
    use_env_variable: customize_string.NODE_ENV,
    port: customize_string.PORT,
    dbhost: customize_string.DB_HOST,
    dbusername: customize_string.DB_USER,
    dbpassword: customize_string.DB_PASS,
    dbname: customize_string.DB_NAME,
    swagger_origin: customize_string.SWAGGER_ORIGIN,
    jwt_key: customize_string.JWT_KEY,
    LOGLEVEL: customize_string.LOGLEVEL,
    project_id: customize_string.PROJECT_ID,
    bucket_name: customize_string.BUCKET_NAME,
    storage_env_template: customize_string.STORAGE_ENV_TEMPLATE,
    storage_env_sponsor: customize_string.STORAGE_ENV_SPONSOR,
    storage_destination: customize_string.STORAGE_DESTINATION,
    mail_host: customize_string.MAIL_HOST,
    mail_username: customize_string.MAIL_USERNAME,
    mail_password: customize_string.MAIL_PASSWORD,
    mail_headers_key: customize_string.MAIL_HEADERS_KEY,
    mail_headers_value: customize_string.MAIL_HEADERS_VALUE,
    mail_support_value: customize_string.SUPPORT_MAILID,
    reset_link: customize_string.RESET_LINK
    
};